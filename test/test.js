var test = require('tape')
var Server = require('../server-src/index.js')
var get = require('httpie').get

var levelup = require('levelup')
var encodingdown = require('encoding-down')
var memdown = require('memdown')

function makeServer(t, cb) {
	var port = Math.floor(Math.random() * 1000) + 1024
	levelup(encodingdown(memdown()), (err, db) => {
		var server = new Server(db)

		function end() {
			server.close(() => {
				db.close(() => {
					t.end()
				})
			})
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
	makeServer(t, function(host, end) {
		get(host + '/test.txt').then(res => {
			t.ok(res.statusCode, 200)
			t.equal(res.data, 'it works', 'it works')
		}).catch(err => {
			t.fail(err)
		}).finally(end)
	})
})

test('server serves index', function (t) { //serving files
	makeServer(t, function(host, end) {
		get(host).then(res => {
			t.ok(res.statusCode, 200)
			t.equal(res.data && typeof res.data, 'string', 'data is a string')
			t.ok(res.data && res.data.indexOf('you@youremail.com') > 0, 'got correct page back')
		}).catch(err => {
			t.fail(err)
		}).finally(end)
	})
})

test('server serves 404', function (t) { //serving files
	makeServer(t, function(host, end) {
		get(host + '/notfound12345').then(res => {
			t.fail('expected to get error')
		}).catch(err => {
			t.equal(err.statusCode, 404)
		}).finally(end)
	})
})

test('server redirects for token', function (t) {
	makeServer(t, function(host, end) {
		get(host + '/magical-login?token=c03846a8dd974a208fe3ed9abce8aa18', { redirect: false }).then(res => {
			t.ok(res.statusCode, 307)
			t.notOk(res.data)
		}).catch(err => {
			t.fail(err)
		}).finally(end)
	})
})

test('server re-routes for token', function (t) { //does stuff when magic token
	makeServer(t, function(host, end) {
		get(host + '/magical-login?token=c03846a8dd974a208fe3ed9abce8aa18').then(res => {
			t.ok(res.statusCode, 200)
			t.ok(res.data.indexOf('<h1>Failure!</h1>') !== -1, 'login failed response')
		}).catch(err => {
			t.fail(err)
		}).finally(end)
	})
})

test('config is not in dev mode', function (t) {
	t.ok(require('../config.json').domain, 'justlogin.xyz')
	t.end()
})
