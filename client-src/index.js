var client = require('just-login-client')
var LoginView = require('./login-view')
//var LoginController = require('./login-controller')
var AuthenticatedStuffView = require('./authenticated-stuff')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')
var Debouncer = require('debouncer')
var ms = require('ms')

var DNODE_ENDPOINT = "/dnode-justlogin"
var CUSTOM_ENDPOINT = "/dnode-custom"

domready(function() {
	var loginView = LoginView()
	//var loginController = LoginController()
	var authenticatedStuffView = null
	var incrementCounterIfAuthed = null //from dnode on
	var loggedInNow = null

	var apiEmitter = client(DNODE_ENDPOINT, function(err, api, sessionId) {
		loggedInNow = function loggedInNow(name) {

			loginView.emit('authenticate', name)
			if (!authenticatedStuffView) {
				authenticatedStuffView = AuthenticatedStuffView()
				authenticatedStuffView.on('check', function() {
					if (incrementCounterIfAuthed) {
						incrementCounterIfAuthed(sessionId, function(err, counts) {
							if (err || typeof counts !== 'object') {
								authenticatedStuffView.emit('notAuthenticated')
								loginView.emit('notAuthenticated')
							} else {
								authenticatedStuffView.emit('countUpdated', counts)
							}
						})
					} else {
						console.log('oops')
					}
				})
			} else {
				authenticatedStuffView.emit('authenticate')
			}

		}

		api.isAuthenticated(function(err, name) {
			if (name) {
				loggedInNow(name)
			}
		})

		loginView.on('login', function (emailAddress) {
			api.beginAuthentication(emailAddress, function (err, obj) {
				if (err) {
					console.log(err, obj)
				}
				if (err && err.debounce && obj && obj.remaining) {
					alert("Sorry, you must wait "+ms(obj.remaining, {long: true})+'.'+err.message)
				}
				//Possible cause of error is not waiting enough between beginAuth calls (keys are being used)
			})
		})

		loginView.on('logout', function () {
			api.unauthenticate(function (err) {})
		})
	})

	apiEmitter.on('session', function (sessionInfo) {
		console.log(sessionInfo.continued?'continued session':'new session')
		console.log('session id:',sessionInfo.sessionId)
	})

	apiEmitter.on('authenticated', function (name) {
		loggedInNow(name)
	})


	var stream = Shoe(CUSTOM_ENDPOINT)
	var d = Dnode()
	d.on('remote', function (api) {
		incrementCounterIfAuthed = api.incrementCounterIfAuthed
	})
	d.pipe(stream).pipe(d);
})