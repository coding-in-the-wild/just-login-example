//Server
var url = require('url')
var http = require('http')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var dnode = require('dnode')
var shoe = require('shoe')
//Just Login
var JustLoginServerApi = require('just-login-server-api')
var JustLoginCore = require('just-login-core')
//Database
var sublevel = require('level-sublevel')
var ms = require('ms')
//Other
var IncrementCountApi = require('./incrementCountApi.js')
var send = require('send')
//Constants
var SEND_DIR = "./static/"
var DNODE_ENDPOINT = "/dnode-justlogin"
var CUSTOM_ENDPOINT = "/dnode-custom"
var TOKEN_ENDPOINT = "/magical-login"

module.exports = function createServer(db, urlObject) {
	if (!db) {
		throw new Error('Must provide a leveldb')
	}
	var sendOptions = { root: SEND_DIR }
	db = sublevel(db)
	var clickCountingDb = db.sublevel('click-counting')
	var justLoginCore = JustLoginCore(db)
	var justLoginServerApi = JustLoginServerApi(justLoginCore)
	var incrementCountApi = IncrementCountApi(justLoginCore, clickCountingDb) //Is 'clickCountingDb' supposed to be passed in?

	var exposedApi = Object.create(justLoginServerApi)
	exposedApi.beginAuthentication = function beginAuthentication(emailAddress, cb) {
		debounce(emailAddress)
		justLoginServerApi.beginAuthentication(emailAddress, cb)
	}

	urlObject = urlObject || {
		protocol: 'http',
		hostname: 'localhost.com',
		port: 9999,
		pathname: TOKEN_ENDPOINT
	}

	sendEmailOnAuth(justLoginCore, urlObject, function (err, info) {
		if (err) {
			console.log('Error sending the email.', err || err.message)
		}
	})

	var server = http.createServer(function requestListener(req, res) {
		var parsedUrl = url.parse(req.url, true) //Parse with queryString enabled
		var pathname = parsedUrl.pathname //get pathname from url
		var token = parsedUrl.query.token //get token from url, e.g. {token: "19ed8309a9f02c84617"}

		function sendIt(path) {
			send(req, path, sendOptions).pipe(res)
		}

		if (pathname.slice(0, DNODE_ENDPOINT.length) == DNODE_ENDPOINT) {
			console.log("I am suprised that this is showing.")
			//if dnode data transfer, do nothing
			//I probably misunderstand what's happening, 'cuz this block *never* runs...
		} else if (pathname === TOKEN_ENDPOINT) {
			if (token && token.length > 0) { //If the token looks ok...
				justLoginCore.authenticate(token, function (err, addr) { //...then try it
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
		} else {
			sendIt(pathname)
		}
	})

	shoe(function (stream) { //Basic authentication api
		var d = dnode(justLoginServerApi)
		d.pipe(stream).pipe(d)
	}).install(server, DNODE_ENDPOINT)

	shoe(function (stream) { //Custom api, in this case, the count incrementer
		var d = dnode(incrementCountApi)
		d.pipe(stream).pipe(d)
	}).install(server, CUSTOM_ENDPOINT)

	return server
}
