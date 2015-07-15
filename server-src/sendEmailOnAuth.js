var JustLoginEmailer = require('just-login-emailer')
var Ractive = require('ractive')
var formatUrl = require('url').format
var fs = require('fs')
var path = require('path')
var config = require('confuse')().justLogin
Ractive.DEBUG = false

var parsedTemplate = Ractive.parse(
	fs.readFileSync(path.resolve(__dirname, 'emailTemplate.html'), 'utf8')
)

module.exports = function(core, baseUrl, cb) {
	var mailOpts = {
		from: config.email.auth.user,
		subject: config.emailSubject
	}

	function htmlEmail(loginToken) {
		return new Ractive({
			el: '',
			template: parsedTemplate,
			data: {
				token: loginToken,
				baseUrl: baseUrl
			}
		}).toHTML()
	}

	JustLoginEmailer(core, htmlEmail, config.email, mailOpts, cb)
}
