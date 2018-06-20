import { NextFunction, Response } from 'express'
import * as _ from 'lodash'

export const validateApiKey = (
  apiKey: string,
  res: Response,
  next: NextFunction
) => {
  if (!process.env.API_KEY) {
    next({ message: 'env variables not loaded' })
    return false
  } else if (apiKey !== process.env.API_KEY) {
    res.status(403)
    next({ message: 'invalid or missing api key', status: 403 })
    return false
  }
  return true
}

export const validateInput = (body: ItemBody, next: NextFunction) => {
  if (!(body.channel && body.url)) {
    next({
      status: 400,
      message: `missing params: ${_.filter([
        body.channel ? null : 'channel',
        body.url ? null : 'url'
      ])}`
    })
    return false
  }
  return true
}
