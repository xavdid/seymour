import { load } from 'dotenv'
load()

import { identifiersByDomain, pickHandler } from '../src/handlers'
import xkcdHandler from '../src/handlers/xkcd'

import { rootDomain, fetchArticleData } from '../src/utils'

describe('handlers', () => {
  test('kickstarter handler', async () => {
    const base = pickHandler(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    )
    const opts = await base.slackOpts(
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
    const opts = await basicYoutube.slackOpts(url)
    expect(opts.username.includes('Youtube')).toBeTruthy()
  })

  test('crashcourse youtube handler', async () => {
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM'
    const basicYoutube = pickHandler(url, 'crash_course')
    const opts = await basicYoutube.slackOpts(url)
    expect(opts.username.includes('Crash')).toBeTruthy()
  })

  test('club macstories handler', async () => {
    const url = 'https://mailchi.mp/macstories/blahblah'
    const macstories = pickHandler(url, 'club_macstories')
    const opts = await macstories.slackOpts(url)
    expect(opts.username.includes('Club')).toBeTruthy()
  })
})

describe('utils', () => {
  describe('rootdomain', async () => {
    expect(
      rootDomain(
        'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
      )
    ).toEqual('kickstarter.com')

    expect(
      rootDomain('https://blah.sub.the.thing.com/blah/id/3?name=fake.com')
    ).toEqual('thing.com')

    expect(Object.keys(identifiersByDomain).length).toBeGreaterThan(0)
  })
  describe('fetchArticleData', async () => {
    expect(
      (await fetchArticleData(
        'https://blog.codinghorror.com/the-existential-terror-of-battle-royale/'
      )).lead_image_url
    ).toBeTruthy()
  })
})
