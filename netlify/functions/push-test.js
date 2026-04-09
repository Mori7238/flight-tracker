const { getStore } = require('@netlify/blobs')
const { setupVapid } = require('./_vapid')

exports.handler = async function() {
  try {
    const { webpush } = setupVapid()
    const store = getStore('push-subscriptions')
    const list = await store.list()

    if (!list.blobs || list.blobs.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Enable push first, then try test push.' }),
      }
    }

    const first = await store.get(list.blobs[0].key, { type: 'json' })
    await webpush.sendNotification(
      first.subscription,
      JSON.stringify({
        title: 'Flight Alert test',
        body: 'Push is working on your iPhone web app.',
      })
    )

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: String(err) }),
    }
  }
}
