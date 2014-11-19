var Static = require('node-static')
var Router = require('router')
var url = require('url')
var path = require('path')

var config = require('confuse')().justLogin
var STATIC_DIR = config.staticDir
var TOKEN_ENDPOINT =  config.endpoints.token
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

module.exports = function (core) {
	var route = Router()
	var fileServer = new Static.Server(path.join(__dirname, STATIC_DIR), {gzip: true})

	function serve(file, req, res, code) {
		file = (file && typeof file === 'string') ? file : url.parse(req.url).pathname
		code = (code && typeof code === 'number') ? code : 200 //Status code

		fileServer.serveFile(file, code, {}, req, res).on('error', function (err) {
			if (err && (err.status === 404)) {
				fileServer.serveFile('/404.html', 404, {}, req, res)
			} else {
				res.writeHead((err && err.status) || 500, err.headers)
				res.end(err && err.message, 'utf8')
			}
		})
	}

	route.get('/', serve.bind(null, 'index.html'))
	route.get(TOKEN_ENDPOINT, function (req, res) {
		var token = url.parse(req.url, true).query.token
		core.authenticate(token, function (err, addr) {
			if (err) { //Bad token, and other errors
				serve('loginFailure.html', req, res, 500)
			} else if (!addr) {
				serve('loginFailure.html', req, res, 400)
			} else {
				serve('loginSuccess.html', req, res)
			}
		})
	})

	route.get(DNODE_ENDPOINT, function () {})
	route.get(CUSTOM_ENDPOINT, function () {})
	route.get(serve.bind(null, ''))

	return route
}
