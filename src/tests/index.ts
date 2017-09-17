import * as test from 'tape'

import baseHandler from '../handlers/base'
import xkcdHandler from '../handlers/xkcd'
import picker from '../handlerPicker'

import { rootDomain, botNamer } from '../utils'

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

  test('xkcd handler', t => {
    const xkcd = new xkcdHandler()
    t.true(xkcd.botName)
    xkcd.formatter('https://xkcd.com/1889/').then(attachmentStr => {
      let attachments = JSON.parse(attachmentStr)
      t.assert(attachments[0].title_link)
      t.assert(attachments[1].fallback.includes('alt text'))
      t.end()
    })
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
    const url = 'https://www.youtube.com/watch?v=eeqb_vTkGeM|crash_course'
    const basicYoutube = picker(url)
    basicYoutube.slackOpts(url).then(([text, opts]) => {
      t.true(opts.username.includes('Crash'))
      t.end()
    })
  })

  test('club macstories handler', t => {
    const url = 'https://mailchi.mp/macstories/ywfp76wxh2sv'
    const basicYoutube = picker(url)
    basicYoutube.slackOpts(url).then(([text, opts]) => {
      t.true(opts.username.includes('Club'))
      t.end()
    })
  })

  t.end()
})

test('utils', t => {
  t.assert(
    rootDomain(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    ) === 'kickstarter.com'
  )

  t.assert(rootDomain('https://blah.thing.com/blah/id/3') === 'thing.com')

  t.assert(
    botNamer(
      'https://www.kickstarter.com/projects/882053899/the-name-of-the-wind-art-deck/posts/1990046'
    ) === 'Kickstarter Bot'
  )
  t.end()
})
