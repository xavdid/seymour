// import * as parser from 'url-parse'
// import * as got from 'got'

// export const capitalize = (word: string) => {
//   word = word.toLowerCase()
//   return word.charAt(0).toUpperCase() + word.slice(1)
// }

// export const rootDomain = (url: string) => {
//   const parts = parser(url).host.split('.')
//   while (parts.length > 2) {
//     parts.shift()
//   }

//   return parts.join('.')
// }

// export const botNamer = (url: string) => {
//   const domain = rootDomain(url)
//   const parts = domain.split('.')
//   // probably just 2 parts
//   return `${capitalize(parts[0])} Bot`
// }

// export const fetchArticleData = async (url: string) => {
//   const articleData: MercuryResult = (await got(
//     'https://mercury.postlight.com/parser',
//     {
//       query: { url },
//       headers: { 'x-api-key': process.env.MERCURY_API_KEY },
//       json: true
//     }
//   )).body
//   return articleData
// }

// export const COLOR = '#FEDE00' // seymour yellow
