<script>
	import "./layout.css";
	let { children } = $props();
	import { onMount, onDestroy } from "svelte";

	// 检测是否为移动端
	let isMobile = $state(false);
	// 检测是否为竖屏
	let isPortrait = $state(false);

	// 检测设备类型和屏幕方向
	function checkDeviceAndOrientation() {
		if (typeof window !== "undefined") {
			isMobile =
				/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
					navigator.userAgent,
				);
			isPortrait = window.innerHeight > window.innerWidth;
			console.log("Device check:", {
				isMobile,
				isPortrait,
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
	}

	// 监听屏幕方向变化
	let orientationChangeHandler;

	onMount(() => {
		if (typeof window !== "undefined") {
			checkDeviceAndOrientation();
			orientationChangeHandler = () => checkDeviceAndOrientation();
			window.addEventListener("resize", orientationChangeHandler);
			window.addEventListener(
				"orientationchange",
				orientationChangeHandler,
			);
		}
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", orientationChangeHandler);
			window.removeEventListener(
				"orientationchange",
				orientationChangeHandler,
			);
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
		content="在线Markdown编辑器, Markdown阅读器, Markdown编辑器, MD文件查看器, 本地Markdown, 离线MD阅读, PWA编辑器, Markdown, Markdown Edit ,Markdown online edit"
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
	<script>
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("/sw.js")
					.then((reg) => console.log("SW 运行中", reg.scope))
					.catch((err) => console.log("SW 注册失败", err));
			});
		}
	</script>
	<meta property="og:url" content="https://edit.lieflat.live/" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta property="og:type" content="website" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#000000" />
	<link rel="icon" href="/favicon.svg" />
</svelte:head>
{@render children()}

<!-- 遮罩 -->
{#if isMobile && isPortrait}
	<div
		class="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-[999]"
	>
		<div class="text-white text-center p-8">
			<div class="text-4xl mb-4">🔄</div>
			<h2 class="text-2xl font-bold mb-4">请旋转设备</h2>
			<p class="text-lg">为了获得最佳体验，请将设备旋转至横屏模式</p>
		</div>
	</div>
{/if}
