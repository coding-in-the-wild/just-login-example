var emailer = require('just-login-emailer')
var emitter = new (require('events').EventEmitter)
var htmlEmail = function (token) {return 'Your token is: ' + token}
var config = require('confuse')().justLogin
var mailOpts = {
	from: config.email.auth.user,
	subject: config.emailSubject
}

emailer(emitter, htmlEmail, config.email, mailOpts, function (err) {
	if (err) {
		console.log('ERROR:', err)
	}
})

emitter.emit('authentication initiated', {
	token: 'lolz',
	contactAddress: 'josephdykstra@gmail.com'
})
