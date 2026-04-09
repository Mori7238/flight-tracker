exports.handler = async function(event) {
  try {
    const q = event.queryStringParameters || {}
    const lat = Number(q.lat)
    const lon = Number(q.lon)
    const radius = Math.min(Number(q.radius || 250), 250)
    const rawSelected = (q.selected || '')
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean)

    const expandedSet = new Set()
    rawSelected.forEach(code => {
      const clean = code.replace(/\s+/g, '')
      if (!clean) return
      expandedSet.add(clean)
      let m = clean.match(/^SL(\d+)$/)
      if (m) expandedSet.add(`TLM${m[1]}`)
      m = clean.match(/^TLM(\d+)$/)
      if (m) expandedSet.add(`SL${m[1]}`)
    })

    const expandedSelected = [...expandedSet]
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    }

    let pointAircraft = []
    let selectedAircraft = []

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const pointRes = await fetch(`https://api.airplanes.live/v2/point/${lat}/${lon}/${radius}`)
      if (pointRes.ok) {
        const pointData = await pointRes.json()
        pointAircraft = Array.isArray(pointData.ac) ? pointData.ac : []
      }
    }

    if (expandedSelected.length > 0) {
      const callsignRes = await fetch(`https://api.airplanes.live/v2/callsign/${encodeURIComponent(expandedSelected.join(','))}`)
      if (callsignRes.ok) {
        const callsignData = await callsignRes.json()
        selectedAircraft = Array.isArray(callsignData.ac) ? callsignData.ac : []
      }
    }

    const mergedMap = new Map()
    ;[...pointAircraft, ...selectedAircraft].forEach(p => {
      const key = [
        p.hex || '',
        (p.flight || p.callsign || '').toString().trim().toUpperCase(),
        (p.r || p.reg || '').toString().trim().toUpperCase(),
      ].join('|')
      if (!mergedMap.has(key)) mergedMap.set(key, p)
    })

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ac: [...mergedMap.values()],
        total: mergedMap.size,
        pointCount: pointAircraft.length,
        selectedCount: selectedAircraft.length,
        selected: rawSelected,
        expandedSelected,
      }),
    }
  } catch (err) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: String(err), ac: [] }),
    }
  }
}
