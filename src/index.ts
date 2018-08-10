import { parse as qsParse } from 'querystring'
import { parse as urlParse } from 'url'

import * as _ from 'lodash'
import * as dotenv from 'dotenv'
import { identifiersByDomain, pickHandler } from '@seymour/handlers'
import { validApiKey, validBody } from './middlewares'

import { IncomingMessage, ServerResponse } from 'http'
import * as getRawBody from 'raw-body'

// I think slack has types by now
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const WebClient = require('@slack/client').WebClient
const slackClient = new WebClient(process.env.SLACK_API_TOKEN)

/**
 * helper function for creating a nice response every time
 */
const respond = (response: ServerResponse, o: object, statusCode = 200) => {
  response.statusCode = statusCode
  response.end(JSON.stringify(o))
}

// const METHODS = 'GET'|| 'POST' || 'PUT' || 'DELETE'

const routesz: { [method: string]: { [path: string]: Route } } = {
  GET: {
    '/': {
      description: 'This route, an explanation of everything',
      handler: reply =>
        reply({
          routes: [
            {
              description:
                "mapping of domain to available identifiers. If a domain isn't listed (or you use a listed domain without an identifier), the default handler will be used",
              route: '/identifiers',
              method: 'GET'
            },
            {
              description: 'array of Slack channel objects',
              route: '/channels',
              method: 'GET'
            },
            {
              description: 'mark an item as read',
              params: {
                ts: "message's timestamp",
                channel: 'slack channel id'
              },
              route: '/read',
              method: 'POST'
            },
            {
              description: 'send an item to a channel',

              route: '/item',
              method: 'POST'
            }
          ]
        })
    },
    '/identifiers': {
      handler: reply => reply(identifiersByDomain),
      description:
        "mapping of domain to available identifiers. If a domain isn't listed (or you use a listed domain without an identifier), the default handler will be used"
    },
    '/channels': {
      protected: true,
      handler: async reply => {
        const channels = (await slackClient.channels.list()).channels.filter(
          (i: any) => !i.is_archived
        )
        reply(channels.map((channel: any) => _.pick(channel, ['id', 'name'])))
      },
      description: 'array of Slack channel objects'
    }
  },
  POST: {
    '/read': {
      handler: reply => reply({ text: '_marked as read_' }),
      description: 'mark an item as read'
    },
    '/item': {
      protected: true,
      handler: async (reply, body) => {
        const itemBody = body as ItemBody
        const handler = pickHandler(itemBody.url, itemBody.identifier)

        const response = await handler.postToChannel(
          itemBody.channel,
          itemBody.url,
          slackClient,
          itemBody.re_parse || false
        )
        reply(response, response.ok ? undefined : 500)
      },
      description: 'send an item to a channel',
      requiredProperties: ['url', 'channel'],
      properties: {
        channel: 'slack channel id',
        url: 'url to a linked post',
        identifier: 'string to mark specific content in a shared domain',
        re_parse: "use an extra parser if Slack doesn't unfurl the link"
      }
    }
  }
}

export const serve = async (
  request: IncomingMessage,
  response: ServerResponse
) => {
  const reply: replyFunc = respond.bind(null, response)

  try {
    // parse the url out
    const urlObj = urlParse(request.url!)
    const path = urlObj.pathname!
    const apiKey = qsParse(urlObj.query!).api_key as string

    if (path === '/') {
      // introspection function
      const routes: any[] = []

      for (const method in routesz) {
        for (const ppath in routesz[method]) {
          const routee = routesz[method][ppath]
          routes.push({
            method,
            path: ppath,
            ..._.pickBy(routee, k => k !== 'handler')
          })
        }
      }

      reply({ routes })
      return
    }

    let body
    if (request.method === 'POST') {
      try {
        body = JSON.parse(await getRawBody(request, { encoding: true }))
      } catch {
        body = {}
      }
    }

    const route: Route | undefined = _.get(routesz, [request.method!, path])
    if (route) {
      if (route.protected && !validApiKey(apiKey, reply)) {
        return
      }

      if (
        route.requiredProperties &&
        !validBody(body, route.requiredProperties, reply)
      ) {
        return
      }
      // might not even need the await? it'll just happen eventually
      await route.handler(reply, body)
    } else {
      reply({ ok: false }, 404)
    }
  } catch (e) {
    // this is for accidential things, not error handling
    reply({ message: e.message, trace: e.stack.split('\n') }, 500)
  }
}
