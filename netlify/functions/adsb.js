export async function handler(event, context) {
  try {
    
    const res = await fetch("https://api.airplanes.live/v2/states/all");

    if (!res.ok) {
      console.log("ADSB error:", res.status);

      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ states: [] })
      };
    }

    const data = await res.json();

    let states = [];

    // 🔥 รองรับทุก format
    if (Array.isArray(data.states)) {
      states = data.states;
    } else if (Array.isArray(data.ac)) {
      states = data.ac;
    } else if (Array.isArray(data)) {
      states = data;
    } else {
      console.log("Unknown format:", data);
    }

    // 🔥 กัน null / undefined
    if (!states || !Array.isArray(states)) {
      states = [];
    }

    // 🔥 ตัดข้อมูลเสีย (ช่วยให้ frontend ไม่พัง)
    states = states.filter(p => p);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ states })
    };

  } catch (err) {
    console.log("Function crash:", err);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ states: [] })
    };
  }
}