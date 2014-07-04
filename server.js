var url = require('url')
var send = require('send')
var api = require('just-login-server-api')

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
			res.setHeader('Location', req.url + '/');
			res.end('Redirecting to ' + req.url + '/');
		}).on('headers', function (res, path, stat) {
			console.log('headers')
			//res.setHeader('Content-Disposition', 'attachment'); //this made me download the file
		})
		.pipe(res)

	/*var sock = shoe(function (stream) {
		var d = dnode(api)
		d.pipe(stream).pipe(d)
	})
	sock.install(server, '/dnode')*/
	
	/*var dnode = require('dnode');
	var net = require('net');

	var server = net.createServer(function (c) {
		var d = dnode(api);
		c.pipe(d).pipe(c);
	});

	server.listen(5004);*/
}

module.exports = function() {
	return require('http').createServer(requestListener)
}
