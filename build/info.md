# Documentation

Just Login is an password-less authentication system for [node.js][node]. The modules can be installed using [npm][npm], which is shipped with node.js.

Just Login is a modular system. You'll definitely need the [`just-login-core`][jlc]. Want sessions? You'll need [`just-login-session-state`][jlss]. Want emailing? You'll need the [`just-login-emailer`][jle].

## [`just-login-core`][jlc]

Handles tokens for Just Login. The core needs a [levelup][levelup] database, this example uses [level][level].

To install: `npm install just-login-core level`

```js
var coreDb = require('level')('./databases/core')
var core = require('just-login-core')(coreDb)
```

`core` is an event emitter with these functions as properties:

### `core.beginAuthentication(sessionId, contactAddress, cb)`

Starts the authentication process by emitting the 'authentication initiated' event with a token and the contact address. Something needs to catch the event, send an email with the token to the address. Feel free to try the [Just Login Emailer][jle].

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

You must send the token to the user somehow. One way is to send them a link with the token in it, and authenticate tokens sent to that endpoint.

Here is an example of using the [`twitter` module](https://www.npmjs.com/package/twitter) to direct message a link to a user:

```js
var client = new Twitter({ ... })

core.on('authentication initiated', function (authReqInfo) {
	var screenName = authReqInfo.contactAddress

	client.post('direct_messages/new.json', {
		// You'll need users to login with twitter usernames instead of email addresses
		screen_name: screenName,
		text: 'Hey ' + screenName + ',\n' +
		'To login to my awesome site, click here: ' +
		'http://example.com/login?token=' + authReqInfo.token
	}, function (err) {})
})
```

Here is an example of using the [`twilio` module](https://www.npmjs.com/package/twilio) to text a link to a user:

```js
var client = require('twilio')('ACCOUNT_SID', 'AUTH_TOKEN');

core.on('authentication initiated', function (authReqInfo) {
	client.sendMessage({
		// You'll need users to login with phone numbers instead of email addresses
		to: authReqInfo.contactAddress,
		from: '+14506667788',
		body: authReqInfo.token
	}, function(err, responseObj) {})
})
```

If you use the `just-login-emailer`, it will listen for this event so you don't have to!

## [`just-login-emailer`][jle]

Sends emails to folks who want to log in! You have to send the token to the user somehow. If you plan to use email, check out the example below.

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

## [`just-login-session-state`][jlss]

Session state handler for Just Login.

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

## [`just-login-debouncer`][jld]

Keep jerks from sending lots of login emails. Basically this will rate-limit `core.beginAuthentication()`.

To install: `npm install just-login-debouncer`

```js
var debounceDb = level('./databases/debouncer')
require('just-login-debouncer')(core, debounceDb) // Modifies the core
```


[jlc]: https://github.com/coding-in-the-wild/just-login-core
[jld]: https://github.com/coding-in-the-wild/just-login-debouncer
[jlss]: https://github.com/coding-in-the-wild/just-login-session-state
[jle]: https://github.com/coding-in-the-wild/just-login-emailer
[levelup]: https://github.com/rvagg/node-levelup
[level]: https://github.com/rvagg/node-levelup
[node]: https://nodejs.org/en/download/
[npm]: http://npmjs.org
