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
    const { api_key: apiKey, ...pathObj } = qsParse(urlObj.query!) as {
      [x: string]: string
    }

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
      reply({ ok: false, message: 'not found (or wrong method)' }, 404)
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

    // await so that errors bubble up here
    await route.handler(reply, pathObj, body)
  } catch (e) {
    if (process.env.NODE_ENV === 'test') {
      console.log(e)
    }
    reply({ message: e.message, trace: e.stack.split('\n') }, 500)
  }
}
