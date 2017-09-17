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
  ],
  'kickstarter.com': [
    new BaseHandler(
      'https://www.kickstarter.com/download/kickstarter-logo-k-color.png'
    )
  ],
  'mailchi.mp': [
    new BaseHandler('https://i.imgur.com/v8SJ8jz.png', 'Club Macstories Bot')
  ],
  'youtube.com': [
    new BaseHandler('https://i.imgur.com/CnVgbNY.png'),
    new BaseHandler(
      'https://i.imgur.com/Ee5zivD.png',
      'CrashCouse Bot',
      'crash_course'
    )
  ]
}

export default function(urlMaybeWithID: string) {
  const [url, identifier] = urlMaybeWithID.split('|')
  const domainHandlers = handlers[rootDomain(url)]
  if (domainHandlers) {
    if (domainHandlers.length > 1) {
      const specificHandler = _.find(
        domainHandlers,
        h => h.identifier === identifier
      )
      // the first element in each array is the default
      return specificHandler ? specificHandler : domainHandlers[0]
    } else {
      return domainHandlers[0]
    }
  } else {
    // default fallback
    return new BaseHandler(null)
  }
}
