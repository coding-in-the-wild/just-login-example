var JustLoginEmailer = require('just-login-emailer')
var stCompile = require('string-template/compile')
var fs = require('fs')
var path = require('path')
var config = require('../config.json')
var transportConfig = process.env.CI ? {} : require('./transport-config.json')

var emailTemplateString = fs.readFileSync(path.resolve(__dirname, 'emailTemplate.html'), 'utf8')
var emailTemplate = stCompile(emailTemplateString)

module.exports = function(core, baseUrl) {
	function htmlEmail(loginToken) {
		return emailTemplate({
			baseUrl: baseUrl,
			token: loginToken
		})
	}

	var emailer = JustLoginEmailer(core, {
		createHtmlEmail: htmlEmail,
		transport: transportConfig,
		mail: { subject: config.emailSubject }
	})

	emailer.on('error', function (err) {
		console.error('Error sending the email:', err)
	})
}
