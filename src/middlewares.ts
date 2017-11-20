import { Context } from 'koa'
import * as _ from 'lodash'

export const validateApiKey = (ctx: Context) => {
  if (!process.env.API_KEY) {
    ctx.throw(500, 'env variables not loaded')
  } else if (ctx.query.api_key !== process.env.API_KEY) {
    ctx.throw(403, 'invalid or missing api key')
  }
}

export const validateInput = (ctx: Context, body: ItemBody) => {
  if (!(body.channel && body.url)) {
    ctx.throw(
      400,
      `missing params: ${_.filter([
        body.channel ? null : 'channel',
        body.url ? null : 'url'
      ])}`
    )
  }
}
