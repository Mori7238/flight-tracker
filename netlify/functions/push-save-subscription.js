const { getStore } = require('@netlify/blobs')

exports.handler = async function(event) {
  try {
    const body = JSON.parse(event.body || '{}')
    const subscription = body.subscription
    const watchlist = Array.isArray(body.watchlist) ? body.watchlist : []

    if (!subscription || !subscription.endpoint) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'missing subscription' }),
      }
    }

    const store = getStore('push-subscriptions')
    await store.set(subscription.endpoint, JSON.stringify({
      subscription,
      watchlist,
      updatedAt: Date.now(),
    }))

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
