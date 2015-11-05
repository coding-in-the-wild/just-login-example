# Documentation

Just Login is an password-less authentication system for [node.js][node]. The modules can be installed using [npm][npm], which is shipped with node.js.

Just Login is a modular system. You'll definitely need the `just-login-core`. Want sessions? You'll need `just-login-session-state`. Want emailing? You'll need the `just-login-emailer`.

## `just-login-core`

Handles tokens for Just Login. The core needs a [levelup][levelup] database, this example uses [level][level]. See [full documentation][core].

To install: `npm install just-login-core level`

```js
var coreDb = require('level')('./databases/core')
var core = require('just-login-core')(coreDb)
```

`core` is an event emitter with functions as properties.

### `core.beginAuthentication(sessionId, contactAddress, cb)`

Starts the authentication process by emitting the 'authentication initiated' event with a token and the contact address. Something needs to catch the event, send an email with the token to the address. Feel free to try the [Just Login Emailer][emlr].

- `sessionId` is a string of the session id that is trying to get authenticated.
- `contactAddress` is string of the user's contact info, (usually an email address).
- `cb(err, authReqInfo)`
	- `err` is null or an Error object.
	- `authReqInfo` is an object with the authentication request information. The object is identical to the object emitted in the `'authentication initiated'` event, with the following properties:
		- `token` is a string of the token.
		- `contactAddress` is a string with the contact address.

Emits `core.on('authentication initiated', function (authReqInfo) { ... })`

### `core.authenticate(token, cb)`

Authenticates the session id associated with a given token.

- `token` is a string of the token that is trying to get authenticated.
- `cb(err, credentials)`
	- `err` is null or an Error object.
	- `credentials` is null is the user is not authenticated, and is an object if they are authenticated:
		- `contactAddress` is a string of their contact address.
		- `sessionId` is a string of their session id.

Emits `core.on('authenticated', function (credentials) { ... })`

```js
var url = require('url')

var token = url.parse(req.url, true).query.token
core.authenticate(token, function (err, addr) {
	if (err || !addr) { // Bad token, and other errors
		// Serve the login failure page
	} else {
		// Serve the login success page
	}
})
```

## Not using Email

This is the point where you must send the token to the user somehow. Here is an example of using twitter's direct messaging instead of email!

```js
core.on('authentication initiated', function (authReqInfo) {
	var screenName = authReqInfo.contactAddress

	twitterClient.post('direct_messages/new.json', {
		screen_name: screenName,
		text: 'Hey ' + screenName + ',\nTo login to my awesome site, click here: http://example.com/login?token=' + authReqInfo.token
	}, function (err) {})
})
```

If you use the `just-login-emailer`, it will listen for this event so you don't have to!

## `just-login-emailer`

Sends emails to folks who want to log in! You have to send the token to the user somehow. If you plan to use email, check out the example below. See [full documentation][emlr].

To install: `npm install just-login-emailer`

```js
var JustLoginEmailer = require('just-login-emailer')

function htmlEmail(token) {
	return 'Click ' + ('here'.link('http://example.com/login?token=' + token)) + ' to login like a boss.'
}

var transportOptions = { // If using gmail's sending server
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'justloginexample@gmail.com',
		pass: 'whatever the password is'
	}
}

var mailOptions = {
	from: 'whomever@example.com',
	subject: 'Login Like A Boss'
}

JustLoginEmailer(core, htmlEmail, transportOptions, mailOptions, function (err) {
	if (err) console.error(err)
})
```

## `just-login-session-state`

Session state handler for Just Login. See [full documentation][snse].

To install: `npm install just-login-session-state`

```js
var sessionStateDb = require('level')('./databases/session-state')
var sessionState = require('just-login-session-state')(core, sessionStateDb, [options])
```

### `sessionState.createSession(cb)`

Creates a new (unauthenticated) session.

- `cb(err, sessionId)`
	- `err` is null or an Error object.
	- `sessionId` is a string of the new session id.

### `sessionState.sessionExists(sessionId, cb)`

Checks if a session exists or not.

- `sessionId` is a string of the session id in question.
- `cb(err, date)`
	- `err` is null or an Error object.
	- `date` is null if the session is unauthenticated. Otherwise it is a Date object of when the session was created.

### `sessionState.deleteSession(sessionId, cb)`

Delete a session.

- `sessionId` is a string of the session id in question.
- `cb(err)`
	- `err` is null or an Error object.

### `sessionState.isAuthenticated(sessionId, cb)`

Checks if a user is authenticated.

- `sessionId` is a string of the session id in question.
- `cb(err, contactAddress)`
	- `err` is null or an Error object.
	- `contactAddress` is null is the user is not authenticated. Otherwise it is a string of their contact address.

### `sessionState.unauthenticate(sessionId, [cb])`

- `sessionId` is a string of the session to unauthenticate.
- `cb(err)`
	- `err` is null or an Error object.

## `just-login-debouncer`

Keep jerks from sending lots of login emails. Basically this will rate-limit `core.beginAuthentication()`. See [full documentation][dbnc].

To install: `npm install just-login-debouncer`

```js
var debounceDb = level('./databases/debouncer')
require('just-login-debouncer')(core, debounceDb) // Modifies the core
```


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[snse]: https://github.com/coding-in-the-wild/just-login-session-state
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[levelup]: https://github.com/rvagg/node-levelup
[level]: https://github.com/rvagg/node-levelup
[node]: https://nodejs.org/en/download/
[npm]: http://npmjs.org
