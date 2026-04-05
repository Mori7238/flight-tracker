export async function handler(event, context) {
  try {
    const res = await fetch("https://opensky-network.org/api/states/all");

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "opensky failed" })
      };
    }

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}