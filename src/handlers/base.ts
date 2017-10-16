import { botNamer } from '../utils'

export default class BaseHandler implements Handler {
  icon?: string
  identifier?: string
  botName?: string

  constructor(icon?: string, botName?: string, identifier?: string) {
    this.icon = icon
    this.botName = botName
    this.identifier = identifier
  }

  // this gets subclassed
  // should return json string of slack attachments
  formatter(url: string) {
    return Promise.resolve('')
  }

  processManual(url: string, data: DataBody) {
    return JSON.stringify([
      {
        title: data.title,
        text: data.text,
        title_link: url,
        image_url: data.image,
        color: data.color
      }
    ])
  }

  async slackOpts(url: string, manualData?: DataBody) {
    let opts: any = {
      unfurl_links: true,
      unfurl_media: true
    }

    if (this.icon) {
      if (this.icon[0] === ':') {
        opts.icon_emoji = this.icon
      } else {
        opts.icon_url = this.icon
      }
    }

    opts.username = this.botName || botNamer(url)

    let text: string | null = url
    const attachments = await this.formatter(url) // merge overwrite objects in here somewhere

    if (manualData) {
      opts.attachments = this.processManual(url, manualData) // process input
    } else if (attachments) {
      opts.attachments = attachments
    }

    if (opts.attachments) {
      text = null
    }

    return [text, opts]
  }

  async postToChannel(
    channel: string,
    url: string,
    slackClient: any,
    manualData?: DataBody
  ) {
    // do things
    const [text, opts] = await this.slackOpts(url, manualData)
    try {
      const res = await slackClient.chat.postMessage(channel, text, opts)
      return { ok: true }
    } catch (e) {
      return { ok: false }
    }
  }
}
