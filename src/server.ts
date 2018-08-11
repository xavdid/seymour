import { createServer } from 'http'
import { listener } from './index'

const hostname = '127.0.0.1'
const port = 3000

const server = createServer(listener).on('listening', () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})

export const start = () =>
  new Promise((resolve, reject) => {
    server.listen(port, hostname, resolve).on('error', reject)
  })

export const stop = () =>
  new Promise(resolve => {
    server.close(resolve)
  })

export const isRunning = () => server.listening

if (require.main === module) {
  start().catch(err => console.error(err.message))
}
