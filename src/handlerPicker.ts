import BaseHandler from './handlers/base'
import xkcdHandler from './handlers/xkcd'
import { rootDomain } from './utils'
import * as _ from 'lodash'

const handlers: { [x: string]: BaseHandler[] } = {
  'xkcd.com': [new xkcdHandler()],
  'macstories.net': [new BaseHandler('https://i.imgur.com/0NqKUfZ.png')],
  'boardgamegeek.com': [
    new BaseHandler('https://i.imgur.com/R3qwQEJ.png', 'BoardGameGeek Bot')
  ],
  'escapistmagazine.com': [
    new BaseHandler('https://i.imgur.com/KCtI84z.png', 'ZeroPunctuation Bot')
  ]
}

export default function(urlWithID: string) {
  const [url, identifier] = urlWithID.split('|')
  const domainHanlders = handlers[rootDomain(url)]

  if (domainHanlders) {
    if (domainHanlders.length > 1) {
      let specificHandler = _.find(
        domainHanlders,
        h => h.identifier === identifier
      )
      // the first element in each array is the default
      return specificHandler ? specificHandler : domainHanlders[0]
    } else {
      return domainHanlders[0]
    }
  } else {
    // default fallback
    return new BaseHandler(null)
  }
}
