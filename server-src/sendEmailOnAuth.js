var JustLoginEmailer = require('just-login-emailer')
var Ractive = require('ractive')
var password = require('sensitive').justLoginPw
var formatUrl = require('url').format
var fs = require('fs')
var path = require('path')

var hostOpts = require('../config.json').email
hostOpts.auth.pass = password

var parsedTemplate = Ractive.parse( // './emailTemplate.html' works but is confusing, because it is in the folder above
	fs.readFileSync(path.resolve(__dirname, '../emailTemplate.html'), 'utf8')
)

module.exports = function(core, urlObject, cb) {
	var mailOpts = {
		from: 'justloginexample@gmail.com',
		subject: 'Login to this site!'
	}
	var baseUrl = formatUrl(urlObject)

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

	JustLoginEmailer(core, htmlEmail, hostOpts, mailOpts, typeof cb === "function"? cb : function () {})
}
