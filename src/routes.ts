import { pick, pickBy } from 'lodash'
import * as dotenv from 'dotenv'
import { identifiersByDomain, pickHandler } from '@seymour/handlers/lib'

import { Route, ItemBody } from './interfaces'

// I think slack has types by now
if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

const WebClient = require('@slack/client').WebClient
const slackClient = new WebClient(process.env.SLACK_API_TOKEN)

const rootDescription = 'This route! Documentation for all the others'

const routes: { [method: string]: { [path: string]: Route } } = {
  GET: {
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
        reply(channels.map((channel: any) => pick(channel, ['id', 'name'])))
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
        channel: '[string] slack channel id',
        url: '[string] url to post into slack',
        identifier:
          '[string] denote that a link belongs to a specific subgroup in a shared domain',
        re_parse:
          "[boolean] use an extra parser if Slack doesn't unfurl the link"
      }
    }
  }
}

const introspectRoutes = () => {
  const res: any[] = [
    {
      method: 'GET',
      path: '/',
      description: rootDescription
    }
  ]

  for (const method in routes) {
    for (const ppath in routes[method]) {
      const routee = routes[method][ppath]
      res.push({
        method,
        path: ppath,
        ...pickBy(routee, k => k !== 'handler')
      })
    }
  }
  return res
}

const routeDescriptions = introspectRoutes()

// so that this actually runs
routes.GET['/'] = {
  handler: reply => reply({ routes: routeDescriptions }),
  description: rootDescription
}

export { routes }
