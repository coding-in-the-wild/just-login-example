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
var spaces = require('level-spaces')

var config = require('../config.json')
var BASE_URL = config.domain + ':' + config.port + config.endpoints.token
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

module.exports = function createServer(db) {
	if (!db) throw new Error('Must provide a levelup database')

	var core = JustLoginCore(spaces(db, 'core'))
	justLoginDebouncer(core, spaces(db, 'debouncing'))
	var sessionState = justLoginSessionState(core, db) // uses spaces internally
	var clientApi = {
		beginAuthentication: core.beginAuthentication, //.bind(null, sessionId),
		isAuthenticated: sessionState.isAuthenticated, //.bind(null, sessionId),
		unauthenticate: sessionState.unauthenticate //.bind(null, sessionId)
	}
	var incrementCountApi = IncrementCountApi(core, db) // uses spaces internally

	sendEmailOnAuth(core, BASE_URL)

	var server = http.createServer(Routing(core))

	shoe(function (stream) { //Basic authentication api
		var d = dnode(clientApi)
		d.pipe(stream).pipe(d)
	}).install(server, DNODE_ENDPOINT)

	shoe(function (stream) { //Custom api, in this case, the count incrementer
		var d = dnode(incrementCountApi)
		d.pipe(stream).pipe(d)
	}).install(server, CUSTOM_ENDPOINT)

	return server
}
