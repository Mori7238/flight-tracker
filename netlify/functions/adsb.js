export async function handler(event, context) {
  try {
    const res = await fetch("https://opensky-network.org/api/states/all", {
      timeout: 10000
    });

    // ❌ API ล่ม / status ไม่โอเค
    if (!res.ok) {
      console.log("OpenSky status error:", res.status);

      return {
        statusCode: 200, // ไม่ให้ frontend พัง
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          states: [],
          error: "opensky failed"
        })
      };
    }

    const data = await res.json();

    // ❌ กัน data แปลก / undefined
    if (!data || !data.states || !Array.isArray(data.states)) {
      console.log("Invalid data from OpenSky:", data);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          states: [],
          error: "invalid data"
        })
      };
    }

    // ✅ ปกติ
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        states: data.states
      })
    };

  } catch (err) {
    console.log("Function crash:", err);

    return {
      statusCode: 200, // สำคัญ: ไม่โยน 500 แล้ว
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        states: [],
        error: err.message
      })
    };
  }
}