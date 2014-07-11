var Shoe = require('shoe')
var Dnode = require('dnode')
var createSession = require('just-login-client')

module.exports = function (config) {
	var defaultConfig = {
		loud: true
	}
	config = config || defaultConfig
	if (config.loud) console.log("initiated")

	var stream = Shoe('/dnode')
	var d = Dnode()
	d.on('remote', function (remote) {
		if (config.loud) console.log("successful connection, remote:")
		if (config.loud) console.dir(remote)
		window.emitter = createSession(remote, function (err, api, sessionId) {
			if (config.loud) console.log("create new session initiated")
			if (err) {
				console.log("uh oh err:", err.message)
				console.dir(err)
			} else {
				globalApi = api //yes, global
			}
		})

	})
	d.pipe(stream).pipe(d);
}
