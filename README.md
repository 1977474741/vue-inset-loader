
# vue-inset-loader
编译阶段在sfc模板指定位置插入自定义内容，适用于webpack构建的小程序应用，常用于需要全局引入组件的场景。
（由于小程序没有开放根标签，没有办法在根标签下追加全局标签，所以要使用组件必须在当前页面引入组件标签）

### 第一步 vue.config.js注入loader

    module: {
        rules: [
          {
            test: /\.vue$/,
            use:{
                loader: "vue-inset-loader",
                options: {
	                // pages.json配置文件的路径
                	pagesPath: path.resolve(__dirname,'./src/pages.json')
                }
            },
          },
        ]
    },

### 第二步 pages.json配置文件中添加insetLoader

    "insetLoader": {
	    // 名称和内容的键值对
    	"config":{
    		"confirm": "<BaseConfirm ref='confirm'></BaseConfirm>",
    		"abc": "<BaseAbc ref='BaseAbc'></BaseAbc>"
    	},
    	// 全局配置
    	// 全局引用的标签，此配置文件所有路由对应的页面都会插入
    	"label":["confirm"],
    	// 要插入页面的根元素的标签类型，缺省值为div，支持正则，比如匹配任意标签 ".*"
    	"rootEle":"div"
    },
    "pages": [
		{
			"path": "pages/tabbar/index/index",
			"style": {
				"navigationBarTitleText": "测试页面",
				// 单独配置，用法跟全局配置一致，优先级比全局高
				"label": ["confirm"],
				"rootEle":"div"
			}
		},
	]