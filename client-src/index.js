var justLoginClient = require('just-login-client')
var EmailView = require('./email-view')
var StatusView = require('./status-view')
var domready = require('domready')
var shoe = require('shoe')
var dnode = require('dnode')
var ms = require('ms')
var waterfall = require('run-waterfall')
var endpoints = require('../config.json').endpoints

domready(function() {
	var emailView = EmailView()
	var statusView = StatusView()

	emailView.on('badEmail', function (emailAddress) {
		statusView.emit('badEmail', emailAddress)
	})

	function onLogin(name) {
		statusView.emit('authenticated', name)
		emailView.emit('authenticated', name)
	}
	function onLogout() {
		statusView.emit('notAuthenticated')
		emailView.emit('notAuthenticated')
	}

	waterfall([ custom, createSession, attachListeners ], function (err) {
		throw err
	})

	function custom(cb) {
		var stream = shoe(endpoints.custom)
		var d = dnode()
		d.on('remote', function (customApi) {
			cb(null, customApi.incrementCounterIfAuthed)
		})
		d.pipe(stream).pipe(d)
	}

	function createSession(increment, cb) {
		var session = justLoginClient(endpoints.dnode, function(err, jlApi, sessionId) {
			statusView.on('check', function() {
				increment(sessionId, function(err, counts) {
					if (err || typeof counts !== 'object') {
						onLogout()
					} else {
						statusView.emit('countUpdated', counts)
					}
				})
			})

			cb(err, jlApi)
		})
		session.on('authenticated', onLogin)
	}

	function attachListeners(jlApi) {
		emailView.on('logout', jlApi.unauthenticate)

		jlApi.isAuthenticated(function (err, name) { //checks if is authenticated when page opens
			if (name) onLogin(name)
		})

		emailView.on('login', function (emailAddress) {
			statusView.emit('loaded')
			jlApi.beginAuthentication(emailAddress, function (err, obj) {
				if (err && err.debounce) {
					var message = (obj && obj.remaining) ? ms( obj.remaining, { long: true }) : 'a little while'
					statusView.emit('debounce', message)
				}
			})
		})
	}
})
