const path = require('path');
const webpack = require('webpack');
const px2rem = require('postcss-px2rem');
const postcss = px2rem({
	remUnit: 100 //基准大小 baseSize，需要和rem.js中相同 
});

function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	// 公共路径(必须有的)
	publicPath: "./",
	// 输出文件目录
	outputDir: "dist",
	// 静态资源存放的文件夹(相对于ouputDir)
	assetsDir: "assets",
	// eslint-loader 是否在保存的时候检查(果断不用，这玩意儿我都没装)
	lintOnSave: false,
	// 我用的only，打包后小些
	runtimeCompiler: false,
	productionSourceMap: true, // 不需要生产环境的设置false可以减小dist文件大小，加速构建
	devServer: {
		open: true, // npm run serve后自动打开页面
		host: '0.0.0.0', // 匹配本机IP地址(默认是0.0.0.0)
		port: 8080, // 开发服务器运行端口号
		proxy: {
			"/rule": {
				// target: 'http://172.25.5.138:8080',
				target: 'http://172.25.5.105:8080',
				changeOrigin: true,
				// pathRewrite: {
				//  '^/rule': '/rule'    //代理的路径
				// }
			}
		},
	},
	css: {
		loaderOptions: {
			postcss: {
				plugins: [postcss]
			}
		}
	},

	configureWebpack: {
		resolve: {
			// resolve是webpack的内置选项，顾名思义，决定要做的事情，也就是说当使用 import "jquery"，该如何去执行这件事
			// 情就是resolve配置项要做的，import jQuery from "./additional/dist/js/jquery" 这样会很麻烦，可以起个别名简化操作
			extensions: ['.js', '.vue', '.json'], // 省略扩展名，也就是说.js,.vue,.json文件导入可以省略后缀名，这会覆盖默认的配置，所以要省略扩展名在这里一定要写上
			alias: {
				// resolve('src') 其实在这里就是项目根目录中的src目录，使用 import somejs from "@/some.js" 就可以导入指定文件，是不是很高大上
				'@': resolve('src')
			}
		}
	},
	



}
