import { Express, json, urlencoded, ErrorRequestHandler } from 'express'

import * as _ from 'lodash'
import * as dotenv from 'dotenv'
import { identifiersByDomain, pickHandler } from '@seymour/handlers'
import { validateApiKey, validateInput } from './middlewares'

import { IncomingMessage, ServerResponse } from 'http'
import * as getRawBody from 'raw-body'

export const reply = async (
  request: IncomingMessage,
  response: ServerResponse
) => {
  // parse the url out
  if (request.method === 'GET') {
    response.end(JSON.stringify({ ok: true, query: qs.parse(request.url) }))
    return
  } else if (request.method === 'POST') {
    const body = await getRawBody(request, { encoding: true })
    response.end(body)
    console.log('after')
  } else {
    response.statusCode = 405
    response.end(JSON.stringify({ ok: false, status: 405 }))
  }
}

export const bootstrap = (app: Express) => {
  app.use(json())
  app.use(urlencoded({ extended: false }))

  if (app.get('env') === 'development') {
    dotenv.config()
  }

  const WebClient = require('@slack/client').WebClient
  const slackClient = new WebClient(process.env.SLACK_API_TOKEN)

  // give json instructions
  app.get('/', async (req, res) => {
    res.json({
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
          params: { ts: "message's timestamp", channel: 'slack channel id' },
          route: '/read',
          method: 'POST'
        },
        {
          description: 'send an item to a channel',
          params: {
            channel: 'slack channel id',
            identifier:
              '[optional] string to mark specific content in a shared domain',
            url: '[optional] url to a linked post',
            re_parse:
              "[optional, bool] use an extra parser if Slack doesn't unfurl the link"
          },
          route: '/item',
          method: 'POST'
        }
      ]
    })
  })

  app.get('/identifiers', (req, res) => {
    res.json(identifiersByDomain)
  })

  // list channels
  app.get('/channels', async (req, res, next) => {
    // i don't love this pattern, but I need to forward the error to the error handler
    if (!validateApiKey(req.query.api_key, next)) {
      return
    }

    const channels = (await slackClient.channels.list()).channels.filter(
      (i: any) => !i.is_archived
    )
    res.json(channels.map((channel: any) => _.pick(channel, ['id', 'name'])))
  })

  // mark item as read
  app.post('/read', async (req, res, next) => {
    res.status(200).json({
      text: '_marked as read_'
    })
  })

  // send item to slack
  app.post('/item', async (req, res, next) => {
    const body: ItemBody = req.body
    if (
      !(validateApiKey(req.query.api_key, next) && validateInput(body, next))
    ) {
      return
    }

    console.log('going anyway')
    // console.log(body.url, body.identifier)
    const handler = pickHandler(body.url, body.identifier)
    // console.log(handler)

    const response = await handler.postToChannel(
      body.channel,
      body.url,
      slackClient,
      body.re_parse || false
    )
    if (!response.ok) {
      res.status(500)
    }
    res.json(response)
  })

  // error handler
  const errHandler: ErrorRequestHandler = (err, req, res, next) => {
    res.status(err.status || 500).send({ message: err.message })
  }
  app.use(errHandler)

  // const listener = app.listen(process.env.PORT || 1234, () => {
  //   console.log(`app is listening on http://localhost:${listener.address().port}`)
  // })
  return app
}
