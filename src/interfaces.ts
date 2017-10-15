// core
export interface ItemBody {
  channel: string
  url: string
  data?: {
    title?: string
    image?: string // header image
    // subtitle?: string
    content?: string // truncated content of article
    color?: string // hex string for sidebar color
  }
}

export interface Handler {
  icon: string | null // :emoji: or url
  identifier?: string
  botName?: string
  formatter(url: string): Promise<string> // stringified attachment array
}

// specific responses
export interface xkcdResponse {
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
