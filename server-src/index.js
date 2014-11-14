//Server
var http = require('http')
var dnode = require('dnode')
var shoe = require('shoe')
var IncrementCountApi = require('./incrementCountApi.js')
var sendEmailOnAuth = require('./sendEmailOnAuth.js')
var Routing = require('./routing.js')
//Just Login
var JustLoginCore = require('just-login-core')
var justLoginDebouncer = require('just-login-debouncer')
var JustLoginExampleSessionManager = require('just-login-example-session-manager')
//Other
var spaces = require('level-spaces')
var xtend = require('xtend')
//Config
var config = require('confuse')().justLogin
var DEFAULT_URL_OBJECT = config.url
var TOKEN_ENDPOINT =  config.endpoints.token
var DNODE_ENDPOINT =  config.endpoints.dnode
var CUSTOM_ENDPOINT = config.endpoints.custom

module.exports = function createServer(db, urlObject) {
	if (!db) {
		throw new Error('Must provide a levelup database')
	}

	var core = JustLoginCore(db)
	
	var debouncingDb = spaces(db, 'debouncing')
	justLoginDebouncer(core, debouncingDb) //modifies 'core'

	var sessionDb = spaces(db, 'debouncing')
	var sessionManager = JustLoginExampleSessionManager(core, sessionDb)
	var incrementCountApi = IncrementCountApi(core, db)

	urlObject = urlObject || xtend(
		DEFAULT_URL_OBJECT,
		{ pathname: TOKEN_ENDPOINT }
	)

	sendEmailOnAuth(core, urlObject, function (err, info) {
		if (err) {
			console.log('Error sending the email:')
			console.error(err)
		}
	})

	var routing = Routing(core)

	var server = http.createServer(routing)

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
