var test = require('tap').test
var Server = require('../server-src/index.js')
var request = require('superagent')

test('server re-routes for token', function (t) { //does stuff when magic token
	var server = new Server()
	server.listen(9999, function() {
		request
			.get("localhost:9999/magical-login?token=c03846a8dd974a208fe3ed9abce8aa18") //uuid
			.on('error', function (err) {
				t.fail("ERROR: "+err.message)
			})
			.on('clientError', function (exception, socket) {
				t.fail("EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
			})
			.end(function (res) {
				t.ok(res, "got a response")
				server.close(t.end.bind(t))
			})
	})
})
