var test = require('tap').test
var Server = require('../server-src/index.js')
var request = require('superagent')
var level = require('level-mem')

test('server serves files', function (t) { //serving files
	var server = new Server(level('wat'))

	server.listen(9999)

	server.on('listening', function() {
		request
			.get("localhost:9999/test.txt")
			.end(function (res) {
				t.ok(res, "got a response")
				t.type(res.text, "string", "there is text in res")
				t.equal(res.text, "it works", "it works")
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
