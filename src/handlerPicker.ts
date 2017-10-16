import BaseHandler from './handlers/base'
import xkcdHandler from './handlers/xkcd'
import { rootDomain } from './utils'
import * as _ from 'lodash'

const handlers: { [x: string]: BaseHandler[] } = {
  'boardgamegeek.com': [
    new BaseHandler('https://i.imgur.com/R3qwQEJ.png', 'BoardGameGeek Bot')
  ],
  'escapistmagazine.com': [
    new BaseHandler('https://i.imgur.com/KCtI84z.png', 'ZeroPunctuation Bot')
  ],
  'factorio.com': [new BaseHandler('https://i.imgur.com/MGVDlo1.png')],
  'kickstarter.com': [
    new BaseHandler(
      'https://www.kickstarter.com/download/kickstarter-logo-k-color.png'
    )
  ],
  'macstories.net': [new BaseHandler('https://i.imgur.com/0NqKUfZ.png')],
  'mailchi.mp': [
    new BaseHandler(), // other mailchimp stuff shouldn't automatically be macstories
    new BaseHandler(
      'https://i.imgur.com/v8SJ8jz.png',
      'Club Macstories Bot',
      'club_macstories'
    )
  ],
  'xkcd.com': [new xkcdHandler()],
  'youtube.com': [
    new BaseHandler('https://i.imgur.com/CnVgbNY.png'),
    new BaseHandler(
      'https://i.imgur.com/Ee5zivD.png',
      'CrashCouse Bot',
      'crash_course'
    )
  ]
}

export const identifiers = _.flatten(_.values(handlers))
  .filter(h => h.identifier)
  .map(h => h.identifier) as string[] // missing values are filtered

export default function(url: string, identifier?: string) {
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
    return new BaseHandler()
  }
}
