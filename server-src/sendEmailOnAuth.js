var JustLoginEmailer = require('just-login-emailer')
var compile = require('string-template/compile')
var formatUrl = require('url').format
var fs = require('fs')
var path = require('path')
var config = require('confuse')().justLogin

var emailTemplate = fs.readFileSync(path.resolve(__dirname, 'emailTemplate.html'), 'utf8')
emailTemplate = compile(emailTemplate)

module.exports = function(core, baseUrl) {
	function htmlEmail(loginToken) {
		return emailTemplate({
			baseUrl: baseUrl,
			token: loginToken
		})
	}

	var emailer = JustLoginEmailer(core, {
		createHtmlEmail: htmlEmail,
		transport: config.email,
		mail: {
			subject: config.emailSubject
		}
	})

	emailer.on('error', function (err) {
		console.error('Error sending the email:', err)
	})
}
