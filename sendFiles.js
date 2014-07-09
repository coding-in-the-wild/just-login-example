var send = require('send')
var url = require('url')

module.exports = function sendFiles(req, res, dir) {
	send(req, url.parse(req.url).pathname, {root: dir})
		.on('error', function (err) {
			console.log("err:", err.message)
		})
		.on('file', function (path, stat) {
			console.log("file req:",path)
		})
		.on('directory', function() {
			console.log("directory")
			res.statusCode = 301;
			res.setHeader('Location', req.url + '/')
			res.end('Redirecting to ' + req.url + '/')
		}).on('headers', function (res, path, stat) {
			console.log('headers')
			//res.setHeader('Content-Disposition', 'attachment') //this made me download the file lol
		})
		.pipe(res)
}