# Why

So you're making a site where users need to be authenticated to use its cool service. And you want to use a javascript module to do the authentication stuff.

Do you really want to have passwords? [Skip passwords!](https://medium.com/@ninjudd/lets-boycott-passwords-680d97eddb01) Think about the advantages:

1. [Identities](http://blog.moertel.com/posts/2006-12-15-never-store-passwords-in-a-database.html) [won't](http://heartbleed.com/) [get](https://en.wikipedia.org/wiki/SQL_injection#Examples) [comprimised](http://readwrite.com/2009/12/16/rockyou_hacker_30_of_sites_store_plain_text_passwords) [so](http://www.net-security.org/secworld.php?id=8612) [easily.](http://en.blog.wordpress.com/2014/09/12/gmail-password-leak-update/)
2. [You don't need them](https://medium.com/@ninjudd/passwords-are-obsolete-9ed56d483eb).
3. Easier frontend. (None of those ridiculous `Registration` or `Forgot your Password` pages.)
4. You will probably get more users. (I always hate signing up for another site.)
5. Users are dumb; they'll use `123456` or reuse a password.
6. The tokens are basically impossible to guess, and expire shortly. (In this case, the token is an UUID and expires in just 5 minutes.)


# How

- A guy named Todd goes to a site using just-login. He types his email address into the email field and clicks `Login`.
- When the `Login` button is pressed, the core generates a unique token, and saves Todd's session id and email address under it. The core then emits an event, `'authentication initiated'`. The core will delete the token after a set time.
- When the emailer is sees an `'authentication initiated'` event, it emails Todd, and says something like this:

```
Hey, to login, click this:
http://example.com/login?token=1234567890qwertyuiopasdfghjkl
If you didn't mean to log in, ignore this email.
```

- Todd receives the email and clicks on the link, which sends his token to the site.
- Look up the token in the user database.
- If the token is NOT there, say: "FAILURE! Maybe you waited too long, or clicked an old link."
- If the token IS there, authenticate the session id associated with the token. (It will, of course, be Todd's record.) Delete the token.
- Todd has effectively authenticated himself via his email address.
- No passwords, better security, easier to implement; what's not to like!?

# Core

Include the stuff you need, and setup the database and core. The core takes a [levelup][levelup] database, this example uses [level][level].

To install, you will need [npm][npm] which is shipped with [node.js][node]. Then run these commands on your command line:

`npm install just-login-core`

Feel free to use a different [level][level] database.
`npm install level`

```js
var level = require('level')
var coreDb = level('./databases/core')
var JustLoginCore = require('just-login-core')
var core = JustLoginCore(coreDb)
```

# Emailer

You have to send the token to the user somehow. If you plan to use email, check out the code below. Otherwise, keep scrollin'.

To install: `npm install just-login-emailer`

```js
var JustLoginEmailer = require('just-login-emailer')

function htmlEmail(token) {
	return 'Click ' + ('here'.link('http://example.com/login?token=' + token)) + ' to login like a boss.'
}

var transportOptions = { //if using gmail's sending server
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: "justloginexample@gmail.com",
		pass: "whatever the password is"
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

# Testing without Email
If you don't want to use email for testing purposes, (or you want to use texting,) you'll have to write a bit of code. See the example below:

```js
core.on('authentication initiated', function (loginRequest) {
	console.log(loginRequest.contactAddress + ' has ' + loginRequest.token + ' as their token.')
})
```

# Core Usage

The core is an event emitter with functions as properties. The events should not be exposed to the client, as the token is on one of the events.

## core.isAuthenticated(sessionId, cb)

Checks if a user is authenticated. (Authenticated = Logged in.)

This function should be exposed to the client.

- `session id` is the string used to identify the browser session. This should come from your session manager. There are some on npm, including [express-session](http://npmjs.org/package/express-session), and [session](http://npmjs.org/package/session). You can also check out the simple [manager][snmg] used for this site.
- `cb` is a function with the following arguments:
	- `err` is null if there was no error, and is an Error object if there was an error.
	- `contactAddress` is null is the user is not authenticated, and is a string of their contact address if they are authenticated.

## core.beginAuthentication(sessionId, contactAddress, cb)

Starts the authentication process by emitting the 'authentication initiated' event with a token and the contact address. Something needs to catch the event, send an email with the token to the address. Feel free to try the [Just Login Emailer][emlr].

This function should be exposed to the client.

- `sessionId` is a string of the session id that is trying to get authenticated.
- `contactAddress` is string of the user's contact info, (usually an email address).
- `cb` is a function with the following arguments:
	- `err` is null if there is no error, and is an Error object is there was an error.
	- `loginRequest` is an object with the authentication request information. The object is identical to the object emitted in the event, with the following properties:
		- `token` is a string of the token.
		- `contactAddress` is a string with the contact address.

## core.authenticate(token, cb)

Sets the appropriate session id to be authenticated with the contact address associated with that token.

This function must not be exposed to the client.

- `token` is a string of the token that is trying to get authenticated.
- `cb` is a function with the following arguments: (Same as [`core.isAuthenticated()`](#coreisauthenticatedsessionid-cb).)
	- `err` is null if there was no error, and is an Error object if there was an error.
	- `contactAddress` is null is the user is not authenticated, and is a string of their contact address if they are authenticated.

After a user clicks the link in the email, they will be directed to an endpoint that might look something like this: `example.com/login`. Set up your routing so that this code runs when a user hits that endpoint.

```js
var url = require('url')

var token = url.parse(req.url, true).query.token
core.authenticate(token, function (err, addr) {
	if (err || !addr) { //Bad token, and other errors
		//serve the login failure page
	} else {
		//serve the login success page
	}
})
```

## core.unauthenticate(sessionId, cb)

Self explanatory, I think.

- `token` is a string of the token that is trying to get authenticated.
- `cb` is an optional function with the following argument:
	- `err` is null if there was no error, and is an Error object if there was an error.

# Debouncer

If you want the `core.beginAuthentication()` calls to be debounced, (not allowed multiple times within a certain period,) then you can use the [debouncer][dbnc]. This is to keep jerks from anonymously sending a bunch of login emails to others.

To install: `npm install just-login-debouncer`

```js
var debounceDb = level('./databases/debouncer')
var JustLoginDebouncer = require('just-login-debouncer')
justLoginDebouncer(core, debounceDb) //Modifies the core
```


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[snmg]: https://github.com/coding-in-the-wild/just-login-example-session-manager
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[levelup]: https://github.com/rvagg/node-levelup
[level]: https://github.com/rvagg/node-levelup
[node]: http://nodejs.org/download
[npm]: http://npmjs.org
