// core
interface DataBody {
  title?: string
  text?: string // truncated content of article
  image?: string // header image
  color?: string // hex string for sidebar color
}

interface ItemBody {
  channel: string
  url: string
  identifier?: string
  data?: DataBody
}

interface Handler {
  icon?: string // :emoji: or url
  identifier?: string
  botName?: string
  formatter(url: string): Promise<any[]> // array of slack attachments
}

// specific responses
interface xkcdResponse {
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
