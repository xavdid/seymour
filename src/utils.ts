import { parse } from '@postlight/mercury-parser'
import * as got from 'got'
import { ServerResponse } from 'http'
import { capitalize, difference } from 'lodash'
import * as parser from 'url-parse'

import { ItemBody, replyFunc } from './interfaces'

export const COLOR = '#FEDE00' // seymour yellow

export const validApiKey = (apiKey: string | undefined, reply: replyFunc) => {
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
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(o))
}

export const rootDomain = (url: string) => {
  const parts = parser(url).host.split('.')
  while (parts.length > 2) {
    parts.shift()
  }

  return parts.join('.')
}

export const botNamer = (url: string) => {
  const domain = rootDomain(url)
  const parts = domain.split('.')
  // probably just 2 parts
  return `${capitalize(parts[0])} Bot`
}

export const fetchArticleData = async (url: string) => {
  const articleData = await parse(url)
  return articleData
}
