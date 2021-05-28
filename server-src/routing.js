var url = require('url')
var path = require('path')
var send = require('send')

var config = require('../config.json')
var staticOpts = {
	// https://github.com/pillarjs/send#options
	root: path.join(__dirname, '..', config.staticDir),
}

module.exports = function (core) {
	return function requestHandler(req, res) {
		var parsed = url.parse(req.url, true)
		var authAttempt = parsed.pathname.indexOf(config.endpoints.token) === 0

		if (authAttempt) {
			var token = parsed.query.token
			core.authenticate(token, function (err, addr) {
				var pathname = err ? '/loginFailure.html' : '/loginSuccess.html'

				res.writeHead(307, { Location: url.resolve(req.url, pathname) })
				res.end()
			})
		} else {
			send(req, parsed.pathname, staticOpts).pipe(res)
		}
	}
}
