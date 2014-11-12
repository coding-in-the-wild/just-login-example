#Why

So you're making a site where users need to be authenticated to use its cool service. And you want to use a javascript module to do the authentication stuff.

Do you really want to have passwords? [Skip passwords!](https://medium.com/@ninjudd/lets-boycott-passwords-680d97eddb01) Think about the advantages:

1. [Identities](http://blog.moertel.com/posts/2006-12-15-never-store-passwords-in-a-database.html) [won't](http://heartbleed.com/) [get](https://en.wikipedia.org/wiki/SQL_injection#Examples) [comprimised](http://readwrite.com/2009/12/16/rockyou_hacker_30_of_sites_store_plain_text_passwords) [so](http://www.net-security.org/secworld.php?id=8612) [easily.](http://en.blog.wordpress.com/2014/09/12/gmail-password-leak-update/)
2. [You don't need them](https://medium.com/@ninjudd/passwords-are-obsolete-9ed56d483eb).
3. Easier frontend. (None of those ridiculous `Registration` or `Forgot your Password` pages.)
4. You will probably get more users. (I always hate signing up for another site.)
5. Users are dumb; they'll use `123456` or reuse a password.
6. The tokens are basically impossible to guess, and expire shortly. (In this case, the token is an UUID and expires in just 5 minutes.)


#How

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

#Core

Include the stuff you need, and setup the database and core.

To install, you will need [npm][npm] which is shipped with [node.js][node]. Then run this command on your command line: `npm install just-login-core level`

```js
var level = require('level')
var coreDb = level('./databases/core')
var JustLoginCore = require('just-login-core')
var core = JustLoginCore(coreDb)
```

#Debouncer

If you want the `core.beginAuthentication()` calls to be debounced, (not allowed multiple times within a certain period,) then you can use the [debouncer][dbnc]. This is to keep jerks from anonymously sending a bunch of login emails to others.

To install: `npm install just-login-debouncer`

```js
var debounceDb = level('./databases/debouncer')
var JustLoginDebouncer = require('just-login-debouncer')
justLoginDebouncer(core, debounceDb) //Modifies the core
```

#Session Manager

You will need a session manager. You can check out the [Session Manager][snmg] used for this site.

To install: `npm install just-login-example-session-manager`

The Session Manager takes a core. It returns two methods, one to continue an existing session, and one to create a new one. After a session is established, it gives back methods for logging you in or out, and checking if you're logged in. The difference from the core, is that a session is bound to each method given back.

```js
var JustLoginExampleSessionManager = require('just-login-server-api')
var sessionManager = JustLoginExampleSessionManager(core)

//Send sessionManager over to the server...
```

The following code is for the client.

You'll need some thing on the client to get `sessionManager`'s methods. (This site uses [dnode][dnode].)

```js
//Get the session manager's methods from the server here...

function establishSession(cb) {
	var session = localStorage.getItem('session')
	sessionManager.continueSession(session, function (err, api, sessionId) {
		if (!err) {
			cb(err, api)
		} else {
			sessionManager.createSession(function (err, api, sessionId) {
				localStorage.setItem('session', sessionId)
				cb(err, api)
			})
		}
	})
}

establishSession(function (err, api) {
	//do stuff with api here.
})
```

#Emailer

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

#Not Email
If you don't want to use email, you'll have to write a bit of code. See the example below:

```js
core.on('authentication initiated', function (loginRequest) {
	//replace 'sendMessage' with whatever function you have for sending a message to the user.
	sendMessage(loginRequest.contactAddress, 'Here is your login code:\n' + loginRequest.token)
})
```

#Authenticating the User

After a user clicks the link in the email, they will be directed to a url that might look something like this: `example.com/login`. Set up your routing so that when the user hits that endpoint, this code runs.

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


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[snmg]: https://github.com/coding-in-the-wild/just-login-example-session-manager
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[level]: https://github.com/rvagg/node-levelup
[node]: http://nodejs.org/download
[npm]: http://npmjs.org
