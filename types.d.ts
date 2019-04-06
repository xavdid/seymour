declare module '@postlight/mercury-parser' {
  export function parse(
    url: string
  ): Promise<{
    title: string
    author?: string
    content: string // html string
    excerpt: string
    date_published?: string
    lead_image_url: string
    url: string
    // domain: string
    word_count: number
  }>
}
