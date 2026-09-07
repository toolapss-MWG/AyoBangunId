js

const CACHE_NAME = "ayo-bangun-pos-v1"; const urlsToCache = ["/", "/index.html", "/styles.css", "/manifest.json", "/assets/logo-ayo-bangun.jpeg"];  self.addEventListener("install", (event) => {   event.waitUntil(     caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).catch(() => {})   ); });  self.addEventListener("activate", (event) => {   event.waitUntil(     caches.keys().then((keys) =>       Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))     )   ); });  self.addEventListener("fetch", (event) => {   if (event.request.method !== "GET") return;    event.respondWith(     caches.match(event.request).then((cached) => {       if (cached) return cached;       return fetch(event.request)         .then((res) => {           const clone = res.clone();           caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});           return res;         })         .catch(() => cached);     })   ); }); 

---
