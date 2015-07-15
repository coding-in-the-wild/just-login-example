var send = require('send')
var Router = require('router')
var url = require('url')

var config = require('confuse')().justLogin
var SEND_OPTS = { root: config.staticDir }

function serve(req, res, file) {
	var parsed = url.parse(req.url)
	if (typeof file !== 'string') file = parsed.pathname
	res.statusCode = 200 // Status code
	send(req, file, SEND_OPTS).pipe(res).on('error', handle)

	function handle(err) {
		res.statusCode = err.status || 500
		send(req, '/404.html', SEND_OPTS).pipe(res)
	}
}

module.exports = function (core) {
	var router = Router()

	router.get(config.endpoints.dnode, function () {})
	router.get(config.endpoints.custom, function () {})
	router.get(config.endpoints.token, function (req, res) {
		var parsed = url.parse(req.url, true)
		var token = parsed.query.token
		core.authenticate(token, function (err, addr) {
			if (err) { //Bad token, and other errors
				serve(req, res, 'loginFailure.html')
			} else {
				serve(req, res, 'loginSuccess.html')
			}
		})
	})

	return function requestHandler(req, res) {
		return router(req, res, function () { serve(req, res) })
	}
}
