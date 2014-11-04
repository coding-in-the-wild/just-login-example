//Server
var url = require('url')
var http = require('http')
var dnode = require('dnode')
var shoe = require('shoe')
var Static = require('node-static')
var Router = require('router')
var IncrementCountApi = require('./incrementCountApi.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
//Just Login
var JustLoginServerApi = require('just-login-server-api')
var JustLoginCore = require('just-login-core')
var justLoginDebouncer = require('just-login-debouncer')
//Other
var spaces = require('level-spaces')
var xtend = require('xtend')
//Config
var config = require('confuse')().justLogin
var DEFAULT_URL_OBJECT = config.url
var STATIC_DIR = config.staticDir
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom
var TOKEN_ENDPOINT =  config.endpoints.token

module.exports = function createServer(db, urlObject) {
	if (!db) {
		throw new Error('Must provide a levelup database')
	}

	var route = Router()
	var fileServer = new Static.Server(STATIC_DIR, {gzip: true})
	var core = JustLoginCore(db)
	
	var debouncingDb = spaces(db, 'debouncing')
	justLoginDebouncer(core, debouncingDb) //modifies 'core'

	var serverApi = JustLoginServerApi(core)
	var incrementCountApi = IncrementCountApi(core, db)

	urlObject = urlObject || xtend(
		DEFAULT_URL_OBJECT,
		{ pathname: TOKEN_ENDPOINT }
	)

	sendEmailOnAuth(core, urlObject, function (err, info) {
		if (err) {
			console.log('Error sending the email:')
			console.error(err)
		}
	})

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

	var server = http.createServer(route)

	shoe(function (stream) { //Basic authentication api
		var d = dnode(serverApi)
		d.pipe(stream).pipe(d)
	}).install(server, DNODE_ENDPOINT)

	shoe(function (stream) { //Custom api, in this case, the count incrementer
		var d = dnode(incrementCountApi)
		d.pipe(stream).pipe(d)
	}).install(server, CUSTOM_ENDPOINT)

	return server
}
