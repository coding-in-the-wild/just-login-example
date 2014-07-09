var url = require('url')
var http = require('http')
var send = require('send')
var createSession = require('just-login-client')
var Jlsa = require('just-login-server-api')
var Jlc = require('just-login-core')
var Level = require('level-mem')
var db = Level('uniqueNameHere')
var jlc = Jlc(db)
var jlsa = Jlsa(jlc)
var dnode = require('dnode')
var shoe = require('shoe')

var requestListener = function requestListener(req, res) {
	send(req, url.parse(req.url).pathname, {root: "./static/"})
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
			//res.setHeader('Content-Disposition', 'attachment'); //this made me download the file lol
		})
		.pipe(res)
}

var server = http.createServer(requestListener)
server.listen(9999)

var sock = shoe(function (stream) {
	var d = dnode(jlsa)
	d.pipe(stream).pipe(d)
})
sock.install(server, '/dnode')

module.exports = server
