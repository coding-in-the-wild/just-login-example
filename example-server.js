var dnode = require('dnode')
var shoe = require('shoe')
var http = require('http')
var jlsa = require('just-login-server-api')

var server = http.createServer(jlsa.requestListener)
server.listen(9999) //use whatever port you want

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


var sock = shoe(function (stream) {
	var d = dnode(jlsa.api)
	d.pipe(stream).pipe(d)
})
sock.install(server, '/dnode') //name of socket?

module.exports = server
//Checked
