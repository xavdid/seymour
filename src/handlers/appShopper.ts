import * as got from 'got'
import BaseHandler from './base'
import * as striptags from 'striptags'
import { fetchArticleData } from '../utils'

const parseAppshopperPrice = (s: string) => {
  const prices = s.match(/^\$?(free|\d+\.\d+) was \$?(free|\d+\.\d+)/i)
  if (prices) {
    return {
      is: prices[1],
      was: prices[2]
    }
  } else {
    return {
      is: 'parse error',
      was: 'parse error'
    }
  }
}

export default class extends BaseHandler {
  constructor() {
    super('https://i.imgur.com/gJz8r3f.png', 'AppShopper Bot')
  }

  async formatter(url: string) {
    const articleData = await fetchArticleData(url)
    const { is, was } = parseAppshopperPrice(articleData.excerpt)
    // for some reason, appshopper comes out of mercury with the app image in the url spot
    return [
      {
        // pretext: 'An app is on sale!',
        title: `${articleData.title}`,
        title_link: url,
        text: `$${was} :arrow_lower_right: *$${is}*`,
        image_url: articleData.url,
        mrkdwn_in: ['text']
      }
    ]
  }
}
