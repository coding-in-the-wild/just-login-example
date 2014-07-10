var domready = require('domready');
var Shoe = require('shoe');
var Dnode = require('dnode');
var createSession = require('just-login-client')

domready(function () {

var LOUD = true
if (LOUD) console.log("initiated")


var stream = Shoe('/dnode');
var d = Dnode()
d.on('remote', function (remote) {
	if (LOUD) console.log("successful connection, remote:")
	if (LOUD) console.dir(remote)
	createSession(remote, function (err, api, sessionId) {
		if (LOUD) console.log("create new session initiated")
		if (err) {
			console.log("uh oh err:", err.message)
			console.dir(err)
			console.dir(api)
			console.dir(sessionId)
		} else {
			globalApi = api //yes, global
			if (LOUD) console.log("api:", api)
			var emitter = api.beginAuthentication("fake@example.com")
			emitter.on('authentication initiated', function (authInit) {
				if (LOUD) console.log(authInit.token)     //logs the secret token (um bad idea?)
				if (LOUD) console.log(authInit.sessionId) //logs the session id
			})
		}
	})

})
d.pipe(stream).pipe(d);


}); //DOMREADY
