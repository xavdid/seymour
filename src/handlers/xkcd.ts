import * as got from 'got'
import BaseHandler from './base'
import { XkcdResponse } from '../interfaces'

export default class extends BaseHandler {
  constructor() {
    super('https://i.imgur.com/se7HQtl.png', 'xkcd bot')
  }

  public async formatter(url: string) {
    const comicNum = url.split('/').filter(i => i)[2] // trailing slash is ok
    const xkcd: XkcdResponse = (await got.get(
      `https://xkcd.com/${comicNum}/info.0.json`,
      { json: true }
    )).body

    return [
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
    ]
  }
}
