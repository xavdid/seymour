import * as _ from 'lodash'
import { rootDomain } from '../utils'

import BaseHandler from './base'
import xkcdHandler from './xkcd'
import StackOverflowHandler from './stackOverflow'
import AppShopperHandler from './appShopper'

const handlers: { [domain: string]: { [identifier: string]: BaseHandler } } = {
  'appshopper.com': { _default: new AppShopperHandler() },
  'boardgamegeek.com': {
    _default: new BaseHandler(undefined, 'BoardGameGeek Bot')
  },
  'codinghorror.com': {
    _default: new BaseHandler(undefined, 'CodingHorror Bot')
  },
  'escapistmagazine.com': {
    _default: new BaseHandler(
      'https://i.imgur.com/KCtI84z.png',
      'ZeroPunctuation Bot'
    )
  },
  'factorio.com': {
    _default: new BaseHandler('https://i.imgur.com/MGVDlo1.png')
  },
  'instagram.com': {
    catana_comics: new BaseHandler(
      'https://i.imgur.com/gLFXkfZ.png',
      'CatanaComics Bot'
    )
  },
  'kickstarter.com': {
    _default: new BaseHandler(
      // I prefer the dark logo to the fat white one
      'https://i.imgur.com/1MKAeXw.png'
    )
  },
  'macstories.net': {
    _default: new BaseHandler(
      'https://i.imgur.com/0NqKUfZ.png',
      'MacStories Bot'
    )
  },
  'mailchi.mp': {
    club_macstories: new BaseHandler(
      'https://i.imgur.com/v8SJ8jz.png',
      'Club Macstories Bot'
    )
  },
  'pbs.org': { vicky_writing: new BaseHandler(undefined, 'VickyWriting Bot') },
  'reddit.com': {
    _default: new BaseHandler('https://i.imgur.com/JBSDcz8.png'),
    cfb: new BaseHandler('https://i.imgur.com/48nSd44.png', 'CFB Bot')
  },
  'stackoverflow.com': {
    _default: new StackOverflowHandler()
  },
  'steamcommunity.com': {
    slay_the_spire: new BaseHandler(
      'https://i.imgur.com/KpKNPWk.png',
      'SlayTheSpire Bot'
    )
  },
  'xkcd.com': {
    _default: new xkcdHandler()
  },
  'youtube.com': {
    _default: new BaseHandler(undefined, 'YouTube Bot'),
    crash_course: new BaseHandler(
      'https://i.imgur.com/Ee5zivD.png',
      'CrashCouse Bot'
    ),
    zero_punctuation: new BaseHandler(
      'https://i.imgur.com/KCtI84z.png',
      'ZeroPunctuation Bot'
    ),
    last_week_tonight: new BaseHandler(
      'https://i.imgur.com/mu1U2SQ.png',
      'LastWeekTonight Bot'
    ),
    cgp_grey: new BaseHandler('https://i.imgur.com/9CxWy5T.png', 'CGP Grey Bot')
  }
}

// domains with identifiers
const identifierPairs = _.chain(handlers)
  .map((identifierMap, domain) => [
    domain,
    Object.keys(identifierMap).filter(k => !k.startsWith('_'))
  ])
  .filter(([domain, identifiers]) => identifiers.length)
  .value() as Array<[string, string[]]>

export const identifiersByDomain = _.fromPairs(identifierPairs)

export const pickHandler = (url: string, identifier?: string): BaseHandler => {
  const domain = rootDomain(url)

  return identifier
    ? _.get(
        handlers,
        [domain, identifier],
        _.get(handlers, [domain, '_default'], new BaseHandler())
      )
    : _.get(handlers, [domain, '_default'], new BaseHandler())
}
