// const got = import('got')
import * as got from 'got'

interface Handler {
  icon: string // :emoji: or url
  botName?: string
  formatter?: (url: string) => Promise<string> // stringified attachment array
}

interface xkcdResp {
  month: string
  num: number
  link: string
  year: string
  news: string
  safe_title: string
  transcript: string
  alt: string
  img: string
  title: string
  day: string
}

const handlers: { [domain: string]: Handler } = {
  'xkcd.com': {
    icon: 'https://i.imgur.com/se7HQtl.png',
    botName: 'xkcd bot',
    formatter: async url => {
      const comicNum = url.split('/').filter(i => i)[2] // trailing slash is ok
      const xkcd: xkcdResp = JSON.parse(
        (await got.get(`https://xkcd.com/${comicNum}/info.0.json`)).body
      )
      return JSON.stringify([
        {
          title: xkcd.safe_title,
          title_link: `https://xkcd.com/${xkcd.num}/`,
          fallback: `xkcd comic #${xkcd.num}`,
          image_url: xkcd.img,
          color: '#96A8C8'
        },
        {
          fallback: `xkcd comic #${xkcd.num} alt text`,
          // fields: [
          //   {
          //     title: 'alt-text',
          //     value: 'blah blah alt text'
          //   }
          // ],
          footer: xkcd.alt
        }
      ])
    }
  },
  'macstories.net': { icon: 'https://i.imgur.com/0NqKUfZ.png' },
  'boardgamegeek.com': { botName: 'BoardGameGeek Bot', icon: '' }
}

export = handlers
