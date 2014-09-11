var client = require('just-login-client')
var LoginView = require('./login-view')
var LoginController = require('./login-controller')
var AuthenticatedStuffView = require('./authenticated-stuff')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')
var Debouncer = require('debouncer')

var DNODE_ENDPOINT = "/dnode-justlogin"
var CUSTOM_ENDPOINT = "/dnode-custom"

domready(function() {
	var loginView = LoginView()
	var loginController = LoginController()
	var authenticatedStuffView = null
	var checkAuthenticationStatusAndIncrementCounter = null //from dnode on
	var loggedInNow = null

	var debouncer = new Debouncer

	5s 30s 5min 10min 30min hr

	var apiEmitter = client(DNODE_ENDPOINT, function(err, api, sessionId) {
		loggedInNow = function loggedInNow(name) {

			loginView.emit('authenticate', name)
			if (!authenticatedStuffView) {
				authenticatedStuffView = AuthenticatedStuffView()
				authenticatedStuffView.on('check', function() {
					if (checkAuthenticationStatusAndIncrementCounter) {
						checkAuthenticationStatusAndIncrementCounter(sessionId, function(err, count) {
							if (err || typeof count !== 'number') {
								authenticatedStuffView.emit('notAuthenticated')
								loginView.emit('notAuthenticated')
							} else {
								authenticatedStuffView.emit('countUpdated', count)
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
				//if error, print error to screen.
				//Possible cause of error is not waiting enough between beginAuth calls
			})
		})

		loginView.on('logout', function() {
			api.unauthenticate(function(err) {})
		})
	})

	apiEmitter.on('session', function(sessionInfo) {
		console.log(sessionInfo.continued?'continued session':'new session')
		console.log('session id:',sessionInfo.sessionId)
	})

	apiEmitter.on('authenticated', function(name) {
		loggedInNow(name)
	})


	var stream = Shoe(CUSTOM_ENDPOINT) //change 'justlogin' to 'custom'
	var d = Dnode()
	d.on('remote', function (api) {
		checkAuthenticationStatusAndIncrementCounter = api.checkAuthenticationStatusAndIncrementCounter
	})
	d.pipe(stream).pipe(d);
})