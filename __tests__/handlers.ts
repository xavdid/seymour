import { load } from 'dotenv'
load()

import xkcdHandler from '../src/handlers/xkcd'
import { identifiersByDomain, pickHandler } from '../src/handlerUtils'

import { rootDomain, fetchArticleData } from '../src/utils'

// need to test koa itself

describe('handlers', () => {
  test('kickstarter handler', async () => {
    const base = pickHandler(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    )
    const [text, opts] = await base.slackOpts(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    )
    expect(opts.icon_url.includes('kickstarter')).toBeTruthy()
  })

  test('xkcd handler', async () => {
    const xkcd = new xkcdHandler()
    expect(xkcd.botName).toBeTruthy()
    const attachments = await xkcd.formatter('https://xkcd.com/1889/')
    expect(attachments[0].title_link).toBeTruthy()
    expect(attachments[1].fallback).toContain('alt text')
  })

  test('youtube handler', async () => {
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM'
    const basicYoutube = pickHandler(url)
    const [text, opts] = await basicYoutube.slackOpts(url)
    expect(opts.username.includes('Youtube')).toBeTruthy()
  })

  test('crashcourse youtube handler', () => {
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM'
    const basicYoutube = pickHandler(url, 'crash_course')
    basicYoutube.slackOpts(url).then(([text, opts]) => {
      expect(opts.username.includes('Crash')).toBeTruthy()
    })
  })

  test('club macstories handler', () => {
    const url = 'https://mailchi.mp/macstories/blahblah'
    const macstories = pickHandler(url, 'club_macstories')
    macstories.slackOpts(url).then(([text, opts]) => {
      expect(opts.username.includes('Club')).toBeTruthy()
    })
  })
})

describe('utils', () => {
  test('rootdomain', async () => {
    expect(
      rootDomain(
        'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
      )
    ).toEqual('kickstarter.com')

    expect(rootDomain('https://blah.sub.the.thing.com/blah/id/3')).toEqual(
      'thing.com'
    )

    expect(Object.keys(identifiersByDomain).length).toBeGreaterThan(0)
  })
  test('fetchArticleData', async () => {
    expect(
      (await fetchArticleData(
        'https://blog.codinghorror.com/the-existential-terror-of-battle-royale/'
      )).lead_image_url
    ).toBeTruthy()
  })
})
