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
		var email = ractive.get('emailAddressInput')
		if (emailIsValid(email)) {
			emitter.emit('login', email)
			ractive.set('loggingIn', true)
		} else {
			//tell the user that they're dumb, but NOT with an alert. (FIX!)
			alert("That's not an email address!")
		}
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