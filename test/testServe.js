var test = require('tap').test
var Server = require('../server-src/index.js')
var request = require('superagent')

test('server serves files', function (t) { //serving files
	var server = new Server()

	server.listen(9999)

	server.on('listening', function() {
		request
			.get("localhost:9999/test.txt")
			.end(function (res) {
				t.ok(res, "got a response")
				t.equal(typeof res.text, "string", "text is in res")
				t.equal(res.text, "it works", "it works")
				server.close(t.end.bind(t))
			})
		})

	server.on('error', function (err) {
		t.notOk(true, "ERROR: "+err.message)
	})

	server.on('clientError', function (exception, socket) {
		t.notOk(true, "EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
	})
})
