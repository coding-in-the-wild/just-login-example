var url = require('url')
var http = require('http')
var sendFiles = require('./sendFiles.js')
var tokenReader = require('./tokenReader.js')
var sendEmailOnAuth = require('./emailWrapper.js')
var dnode = require('dnode')
var shoe = require('shoe')

var createSession = require('just-login-client')
var Jlsa = require('just-login-server-api')
var Jlc = require('just-login-core')
var Level = require('level-mem')
var db = Level('uniqueNameHere')
var jlc = Jlc(db)
var jlsa = Jlsa(jlc)

var SEND_DIR = "./static/"
var PORT = 9999
var DNODE_ENDPOINT = "/dnode"
var TOKEN_ENDPOINT = "/login.html" //localhost:9999/login?secretCode={{token}}
var TOKEN_SEARCH_RE = /^\?secretCode=[0-9a-f]{32}$/i

var server = http.createServer( function requestListener(req, res) {
	var pathname = url.parse(req.url).pathname
	console.log("pathname:", pathname)
	if (pathname.slice(0,DNODE_ENDPOINT.length+1) == DNODE_ENDPOINT+"/") {
		console.log("hit dnode...")
	} else {
		sendFiles(req, res, SEND_DIR)
		if (pathname == TOKEN_ENDPOINT)
			tokenReader(url.parse(req.url).search, TOKEN_SEARCH_RE, jlc.authenticate)
	}
})

server.listen(PORT)

var sock = shoe(function (stream) {
	var d = dnode(jlsa)
	d.pipe(stream).pipe(d)
})
sock.install(server, DNODE_ENDPOINT)

module.exports = server
