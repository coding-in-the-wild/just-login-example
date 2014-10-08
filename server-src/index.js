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
var Debouncer = require('debouncer')
var ASQ = require('asynquence')
var send = require('send')
var xtend = require('xtend')
//Constants
var DEFAULT_URL_OBJECT = require('../config.json').url
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
	var debouncingDb = db.sublevel('debouncing')
	var originalCore = JustLoginCore(db)
	var core = Object.create(originalCore)

	var debounce = new Debouncer(debouncingDb, { //Untested :)
			delayTimeMs: ['0 s', '5 s', '30 s', '5 m', '10 m', '30 m', '1 hr'].map(function (str) {
				return ms(str)
			})
		}
	})

	core.beginAuthentication = function beginAuthentication(sessionId, emailAddress, cb) {
		ASQ().gate( //parallel
			function (done) {
				debounce(emailAddress, function(err, allowed, remaining) {
					done.errfcb(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}, function (done) {
				debounce(sessionId, function(err, allowed, remaining) {
					done.errfcb(err, {
						allowed: allowed,
						remaining: remaining
					})
				})
			}
		).val(function (email, session) {
			if (email.allowed && session.allowed) { //This is what we want
				originalCore.beginAuthentication(sessionId, emailAddress, cb)
			} else  { //Email and/or session debounce failed
				var debounceError = new Error('Email and/or session debounce failure')
				debounceError.debounce = true
				cb(debounceError, {
					allowed: false,
					remaining: Math.max(email.remaining, session.remaining) || email.remaining || session.remaining
				})
			}
		}).onerror(cb)
	}

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

		if (pathname.slice(0, DNODE_ENDPOINT.length) == DNODE_ENDPOINT) {
			console.log("I am suprised that this is showing")
			//if dnode data transfer, do nothing
			//I probably misunderstand what's happening, 'cuz this block *never* runs...
		} else if (pathname === TOKEN_ENDPOINT) {
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
		} else {
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
