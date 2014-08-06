var send = require('send')
var url = require('url')
var http = require('http')
var xtend = require('xtend')

var defaultOptions = {
	dir: './',
	file: '',
	loud: false
}

module.exports = function FileSender(constructorOptions) {
	return function fileSender(req, res, options) {
		//console.log("File:", options?options.file?options.file:"No file provided":"No file provided (no opts)")
		options = xtend(defaultOptions, constructorOptions, options)

		var usingRequestUrl = !options.file
		var urlPathname = url.parse(req.url).pathname
		urlPathname = urlPathname==='/' ? '' : urlPathname
		options.file = options.file || urlPathname || '\\index.html' //last thing bad?
		//console.log("options.file:",options.file, "\nurl pathname:", urlPathname)
		
		send(req, options.file, {root: options.dir, })
			.on('error', function (err) {
				console.log("ERROR", err.code)
				if (err && err.code == "ENOENT") { //file missing
					if (usingRequestUrl) {
						console.log("redir to 404")
						res.statusCode = 301;
						res.setHeader('Location', url.resolve(req.url,'404.html'))
						res.end('Redirecting to ' + url.resolve(req.url,'404.html'))
						//console.log("\n==================================================")
					} else {
						res.end('um hi')
						console.log('um hi')
						//console.log("\n==================================================")
					}
				} else {
					console.log("send err:", err.message, "\nUsing request url:", usingRequestUrl)
					res.statusCode = err.status
					res.end(http.STATUS_CODES[err.status])
					//console.log("\n==================================================")
				}
			})
			.on('file', function (path, stat) {
				if (options.loud) {
					console.log("file req:",path)
				}
				if (path === "static\\favicon.ico") {
					//console.log("\n==================================================")
				}
			})
			.on('directory', function() {
				//if (options.loud) {
					console.log("directory")
				//}
				res.statusCode = 301;
				//res.setHeader('Location', req.url + 'index.html')
				//res.end('Redirecting to ' + req.url + '/index.html')
				//console.log("\n==================================================")
			})
			.on('headers', function (res, path, stat) {
				//if (options.loud) {
					console.log('headers:',path,"\n")
				//}
			})
			.on('end', function () {
				console.log('end')
			})
			.pipe(res)
	}
}