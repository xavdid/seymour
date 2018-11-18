import { createServer } from 'http'
import { listener } from './index'

const port = process.env.PORT || 1234

const server = createServer(listener)

export const start: () => Promise<{
  port: number
  family: string
  address: string
}> = () =>
  new Promise((resolve, reject) => {
    server
      .listen({ port }, () => {
        resolve(server.address())
      })
      .on('error', reject)
  })

// used for testing
export const stop = () =>
  new Promise((resolve, reject) => {
    server.close(resolve).on('error', reject)
  })

if (require.main === module) {
  start().then(addr => {
    console.log(`Server running on port :${addr.port}`)
  })
}
