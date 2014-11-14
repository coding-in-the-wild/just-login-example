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

#Testing without Email
If you don't want to use email for testing purposes, (or you want to use texting,) you'll have to write a bit of code. See the example below:

```js
core.on('authentication initiated', function (loginRequest) {
	console.log(loginRequest.contactAddress + ' has ' + loginRequest.token + ' as their token.')
})
```

#Core Usage

After a user clicks the link in the email, they will be directed to a url that might look something like this: `example.com/login`. Set up an endpoint so that this code runs when a user hits it.

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

- `session id` The string used to identify the browser session. This would come from your session manager. There are some on npm, including express-session, and session. You can also check out the [simple implementation][snmg] used for this site.

#Debouncer

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
