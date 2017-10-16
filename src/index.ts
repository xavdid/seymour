import * as Koa from 'koa'
import * as router from 'koa-route'
import * as bodyParser from 'koa-bodyparser'
import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import pickHanlder from './handlerPicker'

const app = new Koa()
if (app.env === 'development') {
  dotenv.config()
}

app.use(bodyParser())

// const token = process.env.SLACK_API_TOKEN

const WebClient = require('@slack/client').WebClient
const slackClient = new WebClient(process.env.SLACK_API_TOKEN)

// top level error handler
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    ctx.status = e.status || 500
    ctx.body = {
      message: e.message
    }
  }
})

// give json instructions
app.use(
  router.get('/', async ctx => {
    ctx.body = {
      routes: [
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
            text: '[optional] message',
            url: '[optional] url to a linked post',
            data: {
              NOTE: 'data object is entirely optional',
              title: '[optional] overwite the name of the link',
              image: '[optional] provide a header image',
              content: '[optional] truncated content of article',
              color: '[optional] hex string for sidebar color'
            }
          },
          route: '/item',
          method: 'POST'
        }
      ]
    }
  })
)

// list channels
app.use(
  router.get('/channels', async (ctx, next) => {
    await next()
    const channels = (await slackClient.channels.list()).channels.filter(
      (i: any) => !i.is_archived
    )
    ctx.body = channels.map((channel: any) => _.pick(channel, ['id', 'name']))
  })
)

// mark item as read
app.use(
  router.post('/read', async (ctx, next) => {
    await next()
    const b = ctx.request.body
    ctx.body = { name: b.name }
  })
)

// send item to slack
app.use(
  router.post('/item', async (ctx, next) => {
    await next()
    const body: ItemBody = ctx.request.body

    const handler = pickHanlder(body.url, body.identifier)

    ctx.body = await handler.postToChannel(
      body.channel,
      body.url,
      slackClient,
      body.data
    )
    if (!ctx.body.ok) {
      ctx.status = 500
    }
  })
)

// vdalidate API key
app.use(async (ctx, next) => {
  await next()
  if (ctx.query.api_key !== process.env.API_KEY) {
    ctx.throw(403, 'invalid or missing api key')
  }
})

// validate input
app.use(async (ctx, next) => {
  await next()
  const body: ItemBody = ctx.request.body

  if (ctx.method === 'POST' && !(body.channel && body.url)) {
    ctx.throw(
      400,
      `missing params: ${[
        body.channel ? null : 'channel',
        body.url ? null : 'url'
      ].filter(i => i)}`
    )
  }
  if (ctx.method === 'POST' && body.url.includes('|')) {
    ctx.throw(
      400,
      'Bars in url no longer supported, pass identifier separately'
    )
  }
})

app.listen(process.env.PORT || 1234)
