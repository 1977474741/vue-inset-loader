// pages.json对象
const pagesJson = process.VUE_COMPONENTS_LOADER
// 此loader配置对象
const vueLabel = pagesJson.vueLabel
// 在template中用正则匹配并替换一段代码
const generateHtmlCode = (template,labelCode,regLabel)=>{
	// 去除html所有注释和首尾空白
	const regNotes = /<!--(.|[\r\n])*?-->/g
	const regBlank = /^\s+|\s+$/g
	return template
	.replace(regNotes,'')
	.replace(regBlank,'')
	.replace(regLabel,`${labelCode}$1`)
}

// 获取到需要插入的所有label标签
const generateLabelCode = (labelArr) => labelArr.map(e => vueLabel.config[e] || '').join('')

// 根据compiler组合成style标签字符串代码
const generateStyleCode = (styles)=>styles.reduce((str,item,i)=>{
	return str +=  `<style ${item.lang?("lang='"+item.lang+"'"):''} ${item.scoped?("scoped='"+item.scoped+"'"):''}>
		${item.content}
	</style>`
},'')

// 分析pages.json，生成需要处理的页面配置
const getConfig = ()=>{
	// 获取主包路由配置
	return pagesJson.pages.reduce((obj,item)=>{
        const curConfig = getLabelConfig(item)
        curConfig.label && (obj['/'+item.path] = curConfig)
	    return obj
	},pagesJson.subpackages.reduce((obj,item)=>{
		// 获取分包路由配置
	    const root = item.root
	    item.pages.forEach((item)=>{
	    	const curConfig = getLabelConfig(item)
	        curConfig.label && (obj['/'+root+'/'+item.path] = curConfig)
	    })
	    return obj
	},{}))
}

// 生成path对应的对象结构
const getLabelConfig = (json)=>{
	return {
		label: (json.style && json.style.label) || vueLabel.label,
		ele: (json.style && json.style.rootEle) || vueLabel.rootEle
	}
}

module.exports = {
	generateHtmlCode,
	generateLabelCode,
	generateStyleCode,
	getConfig
}