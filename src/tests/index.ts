import * as test from 'tape'

import baseHandler from '../handlers/base'
import xkcdHandler from '../handlers/xkcd'
import picker, { identifiersByDomain } from '../handlerPicker'

import { rootDomain, botNamer, fetchArticleData } from '../utils'
import * as dotenv from 'dotenv'
dotenv.config()

// need to test koa itself

test('handlers', t => {
  test('kickstarter handler', t => {
    const base = picker(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    )
    return base
      .slackOpts(
        'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
      )
      .then(([text, opts]) => {
        t.true(opts.icon_url.includes('kickstarter'))
        t.end()
      })
  })

  test('xkcd handler', async t => {
    const xkcd = new xkcdHandler()
    t.true(xkcd.botName)
    const attachments = (await xkcd.formatter(
      'https://xkcd.com/1889/'
    )) as any[] // not sure why there's no interfaces here...
    t.assert(attachments[0].title_link)
    t.assert(attachments[1].fallback.includes('alt text'))
    t.end()
  })

  test('youtube handler', t => {
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM'
    const basicYoutube = picker(url)
    basicYoutube.slackOpts(url).then(([text, opts]) => {
      t.true(opts.username.includes('Youtube'))
      t.end()
    })
  })

  test('crashcourse youtube handler', t => {
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM'
    const basicYoutube = picker(url, 'crash_course')
    basicYoutube.slackOpts(url).then(([text, opts]) => {
      t.true(opts.username.includes('Crash'))
      t.end()
    })
  })

  test('club macstories handler', t => {
    const url = 'https://mailchi.mp/macstories/blahblah'
    const macstories = picker(url, 'club_macstories')
    macstories.slackOpts(url).then(([text, opts]) => {
      t.true(opts.username.includes('Club'))
      t.end()
    })
  })

  t.end()
})

test('utils', async t => {
  t.assert(
    rootDomain(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    ) === 'kickstarter.com'
  )

  t.assert(
    rootDomain('https://blah.sub.the.thing.com/blah/id/3') === 'thing.com'
  )
  t.assert(Object.keys(identifiersByDomain).length > 0)

  t.true(
    (await fetchArticleData(
      'https://blog.codinghorror.com/the-existential-terror-of-battle-royale/'
    )).lead_image_url
  )
  t.end()
})
