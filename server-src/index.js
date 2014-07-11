var url = require('url')
var parseQuerystring = require('querystring').parse
var http = require('http')
var sendFiles = require('./sendFiles.js')
//var sendEmailOnAuth = require('./emailWrapper.js')
var dnode = require('dnode')
var shoe = require('shoe')

var Jlsa = require('just-login-server-api')
var Jlc = require('just-login-core')
var Level = require('level-mem')

var SEND_DIR = "./static/"
var DNODE_ENDPOINT = "/dnode"
var TOKEN_ENDPOINT = "/magical-login" //localhost:9999/login?secretCode={{token}}

module.exports = function createServer(config) {
	config = config || {}
	var loud = config.loud || false
	var db = Level('uniqueNameHere')
	var jlc = Jlc(db)
	var jlsa = Jlsa(jlc)
	//sendEmailOnAuth(jlc)

	jlc.on('authentication initiated', function(loginRequest) {
		console.log("Pretend that an email got sent to " + loginRequest.contactAddress + " with a token of " + loginRequest.token)
	})

	var server = http.createServer(function requestListener(req, res) {
		var pathname = url.parse(req.url).pathname
		if (loud) console.log("pathname:", pathname)
		if (pathname.slice(0, DNODE_ENDPOINT.length + 1) == DNODE_ENDPOINT + "/") {
			if (loud) console.log("hit dnode...")
		} else {
			if (pathname == TOKEN_ENDPOINT) {
				var query = url.parse(req.url).query
				var token = parseQuerystring(query).token
				if (token && token.length > 0) {
					jlc.authenticate(token, function (err, addr) {
						if (err) {
							res.statusCode = 500
							res.end(err.message)
						} else if (addr) {
							res.end('ok you\'re logged in as ' + addr)
						} else {
							res.statusCode = 400
							res.end('what are you doing that\'s not a valid token apparently')
						}
					})
				} else {
					res.statusCode = 400
					res.end("wat token plz")
				}
			} else {
				sendFiles(req, res, SEND_DIR)
			}
		}
	})

	var sock = shoe(function(stream) {
		var d = dnode(jlsa)
		d.pipe(stream).pipe(d)
	})
	sock.install(server, DNODE_ENDPOINT)

	return server
}
