const CACHE_NAME = "flight-v2"; // 👈 เปลี่ยนชื่อทุกครั้งที่อัปเดต

self.addEventListener("install", (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll([
                "/",
                "/index.html",
                "/manifest.json"
            ]);
        })
    );
});

self.addEventListener("activate", (e) => {
    // 🔥 ลบ cache เก่า
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (e) => {

    // ❗ API / function → ห้าม cache
    if (e.request.url.includes("/.netlify/functions/")) {
        e.respondWith(fetch(e.request));
        return;
    }

    // 🔥 HTML → เอาของใหม่ก่อนเสมอ
    if (e.request.mode === "navigate") {
        e.respondWith(
            fetch(e.request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    // 📦 static file → cache-first (เร็ว)
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request).then(networkRes => {
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(e.request, networkRes.clone());
                    return networkRes;
                });
            });
        })
    );
});