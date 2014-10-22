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
			//authenticatedStuffView.emit('notAuthenticated', name)
			//loginView.emit('notAuthenticated', name)
			function loggedInNow(name) {
				console.log('loggedInNow('+name+')')
				authenticatedStuffView.emit('authenticated', name)
				loginView.emit('authenticated', name)

				authenticatedStuffView.on('check', function() {
					incrementCounterIfAuthed(sessionId, function(err, counts) {
						if (err || typeof counts !== 'object') {
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
		jlApi.isAuthenticated(function (err, name) {
			if (!err && name) {
				loggedInNow(name)
			}
		})

		loginView.on('login', function (emailAddress) {
			jlApi.beginAuthentication(emailAddress, function (err, obj) {
				if (err) {
					console.log(err, obj)
				}
				if (err && err.debounce && obj && obj.remaining) {
					authenticatedStuffView.emit('debounce', ms(obj.remaining, {long: true}))
				}
				//Possible cause of error is not waiting enough between beginAuth calls (keys are being used)
			})
		})

		loginView.on('badEmail', function (emailAddress) {
			authenticatedStuffView.emit('badEmail', emailAddress)
		})

		loginView.on('logout', function (name) {
			jlApi.unauthenticate(name)
		})

		session.on('session', function (sessionInfo) {
			console.log(sessionInfo.continued?'continued session':'new session')
			console.log('session id:',sessionInfo.sessionId)
		})

		session.on('authenticated', function (name) {
			loggedInNow(name)
		})
	}
})
