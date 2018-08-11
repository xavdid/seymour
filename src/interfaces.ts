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
