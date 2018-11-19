import BaseHandler from './handlers/base'

import { rootDomain } from './utils'
import * as _ from 'lodash'

import { handlers } from './handlers'

// domains with identifiers
// this would be better in a functional style
export const identifiersByDomain: _.Dictionary<string[]> = _.fromPairs(_.filter(
  _.map(handlers, (domainHandlers, domain) => {
    const identifiers = domainHandlers
      .map(h => h.identifier)
      .filter(Boolean) as string[]

    return [domain, identifiers]
  }),
  ([domain, identifiers]) => identifiers.length
) as Array<[string, string[]]>)

export const pickHandler = (url: string, identifier?: string) => {
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
