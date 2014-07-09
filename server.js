var url = require('url')
var http = require('http')
var sendFiles = require('./sendFiles.js')
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
	var search = url.parse(req.url).search
	console.log("pathname:", pathname)
	switch(pathname) { //my beautiful router...
		case DNODE_ENDPOINT:
			console.log("hit dnode...")
		break
		case TOKEN_ENDPOINT:
			console.log("Token: '"+search.slice(-32)+", from: '"+search+"'")
			//search = "?secretCode=aaaaabbbbbcccccdddddeeeeefffff32"
			if (TOKEN_SEARCH_RE.test(search)) {
				console.log("\tLooks like a token.")
				jlc.authenticate(search.slice(-32), function (err, addr) {
					if (err && err.invalidToken) //if token not in db
						console.log("\tToken not in db.")
					else if (err) //if some error
						console.log("\tWeird error:", addr.message)
					else //if no err (successful login)
						console.log("\tJust logged in as:"+addr)
				})
			} else {
				console.log("\tUm, that doesn't look like a token.")
			}
		default: //SEND FILES
			sendFiles(req, res, SEND_DIR)
		break
	}
})

server.listen(PORT)

var sock = shoe(function (stream) {
	var d = dnode(jlsa)
	d.pipe(stream).pipe(d)
})
sock.install(server, DNODE_ENDPOINT)

module.exports = server
