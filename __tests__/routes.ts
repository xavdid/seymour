import * as dotenv from 'dotenv'
dotenv.config()

import { createServer } from 'http'
import * as got from 'got'

import { serve } from '../src'

const hostname = '127.0.0.1'
const port = 3000
const baseUrl = `http://${hostname}:${port}`

const server = createServer(serve)

const testChannel = 'C6RBZ562Z'

describe('server', () => {
  beforeAll(async () => {
    server.listen(port, hostname, () => {
      console.log(`Server running at ${baseUrl}`)
      return Promise.resolve()
    })
  })

  test('should load routes', async () => {
    const response = (await got(`${baseUrl}/`, {
      json: true
    })).body

    expect(response.routes).toBeTruthy()
    expect(response.routes.length).toBeGreaterThan(3)
  })

  test('should fetch identifiers', async () => {
    const response = (await got(`${baseUrl}/identifiers`, {
      json: true
    })).body

    expect(response['mailchi.mp']).toBeTruthy()
    expect(response.blah).toBeUndefined()
    expect(Object.keys(response).length).toBeGreaterThan(3)
  })

  describe('channels', () => {
    test('should fetch channels', async () => {
      const response = (await got(`${baseUrl}/channels`, {
        query: { api_key: process.env.API_KEY },
        json: true
      })).body

      expect(Object.keys(response).length).toBeGreaterThan(3)
      expect(response[0].id).toBeTruthy()
      expect(response[0].name).toBeTruthy()
    })

    test('should require API key', async () => {
      const response = await got(`${baseUrl}/channels`, {
        json: true,
        throwHttpErrors: false
      })
      expect(response.statusCode).toEqual(403)
      expect(response.body.message.includes('api key')).toBeTruthy()
    })
  })

  describe('items', () => {
    test('should post items', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url: 'https://xkcd.com/2030/',
          channel: testChannel
        }
      })).body

      expect(response).toEqual({ ok: true })
    })

    test('should validate params', async () => {
      const response = await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url: 'https://xkcd.com/2030/'
        },
        throwHttpErrors: false
      })

      expect(response.statusCode).toEqual(400)
      expect(response.body.message.includes('missing')).toBeTruthy()
      expect(response.body.message.includes('channel')).toBeTruthy()
    })
  })

  afterAll(() => server.close())
})
