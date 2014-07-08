var createSession = require('just-login-client')
var Jlsa = require('just-login-server-api')
var Jlc = require('just-login-core')
var Level = require('level-mem')
var db = Level('uniqueNameHere')
var jlc = Jlc(db)
var jlsa = Jlsa(jlc)
var sendEmailOnAuth = require('./emailWrapper.js')


//client(function (remote) { //connect here!
	//console.log("successful connection")

createSession(jlsa, function (err, api, sessionId) {
	console.log("create new session initiated")
	if (err) {
		console.log("err:", err)
	} else {
		console.log("api:", api)
		var emitter = api.beginAuthentication("fake@example.com")
		sendEmailOnAuth(emitter)
		emitter.on('authentication initiated', function (authInit) {
			console.log(authInit.token)     //logs the secret token
			console.log(authInit.sessionId) //logs the session id
		})
	}
})

//})
