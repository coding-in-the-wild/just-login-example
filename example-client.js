var client = require('just-login-client');
var SendEmailOnAuth = require('./emailWrapper.js')


client(function (remote) {
	console.log("successful connection");

	remote.createNewSession(function (err, api) {
		console.log("create new session initiated");
		if (err) {
			console.log("err:", err);
		} else {
			console.log("api:", api);
			var emitter = api.beginAuthentication("fake@example.com");
			sendEmailOnAuth(emitter);
			emitter.on('authentication initiated', function (authInit) {
				console.log(authInit.token);     //logs the secret token
				console.log(authInit.sessionId); //logs the session id
			})
		}
	});
});
