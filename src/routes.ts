import { pick, pickBy } from 'lodash'
import { identifiersByDomain, pickHandler } from './handlers'
import { WebClient } from '@slack/client'

import { Route, ItemBody, SlackChannelResponse } from './interfaces'

const slackClient = new WebClient(process.env.SLACK_API_TOKEN)

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
        const channelResponse = (await slackClient.conversations.list({
          exclude_archived: true,
          types: 'public_channel'
        })) as SlackChannelResponse
        reply(
          channelResponse.channels.map(channel => pick(channel, ['id', 'name']))
        )
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

        reply(
          await handler.postToChannel(
            itemBody.channel,
            itemBody.url,
            slackClient,
            itemBody.re_parse || false
          )
        )
      },
      description: 'send an item to a channel',
      requiredProperties: ['url', 'channel'],
      properties: {
        channel: '[string] slack channel id',
        url: '[string] url to post into Slack',
        identifier:
          '[string] denote that a link belongs to a specific subgroup in a shared domain',
        re_parse:
          "[boolean] use an extra parser if Slack doesn't unfurl the link"
      }
    }
  }
}

const introspectRoutes = () => {
  const res: any[] = []

  for (const method in routes) {
    for (const path in routes[method]) {
      const route = routes[method][path]
      res.push({
        method,
        path,
        ...pickBy(route, k => k !== 'handler')
      })
    }
  }
  return res
}

const routeDescriptions = introspectRoutes()

// so that this actually runs
routes.GET['/'] = {
  handler: reply => reply({ routes: routeDescriptions }),
  description: 'This route! Documentation for all the others'
}

export { routes }
