const CACHE_NAME = 'markdown-v1.1';

// 1. 仅放置最核心、绝对不会错的入口文件
const ESSENTIAL_FILES = [
  '/',
  '/sw.js'
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
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 如果有缓存就用缓存，没有就去联网下
      return cached || fetch(event.request).then((response) => {
        // 只有正常的响应才存入缓存
        if (response && response.status === 200) {
          const respCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, respCopy));
        }
        return response;
      }).catch(() => {
        // 彻底断网且没缓存时的反馈
        console.log('资源获取失败且无缓存:', event.request.url);
      });
    })
  );
});