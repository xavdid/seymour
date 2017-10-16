import * as got from 'got'
import BaseHandler from './base'

export default class extends BaseHandler {
  constructor() {
    super('https://i.imgur.com/se7HQtl.png', 'xkcd bot')
  }

  async formatter(url: string) {
    const comicNum = url.split('/').filter(i => i)[2] // trailing slash is ok
    const xkcd: xkcdResponse = JSON.parse(
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
        footer: xkcd.alt
      }
    ])
  }
}
