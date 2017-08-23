import * as Koa from 'koa'
import * as router from 'koa-route'
import * as bodyParser from 'koa-bodyparser'
import * as parser from 'url-parse'
import * as handlers from './handlers'

const app = new Koa()
if (app.env === 'development') {
  import('dotenv').then(dotenv => {
    dotenv.config()
  })
}

app.use(bodyParser())

const token = process.env.SLACK_API_TOKEN

const WebClient = require('@slack/client').WebClient
const web = new WebClient(token)

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
            attachments: '[optional] extra information about the post'
          },
          route: '/item',
          method: 'POST'
        }
      ]
    }
  })
)

interface ItemBody {
  channel: string
  url: string
  attachments?: string
}

const capitalize = (word: string) => {
  word = word.toLowerCase()
  return word.charAt(0).toUpperCase() + word.slice(1)
}

const rootDomain = (url: string) => {
  const parts = parser(url).host.split('.')
  if (parts.length === 3) {
    // skip subdomain
    return [parts[1], parts[2]].join('.')
  } else {
    // probably just 2 parts, unlikely to be 4
    return parts.join('.')
  }
}

const botNamer = (domain: string) => {
  const parts = domain.split('.')
  // probably just 2 parts
  return `${capitalize(parts[0])} Bot`
}

app.use(
  router.get('/channels', async ctx => {
    ctx.body = await web.channels.list()
  })
)

app.use(
  router.post('/read', async (ctx, next) => {
    const b = ctx.request.body
    ctx.body = { name: b.name }
  })
)

app.use(
  router.post('/item', async (ctx, next) => {
    const body: ItemBody = ctx.request.body
    if (!(body.channel && body.url)) {
      ctx.status = 400
      ctx.body = {
        messages: [
          body.channel ? null : 'Missing `channel` param',
          body.url ? null : 'Missing `url` param'
        ].filter(i => i)
      }
      return
    }
    const domain = rootDomain(body.url)
    const handler = handlers[domain]
    let opts: any = {
      unfurl_links: true,
      unfurl_media: true
    }
    let text: string | null = body.url

    if (handler) {
      if (handler.formatter) {
        opts.attachments = await handler.formatter(body.url)
        text = null
      }

      if (handler.icon[0] === ':') {
        opts.icon_emoji = handler.icon
      } else {
        opts.icon_url = handler.icon
      }

      opts.username = handler.botName
    }

    opts.username = opts.username || botNamer(domain)

    try {
      console.log(opts)
      const res = await web.chat.postMessage(body.channel, text, opts)
      ctx.body = { ok: true }
    } catch (e) {
      ctx.body = { ok: false }
    }
  })
)

app.listen(1234)
