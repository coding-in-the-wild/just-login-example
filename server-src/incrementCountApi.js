var dnode = require('dnode')
var shoe = require('shoe')
var spaces = require('level-spaces')

function cbIfErr(onErr, noErr) {
	return function (err) {
		if (err && !err.notFound) onErr(err)
		else noErr.apply(null, [].slice.call(arguments)) //the error is applied
	}
}

function incrementCount(db, key, cb) {
	db.get(key, function(err, value) {
		if (err && !err.notFound) {
			cb(err)
		} else {
			var count = Number(value)
			if (isNaN(count)) count = 0
			count++

			db.put(key, count, function(err) {
				cb(err, !err && count)
			})
		}
	})
}

function incrementCounterIfAuthed(sessionState, db) {
	var globalCountDb = spaces(db, 'global-click-counting')
	var sessionCountDb = spaces(db, 'session-click-counting')

	return function icia(sessionId, cb) {
		sessionState.isAuthenticated(sessionId, cbIfErr(cb, function (err, name) {
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
}

module.exports = function (sessionState, db) {
	return shoe(function (stream) {
		var d = dnode({
			incrementCounterIfAuthed: incrementCounterIfAuthed(sessionState, db)
		})
		d.pipe(stream).pipe(d)
	})
}
