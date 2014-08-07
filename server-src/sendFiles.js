var send = require('send')
var url = require('url')
var http = require('http')
var xtend = require('xtend')

var defaultOptions = {
	dir: './',
	file: '',
	defaultEmptyPath: 'index.html',
	loud: false
}

module.exports = function FileSender(constructorOptions) {
	return function fileSender(req, res, options) {
		options = xtend(defaultOptions, constructorOptions, options)

		var urlPathname = url.parse(req.url).pathname
		urlPathname = (urlPathname==='/' || !urlPathname) ? options.defaultEmptyPath : urlPathname
		options.file = options.file || urlPathname
		
		send(req, options.file, {root: options.dir, index:false})
			.on('error', function (err) {
				if (err && err.code == "ENOENT") { //file missing
					if (options.loud) {
						console.log("redir to 404")
					}
					res.statusCode = 301;
					res.setHeader('Location', url.resolve(req.url,'404.html'))
					res.end()
				} else {
					console.log("send err:", err.message)
					res.statusCode = err.status
					res.end(http.STATUS_CODES[err.status])
				}
			})
			.on('file', function (path, stat) {
				if (options.loud) {
					console.log("file request:",path)
				}
			})
			.on('directory', function () {
				if (options.loud) {
					console.log('directory')
				}
				res.statusCode = 301;
				res.setHeader('Location', req.url + 'index.html')
				res.end()
			})
			.on('headers', function (res, path, stat) {
				if (options.loud) {
					console.log('headers:',path,"\n")
				}
			})
			.on('end', function () {
				if (options.loud) {
					console.log('end')
				}
			})
			.pipe(res)
	}
}