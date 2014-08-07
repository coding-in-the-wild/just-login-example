//Server
var url = require('url')
var http = require('http')
var FileSender = require('./sendFiles.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var dnode = require('dnode')
var shoe = require('shoe')
//Just Login
var JustLoginServerApi = require('just-login-server-api')
var JustLoginCore = require('just-login-core')
//Database
var Level = require('level')
var sublevel = require('sublevel')
var ttl = require('level-ttl')
var Cache = require('level-ttl-cache')
var ms = require('ms')
//Other
var IncrementCountApi = require('./incrementCountApi.js')
//Constants
var SEND_DIR = "./static/"
var DNODE_ENDPOINT = "/dnode-justlogin"
var CUSTOM_ENDPOINT = "/dnode-custom"
var TOKEN_ENDPOINT = "/magical-login"

module.exports = function createServer() {
	var fileSender = new FileSender( {dir: SEND_DIR} )
	var db = Level('./mydb')
	db = sublevel(db)
	db = ttl(db, { checkFrequency: ms('10 seconds') }) //10 sec check time
	db.ttl('foo', ms('1 hour')) //delete keys after 1 hr
	var timeoutDb = new Cache({                                     //NOT USED ANYWHERE!!!   FIX!!!
		db: db,
		name: 'sessions',
		ttl: ms('1 minute'), //1 hour ttl for (all?) entries in this cache
		load: function (key, callback) {                  //I think I'm using this wrong...........
			if (typeof callback === 'function') {
				console.log('cb is an instance of a function?', callback instanceof Function)
				process.nextTick(function() {
					callback(null, null) //idk if this is ok
				})
			} else {
				console.log('cb ain\'t a function:',callback)
			}
		}
	})
	var clickCountingDb = db.sublevel('click-counting')
	var justLoginCore = JustLoginCore(db)
	var justLoginServerApi = JustLoginServerApi(justLoginCore)
	var incrementCountApi = IncrementCountApi(justLoginCore, clickCountingDb) //Is 'clickCountingDb' supposed to be passed in?

	sendEmailOnAuth(justLoginCore, function (err, info) {
		if (err) {
			console.log('Error sending the email.', err||err.message)
		}
	})

	var server = http.createServer(function requestListener(req, res) {
		var parsedUrl = url.parse(req.url, true) //Parse with queryString enabled
		var pathname = parsedUrl.pathname //get pathname from url
		var token = parsedUrl.query.token //get token from url, e.g. {token: "19ed8309a9f02c84617"}

		if (pathname.slice(0, DNODE_ENDPOINT.length) == DNODE_ENDPOINT) {
			console.log("I am suprised that this is showing.")
			//if dnode data transfer, do nothing
			//I probably misunderstand what's happening, 'cuz this block *never* runs...
		} else if (pathname === TOKEN_ENDPOINT) {
			if (token && token.length > 0) { //If the token looks ok...
				justLoginCore.authenticate(token, function (err, addr) { //...then try it
					if (err) { //Bad token, and other errors
						res.statusCode = 500
						fileSender(req, res, {file: "loginFailure.html"})
					} else if (addr) { //Good token
						fileSender(req, res, {file: "loginSuccess.html"})
					} else {
						res.statusCode = 400
						fileSender(req, res, {file: "loginFailure.html"})
					}
				})
			} else { //if the token doesn't even look like a token
				res.statusCode = 400
				fileSender(req, res, {file: "loginFailure.html"})
			}
		} else {
			fileSender(req, res)
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
