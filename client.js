var sendEmailOnAuth = require('./emailWrapper.js')
var dnode = require('dnode')

var d = dnode()
d.on('remote', function (remote) {
	console.log("successful connection")

	remote.createSession(function (err, api, sessionId) {
		console.log("create new session initiated")
		if (err) {
			console.log("err:", err)
		} else {
			console.log("api:", api)
			var emitter = api.beginAuthentication("fake@example.com")
			sendEmailOnAuth(emitter)
			emitter.on('authentication initiated', function (authInit) {
				console.log(authInit.token)     //logs the secret token (um bad idea?)
				console.log(authInit.sessionId) //logs the session id
			})
		}
	})

})
