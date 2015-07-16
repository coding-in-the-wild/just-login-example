var test = require('tape')
var Server = require('../server-src/index.js')
var level = require('level-mem')
var got = require('got')

function makeServer(t, cb) {
	var port = ~~(Math.random() * 1000) + 1024
	var server = new Server(level())

	function end() {
		server.close(t.end.bind(t))
	}
	setTimeout(end, 3000).unref()

	server.listen(port, function() {
		cb('http://localhost:' + port, end)
	})

	server.on('error', function (err) {
		t.fail('ERROR: ' + err.message)
	})

	server.on('clientError', function (exception, socket) {
		t.fail('EXCEPTION: ' + exception + ' ON SOCKET ' + socket + '(done)')
	})
}

/*
var dnode = require('dnode')
var shoe = require('shoe')
test('server has dnode', function (t) { //dnode running and exposing api
	makeServer(t, function(host, end) {
		// var stream = shoe('/dnode')
		var d = dnode()
		d.on('remote', function (remote) {
			console.log('Remote callback returned')
			t.ok(true, 'connects to dnode')
			t.equal(typeof remote, 'object', 'remote is an object')
			t.equal(typeof remote.isAuthenticated, 'function', 'isAuthenticated is a function')
			t.equal(typeof remote.beginAuthentication, 'function', 'beginAuthentication is a function')
			t.equal(typeof remote.unauthenticate, 'function', 'unauthenticate is a function')

			server.close(t.end.bind(t))
		})
		// hook up stream here
	})
})
*/

test('server serves files', function (t) { //serving files
	t.plan(2)
	makeServer(t, function(host, end) {
		got(host + '/test.txt', function (err, data) {
			t.notOk(err, 'no error')
			t.equal(data, 'it works', 'it works')
			setTimeout(end, 500) //allow time for errors to be thrown
		})
	})
})

test('server serves index', function (t) { //serving files
	t.plan(3)
	makeServer(t, function(host, end) {
		got(host, function (err, data) {
			t.notOk(err, 'no error')
			t.equal(data && typeof data, 'string', 'data is a string')

			t.ok(data && data.indexOf('you@youremail.com') > 0, 'got correct page back')
			end()
		})
	})
})

test('server re-routes for token', function (t) { //does stuff when magic token
	t.plan(2)
	makeServer(t, function(host, end) {
		got(host + '/magical-login?token=c03846a8dd974a208fe3ed9abce8aa18', function (err, data) {
			t.notOk(err, err ? err.message : 'no error')
			t.ok(data, 'got a response')
			end()
		})
	})
})
