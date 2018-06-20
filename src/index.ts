// import * as Koa from 'koa'
// import * as router from 'koa-route'
// import * as bodyParser from 'koa-bodyparser'
import * as express from 'express'
import * as bodyParser from 'body-parser'

import * as _ from 'lodash'
import * as dotenv from 'dotenv'
import pickHanlder, { identifiersByDomain } from './handlerPicker'
import { validateApiKey, validateInput } from './middlewares'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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
  validateApiKey(req.query.api_key, next)

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
  validateApiKey(req.query.api_key, next)
  validateInput(body, next)

  console.log('going anyway')
  // console.log(body.url, body.identifier)
  const handler = pickHanlder(body.url, body.identifier)
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
const errHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  res.status(err.status || 500).send({ message: err.message })
}
app.use(errHandler)

const listener = app.listen(process.env.PORT || 1234, () => {
  console.log(`app is listening on http://localhost:${listener.address().port}`)
})
