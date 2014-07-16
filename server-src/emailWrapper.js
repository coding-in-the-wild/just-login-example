var JustLoginEmailer = require('just-login-emailer')
var Ractive = require('ractive')
var password = require('../../#sensitive-info/just-login-email-opts.js')
var hostOpts = {
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'justloginexample@gmail.com',
		pass: password
	}
}

module.exports = function(core) {
	var defaultMailOptions = {
		from: 'justloginexample@gmail.com',
		//replyTo: 'justloginexample@gmail.com',
		subject: 'Login to this site!'
	}

	function createHtmlEmail(loginToken) {
		return new Ractive({
			el: '',
			template: Ractive.parse('<div>You should totally log in!<br />'
				+ 'Click <a href="http://localhost:9999/magical-login?secretCode={{token}}">here!</a></div>'),
			data: {
				token: loginToken
			}
		}).toHTML()
	}

	JustLoginEmailer(core, createHtmlEmail, hostOpts, defaultMailOptions)
}
