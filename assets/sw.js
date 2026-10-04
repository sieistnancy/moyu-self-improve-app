/* 摸鱼自我提升 PWA service worker：离线也能打开页面，联网时更新 */
var CACHE = "moyu-v3";
var ASSETS = [
  "./",
  "./摸鱼自我提升.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  // 同步通道、CDN、跨域请求一律放行（不缓存）
  if (url.origin !== location.origin) return;
  // 同源页面：网络优先，失败回缓存（保证更新）
  e.respondWith(
    fetch(req).then(function (resp) {
      var copy = resp.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return resp;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match("./摸鱼自我提升.html"); });
    })
  );
});
