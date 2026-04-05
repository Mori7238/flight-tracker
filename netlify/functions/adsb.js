export async function handler(event, context) {
  try {
    const res = await fetch("https://api.adsb.lol/v2/states/all");

    // ❌ API ล่ม
    if (!res.ok) {
      console.log("ADSB status error:", res.status);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          states: [],
          error: "adsb failed"
        })
      };
    }

    const data = await res.json();

    // 🔥 รองรับหลาย format (สำคัญมาก)
    let states = [];

    if (Array.isArray(data.states)) {
      states = data.states;
    } else if (Array.isArray(data.ac)) {
      states = data.ac;
    } else {
      console.log("Unknown ADSB format:", data);
    }

    // ❌ กัน undefined
    if (!Array.isArray(states)) {
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

    // ✅ ส่งกลับ
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        states: states
      })
    };

  } catch (err) {
    console.log("Function crash:", err);

    return {
      statusCode: 200,
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