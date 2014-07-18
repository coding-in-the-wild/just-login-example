var url = require('url')
var parseQuerystring = require('querystring').parse
var http = require('http')
var sendFiles = require('./sendFiles.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var dnode = require('dnode')
var shoe = require('shoe')
var Jlsa = require('just-login-server-api')
var Jlc = require('just-login-core')
var Level = require('level')
var ttl = require('level-ttl')

var SEND_DIR = "./static/"
var DNODE_ENDPOINT = "/dnode"
var TOKEN_ENDPOINT = "/magical-login"

module.exports = function createServer() {
	var db = Level('./mydb')
	db = ttl(db, { checkFrequency: 10*1000 }) //10 sec check time
	db.ttl('foo', 1000 * 60 * 60) //delete keys after 1 hr
	var jlc = Jlc(db)
	var jlsa = Jlsa(jlc)
	sendEmailOnAuth(jlc)

	var server = http.createServer(function requestListener(req, res) {
		var pathname = url.parse(req.url).pathname
		if (pathname.slice(0, DNODE_ENDPOINT.length) == DNODE_ENDPOINT) {
		} else if (pathname == TOKEN_ENDPOINT) {
			var query = url.parse(req.url).query //get query, e.g. "?token=hexCode"
			var token = parseQuerystring(query).token //get token, e.g. {token: "hexCode"}
			if (token && token.length > 0) { //If the token looks ok...
				jlc.authenticate(token, function (err, addr) { //...then try it
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

	var sock = shoe(function(stream) {
		var d = dnode(jlsa)
		d.pipe(stream).pipe(d)
	})
	sock.install(server, DNODE_ENDPOINT)

	return server
}
