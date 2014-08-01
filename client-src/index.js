var client = require('just-login-client')
var LoginView = require('./login-view')
var AuthenticatedStuffView = require('./authenticated-stuff')
var domready = require('domready')
var Shoe = require('shoe')
var Dnode = require('dnode')

domready(function() {
	var loginView = LoginView()
	var authenticatedStuffView = null
	var checkAuthenticationStatusAndIncrementCounter = null
	var loggedInNow = null

	var apiEmitter = client(function(err, api, sessionId) {
		loggedInNow = function loggedInNow(name) {
			loginView.emit('authenticate', name)
			if (!authenticatedStuffView) {
				authenticatedStuffView = AuthenticatedStuffView()
				authenticatedStuffView.on('check', function() {
					if (checkAuthenticationStatusAndIncrementCounter) {
						checkAuthenticationStatusAndIncrementCounter(sessionId, function(err, count) {
							if (err || typeof count !== 'number') {
								console.log(err, count)
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

		loginView.on('login', function(emailAddress) {
			api.beginAuthentication(emailAddress, function(err, obj) {
				if (err) {
				}
			})
		})

		loginView.on('logout', function() {
			api.unauthenticate(function() {})
		})
	})

	apiEmitter.on('authenticated', function(name) {
		loggedInNow(name)
	})


	var stream = Shoe('/dnode')
	var d = Dnode()
	d.on('remote', function (api) {
		checkAuthenticationStatusAndIncrementCounter = api.checkAuthenticationStatusAndIncrementCounter
	})
	d.pipe(stream).pipe(d);
})