const { getStore } = require('@netlify/blobs')
const { setupVapid } = require('./_vapid')

function expand(code) {
  const set = new Set()
  const clean = (code || '').toUpperCase().replace(/\s+/g, '')
  if (!clean) return []

  clean.split(/[\/|,]+/).forEach(c => {
    const x = c.trim()
    if (!x) return
    set.add(x)
    let m = x.match(/^SL(\d+)$/)
    if (m) set.add(`TLM${m[1]}`)
    m = x.match(/^TLM(\d+)$/)
    if (m) set.add(`SL${m[1]}`)
  })

  return [...set]
}

exports.handler = async function() {
  try {
    const { webpush } = setupVapid()
    const store = getStore('push-subscriptions')
    const list = await store.list()
    if (!list.blobs || list.blobs.length === 0) {
      return { statusCode: 200, body: 'no subscriptions' }
    }

    const pointRes = await fetch('https://api.airplanes.live/v2/point/18.7883/98.9853/250')
    const pointData = pointRes.ok ? await pointRes.json() : { ac: [] }
    const liveSet = new Set(
      (Array.isArray(pointData.ac) ? pointData.ac : [])
        .map(p => ((p.flight || p.callsign || '') + '').trim().toUpperCase().replace(/\s+/g, ''))
        .filter(Boolean)
    )

    for (const item of list.blobs) {
      const saved = await store.get(item.key, { type: 'json' })
      if (!saved || !saved.subscription) continue

      const watchlist = Array.isArray(saved.watchlist) ? saved.watchlist : []
      let matched = null

      for (const raw of watchlist) {
        const aliases = expand(raw)
        if (aliases.some(a => liveSet.has(a))) {
          matched = raw
          break
        }
      }

      if (matched) {
        try {
          await webpush.sendNotification(
            saved.subscription,
            JSON.stringify({
              title: 'Flight Alert',
              body: `${matched} is visible on live radar now.`,
            })
          )
        } catch (_) {}
      }
    }

    return { statusCode: 200, body: 'ok' }
  } catch (err) {
    return { statusCode: 500, body: String(err) }
  }
}
