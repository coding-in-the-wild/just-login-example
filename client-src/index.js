var justLoginClient = require('just-login-client')
var LoginView = require('./login-view')
var AuthenticatedStuffView = require('./authenticated-stuff')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')
var ms = require('ms')
var waterfall = require('run-waterfall')

var config = require('../config.json').justLogin //cannot require('confuse')() in client, b/c no fs module
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

domready(function() {
	var loginView = LoginView()
	var authenticatedStuffView = AuthenticatedStuffView()

	waterfall([ custom, createSession, attachListeners ])

	function custom(cb) {
		var stream = Shoe(CUSTOM_ENDPOINT)
		var d = Dnode()
		d.on('remote', function (customApi) {
			cb(null, customApi.incrementCounterIfAuthed)
		})
		d.pipe(stream).pipe(d)
	}

	function createSession(incrementCounterIfAuthed, cb) {
		var session = justLoginClient(DNODE_ENDPOINT, function(err, jlApi, sessionId) {
			function loggedInNow(name) {
				authenticatedStuffView.emit('authenticated', name)
				loginView.emit('authenticated', name)

				authenticatedStuffView.on('check', function() {
					incrementCounterIfAuthed(sessionId, function(err, counts) {
						if (err || typeof counts !== 'object') {
							console.log("cli-src/index", err, typeof counts, sessionId)
							authenticatedStuffView.emit('notAuthenticated')
							loginView.emit('notAuthenticated')
						} else {
							authenticatedStuffView.emit('countUpdated', counts)
						}
					})
				})
			}
			cb(null, session, jlApi, loggedInNow)
		})
	}

	function attachListeners(session, jlApi, loggedInNow) {
		jlApi.isAuthenticated(function (err, name) { //checks if is authenticated when page opens
			if (!err && name) {
				loggedInNow(name)
			}
		})

		loginView.on('login', function (emailAddress) {
			authenticatedStuffView.emit('loaded')
			jlApi.beginAuthentication(emailAddress, function (err, obj) {
				if (err && err.debounce) {
					var message = (obj && obj.remaining) ? ms( obj.remaining, {long: true}) : "a little while"
					authenticatedStuffView.emit('debounce', message)
				}
			})
		})

		loginView.on('badEmail', function (emailAddress) {
			authenticatedStuffView.emit('badEmail', emailAddress)
		})

		loginView.on('logout', function (name) {
			jlApi.unauthenticate(name)
		})

		session.on('session', function (sessionInfo) {})

		session.on('authenticated', function (name) {
			loggedInNow(name)
		})
	}
})
