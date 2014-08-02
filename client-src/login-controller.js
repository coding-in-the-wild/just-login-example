var EventEmitter = require('events').EventEmitter

module.exports = function() {
	var emitter = new EventEmitter()


	//emitter.on('blah', function(){})

	return emitter
}