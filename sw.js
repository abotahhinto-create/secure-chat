// Secure Chat v7.0 - Offline First - نشوان البدري
const CACHE_NAME = "secure-chat-v7-light";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// أول ما ينزل التطبيق، خزن كل الملفات
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// امسح الكاش القديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

// أهم دالة: إذا فيه انترنت جيب الجديد، إذا مافيه انترنت جيب من الكاش
self.addEventListener("fetch", (event) => {
  // لا تخزن طلبات غير GET
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // إذا جاب من النت، حدث الكاش
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return res;
      })
      .catch(() => {
        // إذا مافيه نت، جيب من الكاش
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // إذا طلب صفحة، رجع index.html
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
