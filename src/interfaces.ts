import { WebAPICallResult } from '@slack/client'

export type replyFunc = (o: object, statusCode?: number) => void

export interface Route {
  handler: (reply: replyFunc, body?: object) => void
  protected?: boolean
  description: string
  requiredProperties?: string[]
  properties?: object
}

export interface ItemBody {
  channel: string
  url: string
  identifier?: string
  re_parse: boolean
}

export interface SlackChannel {
  id: string
  name: string
  is_channel: boolean
  created: number
  is_archived: boolean
  is_general: boolean
  unlinked: number
  creator: string
  name_normalized: string
  is_shared: boolean
  is_org_shared: boolean
  is_member: boolean
  is_private: boolean
  is_mpim: boolean
  members: string[]
  topic: {
    value: string
    creator: string
    last_set: number
  }
  purpose: {
    value: string
    creator: string
    last_set: number
  }
  previous_names: string[]
  num_members: number
}

export interface SlackChannelResult extends WebAPICallResult {
  channels: SlackChannel[]
}

// https://mercury.postlight.com/web-parser/
export interface MercuryResult {
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

export interface ItemBody {
  channel: string
  url: string
  identifier?: string
  re_parse: boolean
}

export interface SlackAttachment {
  title?: string
  text?: string
  title_link?: string
  fallback?: string
  image_url?: string
  color?: string
  footer?: string
}

// specific responses
export interface XkcdResponse {
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

export interface StackExchangeQuestion {
  tags: string[]
  owner: {
    reputation: number
    user_id: number
    user_type: string
    accept_rate: number
    profile_image: string
    display_name: string
    link: string
  }
  is_answered: boolean
  view_count: string
  answer_count: string
  score: string
  last_activity_date: string
  creation_date: string
  question_id: string
  link: string
  title: string
  body: string
  body_markdown: string
}

export interface StackExchangeResponse {
  items: StackExchangeQuestion[]
}
