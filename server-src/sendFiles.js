var send = require('send')
var url = require('url')
var http = require('http')

module.exports = function sendFiles(req, res, dir, config) {
	config = config || {}
	send(req, url.parse(req.url).pathname, {root: dir})
		.on('error', function (err) {
			if (err && err.code == "ENOENT") { //file missing
				res.statusCode = 301;
				res.setHeader('Location', url.resolve(req.url,'404.html'))
				res.end('Redirecting to ' + url.resolve(req.url,'404.html'))
			} else {
				console.log("send err:", err.message)
				res.statusCode = err.status
				res.end(http.STATUS_CODES[err.status])
			}
		})
		.on('file', function (path, stat) {
			if (config.loud) console.log("file req:",path)
		})
		.on('directory', function() {
			if (config.loud) console.log("directory")
			res.statusCode = 301;
				res.setHeader('Location', req.url + 'index.html')
				res.end('Redirecting to ' + req.url + '/index.html')
		}).on('headers', function (res, path, stat) {
			if (config.loud) console.log('headers')
		}).pipe(res)
}