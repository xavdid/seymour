import { createServer } from 'http'
import { listener } from './index'

// const hostname = '127.0.0.1'
const port = process.env.PORT || 3000

const server = createServer(listener)

export const start = () =>
  new Promise((resolve, reject) => {
    server.listen(port, resolve).on('error', reject)
  })

// used for testing
export const stop = () =>
  new Promise(resolve => {
    server.close(resolve)
  })

export const isRunning = () => server.listening

if (require.main === module) {
  start()
    .then(p => {
      console.log(`Server running at http://localhost:${port}`)
    })
    .catch(err => console.error(err.message))
}
