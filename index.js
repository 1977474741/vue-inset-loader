const { parseComponent } = require("vue-template-compiler")

// 读取pages.json文件并反序列化
const fs = require('fs')
const path = require('path')
const rootPath =  process.env.UNI_INPUT_DIR || (process.env.INIT_CWD + '\\src')
const pagesJsonPath = path.resolve(rootPath, 'pages.json')
const pagesJson = JSON.parse(fs.readFileSync(pagesJsonPath,'utf8'))
process.VUE_COMPONENTS_LOADER = pagesJson

// 获取此loader相关对象vueLabel
let vueLabel = pagesJson.vueLabel

// 给非必填项设置缺省值
// label：全局标签配置
// rootEle：根元素的类型,也支持正则,如匹配任意标签.*
vueLabel.label = vueLabel.label || []
vueLabel.rootEle = vueLabel.rootEle || "div"

const {
	generateHtmlCode,
	generateLabelCode,
	generateStyleCode,
	getConfig
} = require('./utils')

// 是小程序环境
const isWx = process.env.VUE_APP_PLATFORM == 'mp-weixin'
// 非小程序环境或无必填项不作处理
const needHandle = isWx && vueLabel && typeof vueLabel.config == 'object' && Object.keys(vueLabel.config).length

// 提前生成编译时页面配置
let pageConfig = {}
if(needHandle){
	pageConfig = getConfig(pagesJson,vueLabel)
}

module.exports = function(content) {
	if(needHandle){
		// 获取当前文件的小程序路由
		const path = this.resourcePath
		.replace(rootPath,'')
		.replace('.vue','')
		.replace(/\\/g,'/')
		// 根据路由并找到对应配置
		const curConfig = pageConfig[path]
		if(curConfig){
			// 解析sfc
			const compiler = parseComponent(content)
			// 生成标签代码
			const labelCode = generateLabelCode(curConfig.label)
			// 匹配标签位置
			const insertReg = new RegExp(`(<\/${curConfig.ele}>$)`)
			// 在匹配的标签之前插入额外标签代码
			const templateCode = generateHtmlCode(
				compiler.template.content,
				labelCode,
				insertReg
			)
			// 重组style标签及内容
			const style = generateStyleCode(compiler.styles || [])
			content = `
				<template>
					${templateCode}
				</template>
				<script>
					${compiler.script.content}
				</script>
				${style}
			`
		}
	}
	return content
}
