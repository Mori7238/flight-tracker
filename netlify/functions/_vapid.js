const webpush = require('web-push')

function normalizeBase64(input) {
  return String(input || '').trim().replace(/-/g, '+').replace(/_/g, '/')
}

function toBase64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function maybeConvertPrivateKey(input) {
  const value = String(input || '').trim()
  if (!value) return ''

  if (/^[A-Za-z0-9_-]{43,44}$/.test(value)) {
    return value
  }

  try {
    const buf = Buffer.from(normalizeBase64(value), 'base64')
    for (let i = 0; i <= buf.length - 34; i++) {
      if (buf[i] === 0x04 && buf[i + 1] === 0x20) {
        return toBase64Url(buf.subarray(i + 2, i + 34))
      }
    }
  } catch (_) {}

  return value
}

function readEnv() {
  const publicKey = String(
    process.env.VAPID_PUBLIC_KEY || process.env.PUBLIC_VAPID_KEY || ''
  ).trim()

  const privateKey = maybeConvertPrivateKey(
    process.env.VAPID_PRIVATE_KEY || process.env.PRIVATE_VAPID_KEY || ''
  )

  const subject = String(
    process.env.VAPID_SUBJECT || 'mailto:admin@example.com'
  ).trim()

  return { publicKey, privateKey, subject }
}

function setupVapid() {
  const { publicKey, privateKey, subject } = readEnv()
  if (!publicKey || !privateKey) {
    throw new Error('missing vapid config')
  }
  webpush.setVapidDetails(subject, publicKey, privateKey)
  return { webpush, publicKey, privateKey, subject }
}

module.exports = {
  readEnv,
  setupVapid,
}
