var JustLoginEmailer = require('just-login-emailer')
var Ractive = require('ractive')
var password = require('../../#sensitive-info/just-login-email-opts.js')
var formatUrl = require('url').format

var hostOpts = require('../config.json').email
hostOpts.auth.pass = password

var emailTemplate = require('fs').readFileSync('./emailTemplate.html', 'utf8')
var parsedTemplate = Ractive.parse(emailTemplate)

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
