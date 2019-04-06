import {
  ChatPostMessageArguments,
  MessageAttachment,
  WebClient
} from '@slack/client'
import { SlackPostMessageResponse } from '../interfaces'
import { botNamer, COLOR, fetchArticleData, rootDomain } from '../utils'

export default class BaseHandler {
  // can this be made into an options object and still take advantage of the shorthand?
  constructor(public icon?: string, public botName?: string) {}

  // this gets subclassed
  // should return slack attachment array
  public async formatter(url: string): Promise<MessageAttachment[]> {
    return new Array()
  }

  // calls mercury parser if a site doesn't have good metadata
  public async reParse(url: string): Promise<MessageAttachment[]> {
    const articleData = await fetchArticleData(url)
    const cleanedText = articleData.excerpt.replace('&hellip;', '\u2026') // unicode ellipsis

    return [
      {
        title: articleData.title,
        title_link: articleData.url,
        text: cleanedText,
        image_url: articleData.lead_image_url
      }
    ]
  }

  public async slackOpts(url: string, reParse?: boolean) {
    const opts: { text: string; username: string } & Partial<
      ChatPostMessageArguments
    > = {
      unfurl_links: true,
      unfurl_media: true,
      text: url,
      username: ''
    }

    if (this.icon) {
      if (this.icon[0] === ':') {
        opts.icon_emoji = this.icon
      } else {
        opts.icon_url = this.icon
      }
    } else {
      // this is awesome
      opts.icon_url = `https://logo.clearbit.com/${rootDomain(url)}`
    }

    opts.username = this.botName || botNamer(url)

    if (reParse) {
      opts.attachments = await this.reParse(url) // process input
    } else {
      opts.attachments = await this.formatter(url) // merge overwrite objects in here somewhere
    }

    if (opts.attachments.length) {
      opts.text = ''
    }

    // add button
    opts.attachments = opts.attachments.concat([
      {
        fallback: 'never seen, but required',
        callback_id: 'comic_1234_xyz', // content doesn't matter, but needs to be there
        color: COLOR,
        actions: [
          {
            name: 'read',
            text: 'Mark as Read',
            type: 'button'
          }
        ]
      }
    ])

    return opts
  }

  public async postToChannel(
    channel: string,
    url: string,
    slackClient: WebClient,
    reParse: boolean
  ) {
    const opts = await this.slackOpts(url, reParse)

    const response = (await slackClient.chat.postMessage({
      channel,
      ...opts
    })) as SlackPostMessageResponse
    return response.message
  }
}
