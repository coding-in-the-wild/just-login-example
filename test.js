var test = require('tap').test
var Server = require('../server-src/index.js')
var level = require('level-mem')
var request = require('superagent') //used in 3
var dnode = require('dnode') //used in one test

/*
test('server has dnode', function (t) { //dnode running and exposing api
	var db = level('wat')
	var server = new Server(db)
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
		console.log("End of that callback")
	}).on('error', function (err) {
		t.notOk(true, "ERROR: "+err.message)
	}).on('clientError', function (exception, socket) {
		t.notOk(true, "EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
	})
})
// */

var test = require('tap').test

test('server serves files', function (t) { //serving files
	var server = new Server(level('wat'))

	server.listen(9999, function() {
		request
			.get("localhost:9999/test.txt")
			.end(function (res) {
				t.ok(res, "got a response")
				t.type(res.text, "string", "there is text in res")
				t.equal(res.text, "it works", "it works")
				setTimeout(function () {
					server.close(t.end.bind(t))
				}, 500) //allow time for errors to be thrown
			}
		)
	})

	server.on('error', function (err) {
		t.fail("ERROR: "+err.message)
	})

	server.on('clientError', function (exception, socket) {
		t.fail("EXCEPTION: "+exception+" ON SOCKET "+socket+"(done)")
	})
})

test('server serves index', function (t) { //serving files
	var server = new Server(level('wat'))

	server.listen(9999)

	server.on('listening', function() {
		request
			.get("localhost:9999")
			.end(function (res) {
				t.ok(res, "got a response")
				t.type(res.text, "string", "there is an url in res")

				t.ok(res.text && res.text.indexOf("you@youremail.com")>0, "got correct page back")
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

test('server re-routes for token', function (t) { //does stuff when magic token
	var server = new Server(level('wat'))
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
