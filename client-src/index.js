var justLoginClient = require('just-login-client')
var EmailView = require('./email-view')
var StatusView = require('./status-view')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')
var ms = require('ms')
var waterfall = require('run-waterfall')

var config = require('../config.json').justLogin //cannot require('confuse')() in client, b/c no fs module
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

domready(function() {
	var emailView = EmailView()
	var statusView = StatusView()

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
				statusView.emit('authenticated', name)
				emailView.emit('authenticated', name)

				statusView.on('check', function() {
					incrementCounterIfAuthed(sessionId, function(err, counts) {
						if (err || typeof counts !== 'object') {
							statusView.emit('notAuthenticated')
							emailView.emit('notAuthenticated')
						} else {
							statusView.emit('countUpdated', counts)
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

		emailView.on('login', function (emailAddress) {
			statusView.emit('loaded')
			jlApi.beginAuthentication(emailAddress, function (err, obj) {
				if (err && err.debounce) {
					var message = (obj && obj.remaining) ? ms( obj.remaining, {long: true}) : "a little while"
					statusView.emit('debounce', message)
				}
			})
		})

		emailView.on('badEmail', function (emailAddress) {
			statusView.emit('badEmail', emailAddress)
		})

		emailView.on('logout', function (name) {
			jlApi.unauthenticate(name)
		})

		session.on('session', function (sessionInfo) {})

		session.on('authenticated', function (name) {
			loggedInNow(name)
		})
	}
})
