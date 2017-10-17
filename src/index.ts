import * as Koa from 'koa'
import * as router from 'koa-route'
import * as bodyParser from 'koa-bodyparser'
import * as dotenv from 'dotenv'
import * as _ from 'lodash'
import pickHanlder from './handlerPicker'
import { validateApiKey, validateInput } from './middlewares'

const app = new Koa()
if (app.env === 'development') {
  dotenv.config()
}

app.use(bodyParser())

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
              text: '[optional] truncated content of article',
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
    validateApiKey(ctx)

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
    ctx.status = 200
    // returned json overwrites the original message
    // per step 4 here: https://api.slack.com/interactive-messages#lifecycle_of_a_typical_interactive_message_flow
    ctx.body = {
      text: '_marked as read_'
    }
  })
)

// send item to slack
app.use(
  router.post('/item', async (ctx, next) => {
    await next()

    const body: ItemBody = ctx.request.body
    validateApiKey(ctx)
    validateInput(ctx, body)

    console.log(body.url, body.identifier)
    const handler = pickHanlder(body.url, body.identifier)
    console.log(handler)

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

const listener = app.listen(process.env.PORT || 1234, () => {
  console.log(`app is listening on http://localhost:${listener.address().port}`)
})
