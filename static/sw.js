const CACHE_NAME = 'markdown-v1.3';

// 1. 仅放置最核心、绝对不会错的入口文件
const ESSENTIAL_FILES = [
  '/',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用 map 一个个添加，并捕获错误，防止其中一个失败导致全部失败
      return Promise.allSettled(
        ESSENTIAL_FILES.map(url => cache.add(url))
      );
    })
  );
  self.skipWaiting();
});

// 2. 动态缓存：只要浏览器请求过，就自动存下来
self.addEventListener('fetch', (event) => {
  // 【新增过滤】只缓存 http 和 https 请求，跳过浏览器插件请求
  if (!(event.request.url.indexOf('http') === 0)) return;

  // 排除非 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        // 确保响应有效再缓存
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // 离线且无缓存时的逻辑
      });
    })
  );
});