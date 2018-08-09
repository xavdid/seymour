interface ItemBody {
  channel: string
  url: string
  identifier?: string
  re_parse: boolean
}

type replyFunc = (o: object, statusCode?: number) => void

interface Route {
  handler: (reply: replyFunc, body?: object) => void
  protected?: boolean
  description: string
  requiredProps?: string[]
}
