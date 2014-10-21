var justLoginClient = require('just-login-client')
var LoginView = require('./login-view')
//var LoginController = require('./login-controller')
var AuthenticatedStuffView = require('./authenticated-stuff')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')
var ms = require('ms')
var waterfall = require('run-waterfall')

var config = require('confuse')().justLogin
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

domready(function() {
	var loginView = LoginView()
	//var loginController = LoginController()

	waterfall([ custom, client, attachListeners ])

	function custom(cb) {
		var stream = Shoe(CUSTOM_ENDPOINT)
		var d = Dnode()
		d.on('remote', function (customApi) {
			cb(null, customApi.incrementCounterIfAuthed)
		})
		d.pipe(stream).pipe(d)
	}

	function client(incrementCounterIfAuthed, cb) {
		var session = justLoginClient(DNODE_ENDPOINT, function(err, jlApi, sessionId) {
			var authenticatedStuffView = AuthenticatedStuffView()
			function loggedInNow(name) {
				//authenticatedStuffView.emit('authenticate', name)
				loginView.emit('authenticate', name)

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
			cb(null, session, jlApi, loggedInNow, authenticatedStuffView)
		})
	}

	function attachListeners(session, jlApi, loggedInNow, authenticatedStuffView) {
		console.log('client-src/index.js: attachListeners()')
		jlApi.isAuthenticated(function (err, name) {
			if (name) {
				loggedInNow(name)
			}
		})

		loginView.on('login', function (emailAddress) {
			jlApi.beginAuthentication(emailAddress, function (err, obj) {
				if (err) {
					console.log(err, obj)
				}
				if (err && err.debounce && obj && obj.remaining) {
					alert("Sorry, you must wait "+ms(obj.remaining, {long: true})+'.'+err.message)
				}
				//Possible cause of error is not waiting enough between beginAuth calls (keys are being used)
			})
		})

		loginView.on('logout', jlApi.unauthenticate.call(jlApi))

		session.on('session', function (sessionInfo) {
			console.log(sessionInfo.continued?'continued session':'new session')
			console.log('session id:',sessionInfo.sessionId)
		})

		session.on('authenticated', loggedInNow.bind(null))
	}
})