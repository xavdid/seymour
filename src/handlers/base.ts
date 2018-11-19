import { botNamer, fetchArticleData, COLOR } from '../utils'
import { SlackAttachment } from '../interfaces'

export default class BaseHandler {
  public icon?: string
  public identifier?: string
  public botName?: string

  constructor(icon?: string, botName?: string, identifier?: string) {
    this.icon = icon
    this.botName = botName
    this.identifier = identifier
  }

  // this gets subclassed
  // should return slack attachment array
  public async formatter(url: string) {
    return new Array()
  }

  // calls mercury parser
  public async reParse(url: string): Promise<SlackAttachment[]> {
    const articleData = await fetchArticleData(url)
    const cleanedText = articleData.excerpt.replace('&hellip;', '\u2026') // unicode ellipsis
    // could all color here, somehow
    return [
      {
        title: articleData.title,
        title_link: articleData.url,
        text: cleanedText,
        image_url: articleData.lead_image_url
      }
    ]
  }

  public async slackOpts(
    url: string,
    reParse?: boolean
  ): Promise<[string | null, { [x: string]: any }]> {
    const opts: any = { unfurl_links: true, unfurl_media: true }

    if (this.icon) {
      if (this.icon[0] === ':') {
        opts.icon_emoji = this.icon
      } else {
        opts.icon_url = this.icon
      }
    }

    opts.username = this.botName || botNamer(url)

    // text might be in attachments, is nullable
    let text: string | null = url

    if (reParse) {
      opts.attachments = await this.reParse(url) // process input
    } else {
      opts.attachments = await this.formatter(url) // merge overwrite objects in here somewhere
    }

    if (opts.attachments.length > 0) {
      text = null
    }

    // add button, stringify
    opts.attachments = JSON.stringify(
      opts.attachments.concat([
        {
          fallback: 'never seen',
          callback_id: 'comic_1234_xyz', // this doesn't matter?
          color: COLOR,
          attachment_type: 'default',
          actions: [
            {
              name: 'read',
              text: 'Mark as Read',
              type: 'button',
              value: 'read2'
            }
          ]
        }
      ])
    )

    return [text, opts]
  }

  public async postToChannel(
    channel: string,
    url: string,
    slackClient: any,
    reParse: boolean
  ) {
    // do things
    const [text, opts] = await this.slackOpts(url, reParse)
    try {
      const res = await slackClient.chat.postMessage(channel, text, opts)
      return { ok: true }
    } catch (e) {
      console.log(e)
      return { ok: false }
    }
  }
}
