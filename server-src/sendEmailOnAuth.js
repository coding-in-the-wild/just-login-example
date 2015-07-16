var JustLoginEmailer = require('just-login-emailer')
var compile = require('string-template/compile')
var formatUrl = require('url').format
var fs = require('fs')
var path = require('path')
var config = require('confuse')().justLogin

var emailTemplate = fs.readFileSync(path.resolve(__dirname, 'emailTemplate.html'), 'utf8')
emailTemplate = compile(emailTemplate)

module.exports = function(core, baseUrl, cb) {

	var mailOpts = (process.env.CI) ? null : {
		from: config.email.auth.user,
		subject: config.emailSubject
	}

	function htmlEmail(loginToken) {
		return emailTemplate({
			baseUrl: baseUrl,
			token: loginToken
		})
	}

	JustLoginEmailer(core, htmlEmail, config.email, mailOpts, cb)
}
