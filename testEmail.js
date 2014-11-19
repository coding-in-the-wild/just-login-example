var emailer = require('just-login-emailer')
var emitter = new (require('events').EventEmitter)
var htmlEmail = function (token) {return '<h1>Hello</h1>\n' + token}
var config = require('confuse')().justLogin.email
var mailOpts = {
	from: config.auth.user,
	subject: 'hello'
}

emailer(emitter, htmlEmail, config, mailOpts, function (err) {
	if (err) {
		console.log('ERROR:', err)
	}
})

emitter.emit('authentication initiated', {
	token: 'lolz',
	contactAddress: 'josephdykstra@gmail.com'
})
