import { NextFunction } from 'express'
import * as _ from 'lodash'

export const validateApiKey = (apiKey: string, next: NextFunction) => {
  if (!process.env.API_KEY) {
    const e = new Error('env variables not loaded')
    // e.status
    next(e)
    // { message: })
  } else if (apiKey !== process.env.API_KEY) {
    const e = new Error('invalid or missing api key')
    // e.status
    next(e)
    // { status: 403, message:  })
  }
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
  }
}
