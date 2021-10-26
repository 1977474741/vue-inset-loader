const { parseComponent } = require("../vue-template-compiler")
const {
	generateHtmlCode,
	generateLabelCode,
	generateStyleCode,
	getPagesMap,
	initPages,
	getRoute
} = require('./utils')

// 是否初始化过
let _init = false
// 是否需要做处理
let needHandle = false
// 路由和配置的映射关系
let pagesMap = {}

module.exports = function(content) {
	if(!_init){
		_init = true
		init(this)
	}

	// 配置无效不予处理
	if(!needHandle){
		return content
	}

	// 获取当前文件的小程序路由
	const route = getRoute(this.resourcePath)
	// 根据路由并找到对应配置
	const curPage = pagesMap[route]
	if(curPage){
		// 解析sfc
		const compiler = parseComponent(content)
		// 生成标签代码
		const labelCode = generateLabelCode(curPage.label)
		// 匹配标签位置
		const insertReg = new RegExp(`(<\/${curPage.ele}>$)`)
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
	return content
}

function init(that){
	const isWx = process.env.VUE_APP_PLATFORM == 'mp-weixin'
	// 首次需要对pages配置文件做解析，并判断是否为有效配置
	// 非小程序环境或无效配置不予处理
	needHandle = isWx && initPages(that)
	// 转换为路由和配置的映射对象
	needHandle && (pagesMap = getPagesMap())
}