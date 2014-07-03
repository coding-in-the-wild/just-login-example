var dnode = require('dnode')
var shoe = require('shoe')

var server = require('just-login-server-api')
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

//Checked
