// this is only for local dev

import { createServer } from 'http'
import { serve } from '.'

const hostname = '127.0.0.1'
const port = 3000

const server = createServer(serve)

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
