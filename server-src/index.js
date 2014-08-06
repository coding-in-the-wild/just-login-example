var url = require('url')

var http = require('http')
var sendFiles = require('./sendFiles.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var dnode = require('dnode')
var shoe = require('shoe')
var JustLoginServerApi = require('just-login-server-api')
var JustLoginCore = require('just-login-core')
var Level = require('level')
var sublevel = require('sublevel')
var ttl = require('level-ttl')
var Cache = require('level-ttl-cache')

var SEND_DIR = "./static/"
var DNODE_ENDPOINT = "/dnode-justlogin"
var TOKEN_ENDPOINT = "/magical-login"

module.exports = function createServer() {
	var db = Level('./mydb')
	db = sublevel(db)
	db = ttl(db, { checkFrequency: 10*1000 }) //10 sec check time
	db.ttl('foo', 1000 * 60 * 60) //delete keys after 1 hr
	var justLoginCore = JustLoginCore(db.sublevel('jlc'))
	var justLoginServerApi = JustLoginServerApi(justLoginCore)
	sendEmailOnAuth(justLoginCore)
	var cache = new Cache({
		db: db,
		name: 'sessions',
		ttl: 60 * 60 * 1000, //1 hour ttl for all entries in this cache
		load: function (key, callback) {
		// do some (possibly async) work to load the value for `key`
		// and return it as the second argument to the callback,
		// the first argument should be null unless there is an error
		callback(null, value)
		}
	})

	var server = http.createServer(function requestListener(req, res) {
		var parsedUrl = url.parse(req.url, true) //Parse with queryString enabled
		var pathname = parsedUrl.pathname //get pathname from url
		var token = parsedUrl.query.token //get token from url, e.g. {token: "hexCode"}

		if (pathname.slice(0, DNODE_ENDPOINT.length) == DNODE_ENDPOINT) {
			//if dnode data transfer, do nothing
			//I probably misunderstand what's happening, 'cuz this block *never* runs...
		} else if (pathname == TOKEN_ENDPOINT) {
			if (token && token.length > 0) { //If the token looks ok...
				justLoginCore.authenticate(token, function (err, addr) { //...then try it
					if (err) {
						res.statusCode = 500
						res.end(err.message)
					} else if (addr) {
						res.end('ok you\'re logged in as ' + addr)
					} else {
						res.statusCode = 400
						res.end('hey that\'s not a valid token apparently')
					}
				})
			} else {
				res.statusCode = 400
				res.end("wat token plz")
			}
		} else {
			sendFiles(req, res, SEND_DIR)
		}
	})

	var dnodeApi = justLoginServerApi
	var clickCountingDb = db.sublevel('click-counting')

	dnodeApi.checkAuthenticationStatusAndIncrementCounter = function(sessionId, cb) {
		justLoginCore.isAuthenticated(sessionId, function(err, name) {
			if (err || !name) {
				return cb(err, name)
			}
			clickCountingDb.get(name, function(err, value) {
				var count
				if (err && err.notFound) {
					count = 0
				} else if (err) {
					return cb(err)
				} else {
					count = parseInt(value)
				}

				if (isNaN(count)) {
					count = 1
				} else {
					count = count + 1
				}
				clickCountingDb.put(name, count, function(err) {
					cb(err, count)
				})
			})
		})
	}

	var sock = shoe(function(stream) {
		var d = dnode(dnodeApi)
		d.pipe(stream).pipe(d)
	})
	sock.install(server, DNODE_ENDPOINT)

	return server
}
