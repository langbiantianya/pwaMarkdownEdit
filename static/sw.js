// sw.js - 基础缓存逻辑
const CACHE_NAME = 'v1-cache';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js'
];

// 安装时缓存资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// 拦截请求，优先走缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});