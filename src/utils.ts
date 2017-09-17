import * as parser from 'url-parse'

const capitalize = (word: string) => {
  word = word.toLowerCase()
  return word.charAt(0).toUpperCase() + word.slice(1)
}

const rootDomain = (url: string) => {
  const parts = parser(url).host.split('.')
  if (parts.length === 3) {
    // skip subdomain
    return [parts[1], parts[2]].join('.')
  } else {
    // probably just 2 parts, unlikely to be 4
    return parts.join('.')
  }
}

const botNamer = (url: string) => {
  const domain = rootDomain(url)
  const parts = domain.split('.')
  // probably just 2 parts
  return `${capitalize(parts[0])} Bot`
}

export { capitalize, rootDomain, botNamer }
