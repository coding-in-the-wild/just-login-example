var client = require('just-login-client')

module.exports = function () {
	client(function (err, api, sessionId) {
		if (err) {
			console.error(err)
		} else {
			globalApi = api //purposeful omission of 'var'
		}
	})
}