//Server
var url = require('url')
var http = require('http')
var dnode = require('dnode')
var shoe = require('shoe')
var send = require('send')
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
var SEND_DIR = config.staticDir
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom
var TOKEN_ENDPOINT =  config.endpoints.token

module.exports = function createServer(db, urlObject) {
	if (!db) {
		throw new Error('Must provide a levelup database')
	}

	var sendOptions = { root: SEND_DIR }
	var core = JustLoginCore(db)
	
	var debouncingDb = spaces(db, 'debouncing')
	justLoginDebouncer(core, debouncingDb) //modifies 'core'

	var serverApi = JustLoginServerApi(core)
	var incrementCountApi = IncrementCountApi(core, db) //this uses sublevel to partition

	urlObject = urlObject || xtend(
		DEFAULT_URL_OBJECT,
		{ pathname: TOKEN_ENDPOINT }
	)

	sendEmailOnAuth(core, urlObject, function (err, info) {
		if (err) {
			console.log('Error sending the email', err || err.message)
		}
	})

	var server = http.createServer(function requestListener(req, res) {
		var parsedUrl = url.parse(req.url, true) //Parse with queryString enabled
		var pathname = parsedUrl.pathname //get pathname from url
		var token = parsedUrl.query.token //get token from url, e.g. {token: "19ed8309a9f02c84617"}

		function sendIt(path) {
			send(req, path, sendOptions).pipe(res)
		}

		if (pathname === TOKEN_ENDPOINT) {
			if (token && token.length > 0) { //If the token looks ok...
				core.authenticate(token, function (err, addr) { //...then try it
					var file = 'loginSuccess.html'

					if (err) { //Bad token, and other errors
						res.statusCode = 500
						file = 'loginFailure.html'
					} else if (!addr) {
						res.statusCode = 400
						file = 'loginFailure.html'
					}
					sendIt(file)
				})
			} else { //if the token doesn't even look like a token
				res.statusCode = 400
				sendIt('loginFailure.html')
			}
		} else if (pathname.slice(0, DNODE_ENDPOINT.length) != DNODE_ENDPOINT) { //not dnode
			sendIt(pathname)
		}
	})

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
