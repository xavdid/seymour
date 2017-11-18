// https://mercury.postlight.com/web-parser/
interface MercuryResult {
  title: string
  author?: string
  content: string // html string
  excerpt: string
  date_published?: string
  lead_image_url: string
  url: string
  // domain: string
  word_count: number
}

interface ItemBody {
  channel: string
  url: string
  identifier?: string
  re_parse: boolean
}

interface SlackAttachment {
  title?: string
  text?: string
  title_link?: string
  fallback?: string
  image_url?: string
  color?: string
  footer?: string
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
