import * as got from 'got'
import BaseHandler from './base'
import * as striptags from 'striptags'
import { StackExchangeResponse } from '../interfaces'
import { MessageAttachment } from '@slack/client'

export default class extends BaseHandler {
  constructor() {
    super('https://i.imgur.com/aHypqGZ.png', 'StackOverflow Bot')
  }

  public async formatter(url: string): Promise<MessageAttachment[]> {
    const questionNum = url.split('/').filter(i => i)[3] // trailing slash is ok
    const response: StackExchangeResponse = (await got.get(
      `https://api.stackexchange.com/2.2/questions/${questionNum}`,
      {
        json: true,
        query: {
          site: 'stackoverflow',
          filter: '!LZg2mkNj0UY)kfcbe1UUlT' // include body
        }
      }
    )).body
    const questionDetails = response.items[0]

    return [
      {
        title: questionDetails.title,
        title_link: questionDetails.link,
        fallback: questionDetails.link,
        color: '#FF9900',
        author_name: questionDetails.owner.display_name,
        author_link: questionDetails.owner.link,
        author_icon: questionDetails.owner.profile_image,
        text: striptags(questionDetails.body),
        fields: [
          {
            title: 'Tags',
            value: questionDetails.tags.map(t => `\`${t}\``).join(', '),
            short: true
          }
          // add a field for site if i'm adding multiples stackexchange sites
        ],
        mrkdwn_in: ['fields']
      }
    ]
  }
}
