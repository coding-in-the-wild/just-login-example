//Server
var http = require('http')
var IncrementCountApi = require('./incrementCountApi.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var Routing = require('./routing.js')
//Just Login
var JustLoginCore = require('just-login-core')
var justLoginClient = require('just-login-client')
var JustLoginSessionState = require('just-login-session-state')
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
	sendEmailOnAuth(core, BASE_URL)

	var sessionState = JustLoginSessionState(core, db) // uses spaces internally
	var increment = IncrementCountApi(sessionState, db) // uses spaces internally
	var client = justLoginClient(core, sessionState)
	var server = http.createServer(Routing(core))

	client.install(server, DNODE_ENDPOINT)
	increment.install(server, CUSTOM_ENDPOINT)

	return server
}
