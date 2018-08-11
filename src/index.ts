import { parse as qsParse } from 'querystring'
import { parse as urlParse } from 'url'

import { get } from 'lodash'
import { validApiKey, validBody, respond } from './utils'

import { IncomingMessage, ServerResponse } from 'http'
import * as getRawBody from 'raw-body'
import { Route, replyFunc } from './interfaces'

import { routes } from './routes'

export const listener = async (
  request: IncomingMessage,
  response: ServerResponse
) => {
  const reply: replyFunc = respond.bind(null, response)

  try {
    const urlObj = urlParse(request.url!)
    const path = urlObj.pathname!
    const apiKey = qsParse(urlObj.query!).api_key as string

    let body
    if (request.method === 'POST') {
      try {
        body = JSON.parse(await getRawBody(request, { encoding: true }))
      } catch {
        body = {}
      }
    }

    const route: Route | undefined = get(routes, [request.method!, path])
    if (!route) {
      reply({ ok: false }, 404)
      return
    }

    if (route.protected && !validApiKey(apiKey, reply)) {
      return
    }

    if (
      route.requiredProperties &&
      !validBody(body, route.requiredProperties, reply)
    ) {
      return
    }

    // might await, but I don't think I need it
    route.handler(reply, body)
  } catch (e) {
    // this is for accidential things, not error handling
    reply({ message: e.message, trace: e.stack.split('\n') }, 500)
  }
}
