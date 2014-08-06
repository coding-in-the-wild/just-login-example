var test = require('tap').test
var Server = require('../server-src/index.js')
var request = require('superagent')


test('server serves index', function (t) { //serving files
	var server = new Server()

	server.listen(9999)

	server.on('listening', function() {
		request
			.get("localhost:9999")
			.end(function (res) {
				t.ok(res, "got a response")
				t.type(res.text, "string", "there is an url in res")
				t.ok(res.text.indexOf("you@youremail.com")>0, "got correct page back")
				server.close(t.end.bind(t))
			})
		})

	server.on('error', function (err) {
		t.fail("ERROR: "+err.message)
	})

	server.on('clientError', function (exception, socket) {
		t.fail("EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
	})
})