import { difference } from 'lodash'
import { ItemBody, replyFunc } from './interfaces'
import { ServerResponse } from 'http'

export const validApiKey = (apiKey: string, reply: replyFunc) => {
  if (!process.env.API_KEY) {
    reply({ message: 'env variables not loaded' }, 500)
    return false
  } else if (apiKey !== process.env.API_KEY) {
    reply({ message: 'invalid or missing api key' }, 403)
    return false
  }
  return true
}

export const validBody = (
  body: ItemBody,
  requiredProps: string[],
  reply: replyFunc
) => {
  const missingProps = difference(requiredProps, Object.keys(body))
  if (missingProps.length) {
    reply({ message: `missing body properties: ${missingProps}` }, 400)
    return false
  }
  return true
}

export const respond = (
  response: ServerResponse,
  o: object,
  statusCode = 200
) => {
  response.statusCode = statusCode
  response.end(JSON.stringify(o))
}
