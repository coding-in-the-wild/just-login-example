var Ractive = require('ractive')
var EventEmitter = require('events').EventEmitter
var emailIsValid = require('email-validator').validate

module.exports = function() {
	var emitter = new EventEmitter()

	var ractive = new Ractive({
		template: '#login-template',
		el: 'the-well-with-the-buttons-and-stuff',
		data: {
			loggedIn: false,
			loggingIn: false,
			emailAddressInput: '',
			authenticatedEmailAddress: null,
			apostrophe: "'"
		},
		append: true
	})

	function onLoginButton() {
		console.log('loginButton')
		var email = ractive.get('emailAddressInput')
		if (emailIsValid(email)) {
			emitter.emit('login', email)
			ractive.set('loggingIn', true)
		} else {
			emitter.emit('badEmail', email)
		}
	}

	function onLogoutButton() {
		console.log('logoutButton')
		ractive.set('loggedIn', false)
		emitter.emit('logout')
	}

	ractive.on({
		login: onLoginButton,
		logout: onLogoutButton
	})

	emitter.on('authenticated', function(emailAddress) {
		console.log('emitter.on(\'authenticated\')')
		ractive.set({
			'authenticatedEmailAddress': emailAddress,
			'loggedIn': true,
			'loggingIn': false
		})
	})

	emitter.on('notAuthenticated', onLogoutButton)

	return emitter
}