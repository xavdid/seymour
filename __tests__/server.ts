import { load } from 'dotenv'
load()

import * as got from 'got'
import { start, stop } from '../src/server'
import { SlackMessage, ItemBody } from '../src/interfaces'

const testChannel = 'C6RBZ562Z'

describe('server', () => {
  let baseUrl: string
  beforeAll(async () => {
    const addr = await start()
    baseUrl = `http://localhost:${addr.port}`
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
    test('should post items with a generic handler', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url: 'https://en.wikipedia.org/wiki/December_6',
          channel: testChannel
        } as ItemBody
      })).body as SlackMessage

      // most links have the preview and the the button
      expect(response.attachments.length).toEqual(1)
      expect(response.username.includes('Wiki')).toBeTruthy()
    })

    test('should post items with a handler', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url:
            'https://www.macstories.net/news/google-integrates-assistant-app-with-siri-shortcuts-on-ios/',
          channel: testChannel
        } as ItemBody
      })).body as SlackMessage

      // most links have the preview and the the button
      expect(response.attachments.length).toEqual(1)
      expect(response.username.includes('MacSt')).toBeTruthy()
    })

    test('should post items with a re-parser', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url: 'https://www.factorio.com/blog/post/fff-269',
          channel: testChannel,
          re_parse: true
        } as ItemBody
      })).body as SlackMessage

      // most the content and the the button
      expect(response.attachments.length).toEqual(2)
      expect(response.username.includes('Factorio')).toBeTruthy()
    })

    test('should post items with an identifier', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url:
            'https://www.pbs.org/newshour/science/why-the-fattest-bear-is-the-picture-of-health',
          channel: testChannel,
          identifier: 'vicky_writing'
        } as ItemBody
      })).body as SlackMessage

      // the button
      expect(response.attachments.length).toEqual(1)
      expect(response.username.includes('Vicky')).toBeTruthy()
    })

    test('should post items that fall back to a generic handler', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url:
            'https://www.pbs.org/newshour/science/why-the-fattest-bear-is-the-picture-of-health',
          channel: testChannel
        } as ItemBody
      })).body as SlackMessage

      // the button
      expect(response.attachments.length).toEqual(1)
      expect(response.username.includes('Vicky')).toBeFalsy()
    })

    test('should post items with custom handlers', async () => {
      const response = (await got(`${baseUrl}/item`, {
        query: { api_key: process.env.API_KEY },
        method: 'POST',
        json: true,
        body: {
          url: 'https://xkcd.com/2030/',
          channel: testChannel
        } as ItemBody
      })).body as SlackMessage

      // xkcd has the image, the subtext, and the button
      expect(response.attachments.length).toEqual(3)
      expect(response.username.includes('xkcd')).toBeTruthy()
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

  afterAll(() => stop())
})
