//Server
var http = require('http')
var dnode = require('dnode')
var shoe = require('shoe')
var IncrementCountApi = require('./incrementCountApi.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var Routing = require('./routing.js')
//Just Login
var JustLoginCore = require('just-login-core')
var justLoginSessionState = require('just-login-session-state')
var justLoginDebouncer = require('just-login-debouncer')
var JustLoginExampleSessionManager = require('just-login-example-session-manager')

var spaces = require('level-spaces')

var config = require('confuse')().justLogin
var BASE_URL = require('url').resolve(config.baseUrl, config.endpoints.token)
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

module.exports = function createServer(db, baseUrl) {
	if (!db) throw new Error('Must provide a levelup database')

	var core = JustLoginCore(spaces(db, 'core'))
	justLoginDebouncer(core, spaces(db, 'debouncing'))
	justLoginSessionState(core, db) // uses spaces internally
	var sessionManager = JustLoginExampleSessionManager(core, spaces(db, 'sess-exp'))
	var incrementCountApi = IncrementCountApi(core, db) // uses spaces internally

	sendEmailOnAuth(core, baseUrl || BASE_URL, function (err, info) {
		if (err) console.error('Error sending the email:', err)
	})

	var server = http.createServer(Routing(core))

	shoe(function (stream) { //Basic authentication api
		var d = dnode(sessionManager)
		d.pipe(stream).pipe(d)
	}).install(server, DNODE_ENDPOINT)

	shoe(function (stream) { //Custom api, in this case, the count incrementer
		var d = dnode(incrementCountApi)
		d.pipe(stream).pipe(d)
	}).install(server, CUSTOM_ENDPOINT)

	return server
}
