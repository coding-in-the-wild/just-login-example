var domready = require('domready')
var shoe = require('shoe')
var dnode = require('dnode')

domready(function () {
	var stream = shoe('/dnode')
	
	var d = dnode()
	d.on('remote', function (remote) {
		console.log("successful connection")
		remote.isAuthenticated(function (e, a) {
			if (!e) console.log("api:",a)
		})
	})
	d.pipe(stream).pipe(d)
})
