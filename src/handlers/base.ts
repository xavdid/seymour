import { botNamer } from '../utils'
import { Handler } from '../interfaces'

export default class BaseHandler implements Handler {
  icon: string | null
  identifier?: string
  botName?: string

  constructor(icon: string | null, botName?: string, identifier?: string) {
    this.icon = icon
    this.botName = botName
    this.identifier = identifier
  }

  formatter(url: string) {
    return Promise.resolve('')
  }

  async slackOpts(url: string) {
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
    const attachments = await this.formatter(url)
    if (attachments) {
      opts.attachments = attachments
      text = null
    }

    return [text, opts]
  }

  async postToChannel(channel: string, url: string, slackClient: any) {
    // do things
    const [text, opts] = await this.slackOpts(url)
    try {
      const res = await slackClient.chat.postMessage(channel, text, opts)
      return { ok: true }
    } catch (e) {
      return { ok: false }
    }
  }
}
