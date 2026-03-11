<script>
    import { onMount } from "svelte";

    import "cherry-markdown/dist/cherry-markdown.css";
    // node_modules\cherry-markdown\dist\cherry-markdown.d.ts
    import { readLocalMarkdown } from "$lib/utlis/file_utils";
    /**
     * @type {HTMLDivElement}
     */
    let markdownContainer;
    let cherry;
    onMount(async () => {
        // 现代标准写法
        window.addEventListener("beforeunload", (event) => {
            // 只有在确定有未保存数据时才拦截

            // 根据规范，调用 preventDefault 即可触发弹窗
            event.preventDefault();

            // 备注：为了兼容极少数尚未完全同步标准的浏览器，
            // 依然可以保留这一行，但不要指望它能显示你的自定义文字。
            event.returnValue = true;
        });
        const { default: Cherry } = await import("cherry-markdown/dist/cherry-markdown");
        /**
         * 自定义一个语法
         */
        const CustomHookA = Cherry.createSyntaxHook(
            "codeBlock",
            Cherry.constants.HOOKS_TYPE_LIST.PAR,
            {
                makeHtml(str) {
                    console.warn("custom hook", "hello");
                    return str;
                },
                rule(str) {
                    const regex = {
                        begin: "",
                        content: "",
                        end: "",
                    };
                    regex.reg = new RegExp(
                        regex.begin + regex.content + regex.end,
                        "g",
                    );
                    return regex;
                },
            },
        );
        const customMenuFile = Cherry.createMenuHook("file", {
            name: "文件",
            noIcon: true,
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "打开",
                    onclick: async function () {
                        const mdTxt = await readLocalMarkdown();
                        cherry?.setMarkdown(mdTxt, true);
                        // 打开文件后保存到缓存中
                        localStorage.setItem("lastMarkdown", mdTxt);
                    },
                },
                {
                    noIcon: true,
                    name: "关闭",
                    onclick: function () {
                        // 关闭文件后清空缓存
                        localStorage.removeItem("lastMarkdown");
                        window.location.reload();
                    },
                },
            ],
        });
        /**
         * 自定义一个自定义菜单
         * 点第一次时，把选中的文字变成同时加粗和斜体
         * 保持光标选区不变，点第二次时，把加粗斜体的文字变成普通文本
         */
        const customMenuA = Cherry.createMenuHook("加粗斜体", {
            iconName: "font",
            onClick: function (selection) {
                // 获取用户选中的文字，调用getSelection方法后，如果用户没有选中任何文字，会尝试获取光标所在位置的单词或句子
                let $selection = this.getSelection(selection) || "同时加粗斜体";
                // 如果是单选，并且选中内容的开始结束内没有加粗语法，则扩大选中范围
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
                // 如果选中的文本中已经有加粗语法了，则去掉加粗语法
                if (/^\s*(\*\*\*)[\s\S]+(\1)/.test($selection)) {
                    return $selection.replace(
                        /(^)(\s*)(\*\*\*)([^\n]+)(\3)(\s*)($)/gm,
                        "$1$4$7",
                    );
                }
                /**
                 * 注册缩小选区的规则
                 *    注册后，插入“***TEXT***”，选中状态会变成“***【TEXT】***”
                 *    如果不注册，插入后效果为：“【***TEXT***】”
                 */
                this.registerAfterClickCb(() => {
                    this.setLessSelection("***", "***");
                });
                return $selection.replace(/(^)([^\n]+)($)/gm, "$1***$2***$3");
            },
        });
        /**
         * 定义一个自带二级菜单的工具栏
         */
        const customMenuC = Cherry.createMenuHook("帮助中心", {
            iconName: "question",
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "更多工具",
                    onclick: (event) => {
                        window.open(
                            "https://utils.lieflat.live",
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "issues",
                    onclick: (event) => {
                        window.open(
                            "https://github.com/langbiantianya/pwaMarkdownEdit/issues",
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "about",
                    onclick: (event) => {
                        alert("本站点基于腾讯开源的cherry markdown编辑器开发");
                    },
                },
            ],
        });

        /**
         * 定义带图表表格的按钮
         */
        let customMenuTable = Cherry.createMenuHook("图表", {
            iconName: "trendingUp",
            subMenuConfig: [
                {
                    noIcon: true,
                    name: "折线图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :line:{"title": "折线图"} | Header1 | Header2 | Header3 | Header4 |\n| ------ | ------ | ------ | ------ | ------ |\n| Sample1 | 11 | 11 | 4 | 33 |\n| Sample2 | 112 | 111 | 22 | 222 |\n| Sample3 | 333 | 142 | 311 | 11 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "柱状图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :bar:{"title": "柱状图"} | Header1 | Header2 | Header3 | Header4 |\n| ------ | ------ | ------ | ------ | ------ |\n| Sample1 | 11 | 11 | 4 | 33 |\n| Sample2 | 112 | 111 | 22 | 222 |\n| Sample3 | 333 | 142 | 311 | 11 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "雷达图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :radar:{"title": "雷达图"} | 技能1 | 技能2 | 技能3 | 技能4 | 技能5 |\n| ------ | ------ | ------ | ------ | ------ | ------ |\n| 用户A | 90 | 85 | 75 | 80 | 88 |\n| 用户B | 75 | 90 | 88 | 85 | 78 |\n| 用户C | 85 | 78 | 90 | 88 | 85 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "热力图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :heatmap:{"title": "热力图"} | 周一 | 周二 | 周三 | 周四 | 周五 |\n| ------ | ------ | ------ | ------ | ------ | ------ |\n| 上午 | 10 | 20 | 30 | 40 | 50 |\n| 下午 | 15 | 25 | 35 | 45 | 55 |\n| 晚上 | 5 | 15 | 25 | 35 | 45 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "饼图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :pie:{"title": "饼图"} | 数值 |\n| ------ | ------ |\n| 苹果 | 40 |\n| 香蕉 | 30 |\n| 橙子 | 20 |\n| 葡萄 | 10 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "散点图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :scatter:{"title": "散点图", "cherry:mapping": {"x": "X", "y": "Y", "size": "Size", "series": "Series"}} | X | Y | Size | Series |\n| ------ | ------ | ------ | ------ | ------ |\n| A1 | 10 | 20 | 5 | S1 |\n| A2 | 15 | 35 | 8 | S1 |\n| B1 | 30 | 12 | 3 | S2 |\n| B2 | 25 | 28 | 6 | S2 |\n| C1 | 50 | 40 | 9 | S3 |\n| C2 | 60 | 55 | 7 | S3 |\n',
                        );
                    },
                },
                {
                    noIcon: true,
                    name: "地图",
                    onclick: (event) => {
                        cherry.insert(
                            '\n| :map:{"title": "地图", "mapDataSource": "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json"} | 数值 |\n| :-: | :-: |\n| 北京 | 100 |\n| 上海 | 200 |\n| 广东 | 300 |\n| 四川 | 150 |\n| 江苏 | 250 |\n| 浙江 | 180 |\n\n**说明：** 修改mapDataSource的URL来自定义地图数据源\n',
                        );
                    },
                },
            ],
        });

        const basicConfig = {
            el: markdownContainer,
            externals: {
                echarts: window.echarts,
                katex: window.katex,
                MathJax: window.MathJax,
            },
            isPreviewOnly: false,
            engine: {
                global: {
                    htmlAttrWhiteList: "part|slot",
                    flowSessionContext: false,
                    // flowSessionCursor: 'default'
                },
                syntax: {
                    // link: {
                    //     attrRender: (text, href) => {
                    //         return ``;
                    //     },
                    // },
                    // image: {
                    //     videoWrapper: (link, type, defaultWrapper) => {
                    //         console.log(type);
                    //         return defaultWrapper;
                    //     },
                    // },
                    // autoLink: {
                    //     /** 生成的<a>标签追加target属性的默认值 空：在<a>标签里不会追加target属性， _blank：在<a>标签里追加target="_blank"属性 */
                    //     target: "",
                    //     /** 生成的<a>标签追加rel属性的默认值 空：在<a>标签里不会追加rel属性， nofollow：在<a>标签里追加rel="nofollow：在"属性*/
                    //     rel: "",
                    //     /** 是否开启短链接 */
                    //     enableShortLink: true,
                    //     /** 短链接长度 */
                    //     shortLinkLength: 20,
                    //     attrRender: (text, href) => {
                    //         return ``;
                    //     },
                    // },
                    codeBlock: {
                        theme: "twilight",
                        lineNumber: true, // 默认显示行号
                        expandCode: true,
                        copyCode: true,
                        editCode: true,
                        changeLang: true,
                        customBtns: [
                        ],
                    },
                    table: {
                        enableChart: true,
                    },
                    fontEmphasis: {
                        allowWhitespace: false, // 是否允许首尾空格
                    },
                    strikethrough: {
                        needWhitespace: false, // 是否必须有前后空格
                    },
                    mathBlock: {
                        engine: "MathJax", // katex或MathJax
                        // engine: 'katex', // katex或MathJax
                        src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js", // 如果使用MathJax plugins，则需要使用该url通过script标签引入
                        // src: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.js',
                        // css: 'https://cdn.jsdelivr.net/npm/katex@0.12.0/dist/katex.min.css', // 如果使用katex，则还需要引入css（如果是MathJax，则不需要）
                    },
                    inlineMath: {
                        engine: "MathJax", // katex或MathJax
                        // engine: 'katex', // katex或MathJax
                    },
                    emoji: {
                        useUnicode: true,
                        customResourceURL:
                            "https://github.githubassets.com/images/icons/emoji/unicode/${code}.png?v8",
                        upperCase: false,
                    },
                    htmlBlock: {
                        removeTrailingNewline: false,
                    },
                    panel: {
                        // 是否支持对齐语法
                        enableJustify: true,
                        // 是否支持信息面板语法
                        enablePanel: true,
                    }
                },
                customSyntax: {
                    // SyntaxHookClass
                    CustomHook: {
                        syntaxClass: CustomHookA,
                        force: false,
                        after: "br",
                    },
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
                ], // array or false
                sidebar: ["mobilePreview", "copy", "theme"],
                toc: {
                    // updateLocationHash: false, // 要不要更新URL的hash
                    defaultModel: "full", // pure: 精简模式/缩略模式，只有一排小点； full: 完整模式，会展示所有标题
                },
                customMenu: {
                    customMenuAName: customMenuA,
                    customMenuCName: customMenuC,
                    customMenuTable,
                    customMenuFile,
                },
                shortcutKeySettings: {
                    /** 是否替换已有的快捷键, true: 替换默认快捷键； false： 会追加到默认快捷键里，相同的shortcutKey会覆盖默认的 */
                    isReplace: false,
                    shortcutKeyMap: {
                    },
                },
                config: {
                    // 地图表格配置 - 支持自定义地图数据源URL
                    mapTable: {
                        sourceUrl: [
                            // 在线高质量地图数据源（优先，已验证可用）
                            "https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json",
                            // 本地备用地图数据（从examples目录的相对路径）
                            "./assets/data/china.json",
                        ],
                    },
                },
            },
            keydown: [],
            callback: {
                afterChange(text, html) {
                    localStorage.setItem("lastMarkdown", text);
                },
            },
            editor: {
                id: "cherry-text",
                name: "cherry-text",
                autoSave2Textarea: true,
                defaultModel: "edit&preview",
                showFullWidthMark: true, // 是否高亮全角符号 ·|￥|、|：|“|”|【|】|（|）|《|》
                showSuggestList: true, // 是否显示联想框
                maxUrlLength: 200, // url最大长度，超过则自动截断
                codemirror: {
                    placeholder: "输入文本或「/」开始编辑",
                },
            },
            // cherry初始化后是否检查 location.hash 尝试滚动到对应位置
            autoScrollByHashAfterInit: true,
            // locale: 'en_US',
            themeSettings: {
                mainTheme: "default",
            },
        };
        cherry = new Cherry(basicConfig);
        cherry.setMarkdown(localStorage.getItem("lastMarkdown") || "", true);
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
