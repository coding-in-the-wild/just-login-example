var client = require('./client.js')
var events = require("events")

window.emitter = new events.EventEmitter

client() //sets window.emitter to a different emitter

//unfortunately, this stuff seems not to be working...
window.emitter.on('new session', function (sid) {
	console.log("Successfully created a new session. Id:"+sid)
	})
window.emitter.on('continue session', function (sid) {
	console.log("Successful continued old session. Id:"+sid)
})
window.emitter.on('authenticated', function () {
	alert("You have been logged!")
})

//fancy ractive, DOM manipulation stuff here :)
