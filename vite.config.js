import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: false,
			devOptions: { enabled: true },
			manifest: {
				name: 'Markdown Edit',
				short_name: 'Markdown',
				description: '无需下载即可在线编辑 Markdown 文档的高效编辑器',
				lang: 'zh-CN',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#ffffff',
				theme_color: '#333333',
				icons: [
					{
						src: '/web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'maskable'
					},
					{
						src: '/web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					}
				]
			},
			workbox: {
				maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
				globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
				additionalManifestEntries: [
					{ url: 'index.html', revision: Date.now().toString() }
				],
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'cdn-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 30 * 24 * 60 * 60
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /^https:\/\/geo\.datav\.aliyun\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'map-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 30 * 24 * 60 * 60
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					}
				]
			}
		})
	]
});
