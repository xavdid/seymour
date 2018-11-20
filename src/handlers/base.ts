import { botNamer, fetchArticleData, COLOR } from '../utils'
import { WebClient, ChatPostMessageArguments } from '@slack/client'
import { MessageAttachment } from '@slack/client'

export default class BaseHandler {
  // can this be made into an options object and still take advantage of the shorthand?
  constructor(
    public icon?: string,
    public botName?: string,
    public identifier?: string
  ) {}

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
    const opts: { text: string } & Partial<ChatPostMessageArguments> = {
      unfurl_links: true,
      unfurl_media: true,
      text: url
    }

    if (this.icon) {
      if (this.icon[0] === ':') {
        opts.icon_emoji = this.icon
      } else {
        opts.icon_url = this.icon
      }
    } else {
      // that api that gives the site logos for free (clearbit?)
      // opts.icon_url = ''
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
        // fallback: 'never seen',
        // callback_id: 'comic_1234_xyz', // this doesn't matter?
        color: COLOR,
        // attachment_type: 'default',
        actions: [
          {
            // name: 'read',
            text: 'Mark as Read',
            type: 'button'
            // value: 'read2'
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
    // do things
    const opts = await this.slackOpts(url, reParse)
    try {
      const res = await slackClient.chat.postMessage({ channel, ...opts })
      console.log(res)
      return { ok: true }
    } catch (e) {
      console.log(e)
      return { ok: false }
    }
  }
}
