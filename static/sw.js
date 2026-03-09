const CACHE_NAME = 'markdown-v1.6.1';

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

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. 严格过滤：仅处理 http/https，排除 chrome-extension 等插件干扰
  if (!request.url.startsWith('http')) return;

  // 2. 策略分流：仅缓存 GET 请求
  if (request.method !== 'GET') return;

  // 3. 动态缓存策略：Stale-While-Revalidate (边用旧的，边下新的)
  // 这种策略最适合编辑器：用户秒开，但后台会自动下载新版本
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // 发起网络请求，用于更新缓存
      const fetchPromise = fetch(request).then((networkResponse) => {
        // 只有成功的响应才存入缓存 (排除 404, 500 等)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.warn('[SW] 网络请求失败，可能处于离线状态:', url.pathname);
        // 如果联网失败且没缓存，可以返回一个自定义的离线页面或占位图
      });

      // 返回缓存 (如果有)，否则等待网络请求结果
      return cachedResponse || fetchPromise;
    })
  );
});

// 4. 自动清理旧缓存：确保用户不会被撑爆磁盘
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
});