<script>
	import "./layout.css";
	let { children } = $props();
	import { onMount } from "svelte";
	onMount(() => {
		// 注册 Service Worker
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((reg) => console.log("PWA 注册成功:", reg.scope))
					.catch((err) => console.log("PWA 注册失败:", err));
			});
		}
	});
</script>

<svelte:head>
	<title>Markdown edit</title>
	<meta
		name="description"
		content="一款完全基于浏览器的 Markdown 本地编辑器&阅读器。无需上传，即点即编，支持离线使用。保护您的隐私，提供极致的极简阅读体验，支持 PWA 安装。"
	/>
	<meta
		name="keywords"
		content="Markdown阅读器, MD文件查看器, 本地Markdown, 离线MD阅读, PWA编辑器, Markdown, Markdown Edit ,Markdown online edit"
	/>

	<link rel="canonical" href="https://edit.lieflat.live/" />

	<meta
		property="og:title"
		content="Markdown 本地编辑器&阅读器 - 离线隐私极简"
	/>
	<meta
		property="og:description"
		content="无需上传，即点即编辑的本地 Markdown 编辑器&阅读器。"
	/>
	<meta
		property="og:image"
		content="https://edit.lieflat.live/web-app-manifest-512x512.png"
	/>
	<meta property="og:url" content="https://edit.lieflat.live/" />
	<meta property="og:type" content="website" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#000000" />
	<link rel="icon" href="/favicon.svg" />
</svelte:head>
{@render children()}
