exports.handler = async function () {
    try {
        const res = await fetch("https://api.adsbexchange.com/v2/lat/13/lon/100/dist/500/")
        const data = await res.json()

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(data)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "fail" })
        }
    }
}