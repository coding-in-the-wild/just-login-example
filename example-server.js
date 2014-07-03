var dnode = require('dnode')
var http = require('http')
var shoe = require('shoe')
var url = require('url')
var send = require('send')

var server = http.createServer().on('request', function(req, res) {
	send(req, url.parse(req.url).pathname, {root: './static'})
		.on('error', function(err) {
			console.log("bad url or something:",err.message)
		}).on('file', function(path, stat) {
			console.log("file req:",path)
		}).on('directory', function() {
			res.statusCode = 301;
			res.setHeader('Location', req.url + '/');
			res.end('Redirecting to ' + req.url + '/');
		})
		//.on('headers', headers)
		.pipe(res)
})
server.listen(9999)

var sock = shoe(function (stream) {
	var loggedIn = false
	setTimeout(function() {
		loggedIn = true
	}, 500)

	var d = dnode({
		isAuthenticated: function(cb) {
			//process.nextTick(function () {
				cb(null, loggedIn)
			//})
		}
	})
	d.pipe(stream).pipe(d)
})
sock.install(server, '/dnode') //name of socket?

//Checked
