var spaces = require('level-spaces')

function cbIfErr(onErr, noErr) {
	return function (err) {
		if (err && !err.notFound) onErr(err)
		else noErr.apply(null, [].slice.call(arguments)) //the error is applied
	}
}

function incrementCount(db, key, cb) {
	db.get(key, function(err, value) {
		var count
		if (err && err.notFound) {
			count = 0
		} else if (err) {
			return cb(err)
		} else {
			count = parseInt(value)
		}

		if (isNaN(count)) {
			count = 1
		} else {
			count = count + 1
		}
		db.put(key, count, function(err) {
			cb(err, count)
		})
	})
}


var incrementCounterIfAuthed = function(jlc, globalCountDb, sessionCountDb, sessionId, cb) {
	jlc.isAuthenticated(sessionId, cbIfErr(cb, function (err, name) {
		if ((err && err.notFound) || !name) { //not authenticated
			cb(new Error('Not Authenticated'))
		} else { //authenticated
			incrementCount(globalCountDb, name, cbIfErr(cb, function (err, globalCount) {
				incrementCount(sessionCountDb, sessionId, cbIfErr(cb, function (err, sessionCount) {
					cb(null, {
						globalCount: globalCount,
						sessionCount: sessionCount
					})
				}))
			}))
		}
	}))
}

module.exports = function (jlc, db) {
	var globalCountDb = spaces(db, 'global-click-counting')
	var sessionCountDb = spaces(db, 'session-click-counting')
	return { //incrementCounterIfAuthed() takes a sessionId and callback
		incrementCounterIfAuthed: incrementCounterIfAuthed.bind(null, jlc, globalCountDb, sessionCountDb)
	}
}
