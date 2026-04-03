<script>
    import { onMount } from "svelte";

    import "cherry-markdown/dist/cherry-markdown.css";
    import { readLocalMarkdown } from "$lib/utlis/file_utils";

    /**
     * @type {HTMLDivElement}
     */
    let markdownContainer;
    /**
     * @type {any}
     */
    let cherry;
    let savedText = "";

    onMount(() => {
        let destroyed = false;
        /** @type {((e: BeforeUnloadEvent) => void) | null} */
        let beforeUnloadHandler = null;

        (async () => {
            const { default: Cherry } = await import("cherry-markdown/dist/cherry-markdown");

        const customMenuFile = Cherry.createMenuHook("file", {
            name: "文件",
            noIcon: true,
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "打开",
                    onclick: async function () {
                        try {
                            const text = await readLocalMarkdown();
                            if (cherry && text != null) {
                                cherry.setMarkdown(text, true);
                                localStorage.setItem("lastMarkdown", text);
                                savedText = text;
                            }
                        } catch (e) {
                            console.warn("打开文件失败", e);
                        }
                    },
                },
                {
                    noIcon: true,
                    name: "关闭",
                    onclick: function () {
                        localStorage.removeItem("lastMarkdown");
                        savedText = "";
                        window.location.reload();
                    },
                },
            ],
        });

        const customMenuA = Cherry.createMenuHook("加粗斜体", {
            iconName: "font",
            onClick: function (selection) {
                let $selection = this.getSelection(selection) || "同时加粗斜体";
                if (
                    !this.isSelections &&
                    !/^\s*(\*\*\*)[\s\S]+(\1)/.test($selection)
                ) {
                    this.getMoreSelection("***", "***", () => {
                        const newSelection = this.editor.editor.getSelection();
                        const isBoldItalic = /^\s*(\*\*\*)[\s\S]+(\1)/.test(
                            newSelection,
                        );
                        if (isBoldItalic) {
                            $selection = newSelection;
                        }
                        return isBoldItalic;
                    });
                }
                if (/^\s*(\*\*\*)[\s\S]+(\1)/.test($selection)) {
                    return $selection.replace(
                        /(^)(\s*)(\*\*\*)([^\n]+)(\3)(\s*)($)/gm,
                        "$1$4$7",
                    );
                }
                this.registerAfterClickCb(() => {
                    this.setLessSelection("***", "***");
                });
                return $selection.replace(/(^)([^\n]+)($)/gm, "$1***$2***$3");
            },
        });

        const customMenuC = Cherry.createMenuHook("帮助中心", {
            iconName: "question",
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "更多工具",
                    onclick: () => window.open("https://utils.lieflat.live"),
                },
                {
                    noIcon: true,
                    name: "issues",
                    onclick: () => window.open("https://github.com/langbiantianya/pwaMarkdownEdit/issues"),
                },
                {
                    noIcon: true,
                    name: "about",
                    onclick: () => alert("本站点基于腾讯开源的cherry markdown编辑器开发"),
                },
            ],
        });

        const customMenuTable = Cherry.createMenuHook("图表", {
            iconName: "trendingUp",
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "折线图",
                    onclick: () => cherry?.insert(
                        '\n| :line:{"title": "折线图"} | Header1 | Header2 | Header3 | Header4 |\n| ------ | ------ | ------ | ------ | ------ |\n| Sample1 | 11 | 11 | 4 | 33 |\n| Sample2 | 112 | 111 | 22 | 222 |\n| Sample3 | 333 | 142 | 311 | 11 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "柱状图",
                    onclick: () => cherry?.insert(
                        '\n| :bar:{"title": "柱状图"} | Header1 | Header2 | Header3 | Header4 |\n| ------ | ------ | ------ | ------ | ------ |\n| Sample1 | 11 | 11 | 4 | 33 |\n| Sample2 | 112 | 111 | 22 | 222 |\n| Sample3 | 333 | 142 | 311 | 11 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "雷达图",
                    onclick: () => cherry?.insert(
                        '\n| :radar:{"title": "雷达图"} | 技能1 | 技能2 | 技能3 | 技能4 | 技能5 |\n| ------ | ------ | ------ | ------ | ------ | ------ |\n| 用户A | 90 | 85 | 75 | 80 | 88 |\n| 用户B | 75 | 90 | 88 | 85 | 78 |\n| 用户C | 85 | 78 | 90 | 88 | 85 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "热力图",
                    onclick: () => cherry?.insert(
                        '\n| :heatmap:{"title": "热力图"} | 周一 | 周二 | 周三 | 周四 | 周五 |\n| ------ | ------ | ------ | ------ | ------ |\n| 上午 | 10 | 20 | 30 | 40 | 50 |\n| 下午 | 15 | 25 | 35 | 45 | 55 |\n| 晚上 | 5 | 15 | 25 | 35 | 45 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "饼图",
                    onclick: () => cherry?.insert(
                        '\n| :pie:{"title": "饼图"} | 数值 |\n| ------ | ------ |\n| 苹果 | 40 |\n| 香蕉 | 30 |\n| 橙子 | 20 |\n| 葡萄 | 10 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "散点图",
                    onclick: () => cherry?.insert(
                        '\n| :scatter:{"title": "散点图", "cherry:mapping": {"x": "X", "y": "Y", "size": "Size", "series": "Series"}} | X | Y | Size | Series |\n| ------ | ------ | ------ | ------ | ------ |\n| A1 | 10 | 20 | 5 | S1 |\n| A2 | 15 | 35 | 8 | S1 |\n| B1 | 30 | 12 | 3 | S2 |\n| B2 | 25 | 28 | 6 | S2 |\n| C1 | 50 | 40 | 9 | S3 |\n| C2 | 60 | 55 | 7 | S3 |\n'
                    ),
                },
                {
                    noIcon: true,
                    name: "地图",
                    onclick: () => cherry?.insert(
                        '\n| :map:{"title": "地图", "mapDataSource": "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"} | 数值 |\n| :-: | :-: |\n| 北京 | 100 |\n| 上海 | 200 |\n| 广东 | 300 |\n| 四川 | 150 |\n| 江苏 | 250 |\n| 浙江 | 180 |\n\n**说明：** 修改mapDataSource的URL来自定义地图数据源\n'
                    ),
                },
            ],
        });

        const defaultText = localStorage.getItem("lastMarkdown") || "";
        savedText = defaultText;

        cherry = new Cherry({
            el: markdownContainer,
            externals: {
                // @ts-ignore
                echarts: window.echarts,
                // @ts-ignore
                katex: window.katex,
                // @ts-ignore
                MathJax: window.MathJax,
            },
            value: defaultText,
            isPreviewOnly: false,
            engine: {
                global: {
                    htmlAttrWhiteList: "part|slot",
                    flowSessionContext: false,
                },
                syntax: {
                    codeBlock: {
                        theme: "twilight",
                        lineNumber: true,
                        expandCode: true,
                        copyCode: true,
                        editCode: true,
                        changeLang: true,
                        customBtns: [],
                    },
                    table: { enableChart: true },
                    fontEmphasis: { allowWhitespace: false },
                    strikethrough: { needWhitespace: false },
                    mathBlock: {
                        engine: "MathJax",
                        src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js",
                    },
                    inlineMath: { engine: "MathJax" },
                    emoji: {
                        useUnicode: true,
                        customResourceURL:
                            "https://github.githubassets.com/images/icons/emoji/unicode/${code}.png?v8",
                        upperCase: false,
                    },
                    htmlBlock: { removeTrailingNewline: false },
                    panel: { enableJustify: true, enablePanel: true },
                },
            },
            multipleFileSelection: {
                video: false,
                audio: false,
                image: true,
                word: false,
                pdf: false,
                file: false,
            },
            toolbars: {
                toolbar: [
                    { customMenuFile: [] },
                    "export",
                    "|",
                    "bold",
                    "italic",
                    {
                        strikethrough: [
                            "strikethrough",
                            "underline",
                            "sub",
                            "sup",
                            "customMenuAName",
                        ],
                    },
                    "size",
                    "|",
                    "color",
                    "header",
                    "|",
                    "ol",
                    "ul",
                    "checklist",
                    "panel",
                    "align",
                    "detail",
                    "|",
                    "formula",
                    {
                        insert: [
                            "image",
                            "link",
                            "hr",
                            "br",
                            "code",
                            "inlineCode",
                            "formula",
                            "toc",
                            "table",
                        ],
                    },
                    "graph",
                    "proTable",
                    "togglePreview",
                    "codeTheme",
                    "search",
                    "shortcutKey",
                    "customMenuTable",
                    "customMenuCName",
                ],
                toolbarRight: ["changeLocale", "wordCount"],
                bubble: [
                    "bold",
                    "italic",
                    "underline",
                    "strikethrough",
                    "sub",
                    "sup",
                    "quote",
                    "|",
                    "size",
                    "color",
                ],
                sidebar: ["mobilePreview", "copy", "theme"],
                toc: { defaultModel: "full" },
                customMenu: {
                    customMenuAName: customMenuA,
                    customMenuCName: customMenuC,
                    customMenuTable,
                    customMenuFile,
                },
                shortcutKeySettings: { isReplace: false, shortcutKeyMap: {} },
                config: {
                    mapTable: {
                        sourceUrl: [
                            "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
                            "./assets/data/china.json",
                        ],
                    },
                },
            },
            callback: {
                afterChange(text) {
                    localStorage.setItem("lastMarkdown", text);
                },
            },
            editor: {
                id: "cherry-text",
                name: "cherry-text",
                autoSave2Textarea: false,
                defaultModel: "edit&preview",
                showFullWidthMark: true,
                showSuggestList: true,
                maxUrlLength: 200,
                codemirror: {
                    placeholder: "输入文本或「/」开始编辑",
                },
            },
            autoScrollByHashAfterInit: true,
            themeSettings: { mainTheme: "default" },
        });

        beforeUnloadHandler = (event) => {
            const current = cherry?.getMarkdown?.() ?? "";
            if (current.trim() && current !== savedText) {
                event.preventDefault();
                event.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", beforeUnloadHandler);
    })();

    return () => {
        if (beforeUnloadHandler) {
            window.removeEventListener("beforeunload", beforeUnloadHandler);
        }
        try {
            cherry?.destroy?.();
        } catch {}
    };
});
</script>

<svelte:head>
    <script
        type="text/javascript"
        src="https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js"
    ></script>
    <script
        src="https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js"
        integrity="sha384-g7c+Jr9ZivxKLnZTDUhnkOnsh30B4H0rpLUpJ4jAIKs4fnJI+sEnkvrMWph2EDg4"
        crossorigin="anonymous"
    ></script>
</svelte:head>

<div class="h-lvh">
    <div class="h-full" bind:this={markdownContainer}></div>
</div>
