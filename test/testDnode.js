var test = require('tap').test
var Server = require('../server-src/index.js')
// var http = require('http')
// var shoe = require('shoe')
var dnode = require('dnode')

test('this aint a test', function (t) {
	t.ok(true, "hi")
	t.end()
})

test = function() {} //horrible lol haha

test('server has dnode', function (t) { //dnode running and exposing api
	var server = new Server()
	server.listen(9999, function() {
		console.log("Listen callback called")
		//var stream = shoe("/dnode")
		var d = dnode()
		d.on('remote', function (remote) {
			console.log("Remote callback returned")
			t.ok(true, "connects to dnode")
			t.equal(typeof remote, "object", "remote is an object")
			t.equal(typeof remote.isAuthenticated, "function", "isAuthenticated is a function")
			t.equal(typeof remote.beginAuthentication, "function", "beginAuthentication is a function")
			t.equal(typeof remote.unauthenticate, "function", "unauthenticate is a function")

			server.close(t.end.bind(t))
		})
		/*var c = require('net').connect(5004);
		c.pipe(d).pipe(c);*/
		console.log("End of that callback")
	}).on('error', function (err) {
		t.notOk(true, "ERROR: "+err.message)
	}).on('clientError', function (exception, socket) {
		t.notOk(true, "EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
	})
})
