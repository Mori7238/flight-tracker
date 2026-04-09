const { readEnv } = require('./_vapid')

exports.handler = async function () {
  const { publicKey } = readEnv()
  return {
    statusCode: publicKey ? 200 : 500,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify({
      publicKey,
      ok: !!publicKey,
      error: publicKey ? null : 'VAPID_PUBLIC_KEY is missing on Netlify',
    }),
  }
}
