import * as _ from 'lodash'
import { rootDomain } from '../utils'

import BaseHandler from './base'
import xkcdHandler from './xkcd'
import StackOverflowHandler from './stackOverflow'
import AppShopperHandler from './appShopper'

const handlers: { [domain: string]: { [identifier: string]: BaseHandler } } = {
  'appshopper.com': { _default: new AppShopperHandler() },
  'boardgamegeek.com': {
    _default: new BaseHandler(
      'https://i.imgur.com/R3qwQEJ.png',
      'BoardGameGeek Bot'
    )
  },
  'codinghorror.com': {
    _default: new BaseHandler(
      'https://i.imgur.com/8Dm4XWr.png',
      'CodingHorror Bot'
    )
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
      'https://www.kickstarter.com/download/kickstarter-logo-k-color.png'
    )
  },
  'macstories.net': {
    _default: new BaseHandler('https://i.imgur.com/0NqKUfZ.png')
  },
  'mailchi.mp': {
    club_macstories: new BaseHandler(
      'https://i.imgur.com/v8SJ8jz.png',
      'Club Macstories Bot'
    )
  },
  'pbs.org': { vicky_writing: new BaseHandler('', 'Vicky Bot') },
  'reddit.com': {
    _default: new BaseHandler('https://i.imgur.com/JBSDcz8.png'),
    cfb: new BaseHandler('https://i.imgur.com/48nSd44.png', 'CFB Bot')
  },
  'stackoverflow.com': {
    _default: new StackOverflowHandler()
  },
  'steamcommunity.com': {
    slay_the_spire: new BaseHandler('', 'SlayTheSpire Bot')
  },
  'xkcd.com': {
    _default: new xkcdHandler()
  },
  'youtube.com': {
    _default: new BaseHandler('https://i.imgur.com/CnVgbNY.png'),
    crash_course: new BaseHandler(
      'https://i.imgur.com/Ee5zivD.png',
      'CrashCouse Bot'
    ),
    zero_punctuation: new BaseHandler(
      'https://i.imgur.com/KCtI84z.png',
      'ZeroPunctuation Bot'
    )
  }
}

// domains with identifiers
// this would be better in a functional style

export const identifiersByDomain: _.Dictionary<string[]> = _.fromPairs(_.filter(
  _.map(handlers, (identifierMap, domain) => [
    domain,
    Object.keys(identifierMap).filter(k => !k.startsWith('_'))
  ]),
  ([domain, identifiers]) => identifiers.length
) as Array<[string, string[]]>)

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
