var Ractive = require('ractive')
var EventEmitter = require('events').EventEmitter

module.exports = function() {
	var emitter = new EventEmitter()

	var ractive = new Ractive({
		template: '#login-template',
		el: 'the-well-with-the-buttons-and-stuff',
		data: {
			loggedIn: false,
			loggingIn: false,
			emailAddressInput: '',
			authenticatedEmailAddress: null
		},
		append: true
	})

	function onLoginButton() {
		var email = ractive.get('emailAddressInput')
		emitter.emit('login', email)
		ractive.set('loggingIn', true)
	}

	function onLogoutButton() {
		ractive.set('loggedIn', false)
		emitter.emit('logout')
	}

	ractive.on({
		login: onLoginButton,
		logout: onLogoutButton
	})

	emitter.on('authenticate', function(emailAddress) {
		ractive.set('authenticatedEmailAddress', emailAddress)
		ractive.set('loggedIn', true)
		ractive.set('loggingIn', false)
	})

	emitter.on('notAuthenticated', onLogoutButton)

	return emitter
}