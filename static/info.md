#Authentication

So you're making a site where users need to be authenticated to use its cool service. And you want to use a javascript module to do the authentication stuff.

Do you really want to have passwords? [Skip passwords!](https://medium.com/@ninjudd/lets-boycott-passwords-680d97eddb01) Think about the advantages:

1. [Identities](http://blog.moertel.com/posts/2006-12-15-never-store-passwords-in-a-database.html) [won't](http://heartbleed.com/) [get](https://en.wikipedia.org/wiki/SQL_injection#Examples) [comprimised](http://readwrite.com/2009/12/16/rockyou_hacker_30_of_sites_store_plain_text_passwords) [so](http://www.net-security.org/secworld.php?id=8612) [easily.](http://en.blog.wordpress.com/2014/09/12/gmail-password-leak-update/)
2. [You don't need them](https://medium.com/@ninjudd/passwords-are-obsolete-9ed56d483eb).
3. Easier frontend. (None of those ridiculous `Registration` or `Forgot your Password` pages.)
4. You will probably get more users. (I always hate signing up for another site.)
5. Users are dumb; they'll use `123456` or reuse a password.
6. The tokens are basically impossible to guess, and expire shortly. (In this case, the token is an UUID and expires in just 5 minutes.)


#How Just-Login works without passwords

A guy named Todd goes to a site using just-login. He types his email address into the email field and clicks `Login`.

When the `Login` button is pressed, the core generates a unique token, and saves Todd's session id and email address under it. The core then emits an event, `'authentication initiated'`. The core will delete the token after a set time. 

When the emailer is sees an `'authentication initiated'` event, it emails Todd, and says something like this:

```
Hey, to login, click this:
http://example.com/login?token=1234567890qwertyuiopasdfghjkl
If you didn't mean to log in, ignore this email.
```

Todd receives the email and clicks on the link, which sends his token to the site.

Look up the token in the user database.

If the token is NOT there, say: "FAILURE! Maybe you waited too long, or clicked an old link."

If the token IS there, authenticate the session id associated with the token. (It will, of course, be Todd's record.) Delete the token.

Todd has effectively authenticated himself via his email address.

PROFIT!!!

#Overview of each just-login module

J.L. = Just Login

###Diagram
```
┌─────────────────┐             ┌───────┐             ┌─────────────────┐
│ Example  Server ├─────────────┤ Dnode ├─────────────┤ Example  Client │
└────────┬────────┘             └───────┘             └────────┬────────┘
┌────────┴────────┐                                     ┌──────┴──────┐
│ J.L. Server API │                                     │ J.L. Client │
└────────┬────────┘                                     └─────────────┘
 ┌───────┴──────────────────────────┐
 │         [Debounced Core]         │
 │ ┌───────────┐ ┌────────────────┐ │ ┌──────────────┐
 │ │ J.L. Core ├─┤ J.L. Debouncer │ ├─┤ J.L. Emailer │
 │ └───────────┘ └────────────────┘ │ └──────────────┘
 └───────┬──────────────────────────┘
    ┌────┴────┐
    │ LevelUP │
    └─────────┘
```


###Server Sample Code

```js
//Just Login
var JlCore =      require('just-login-core')
var JlDebouncer = require('just-login-debouncer')
var JlServerApi = require('just-login-server-api')
var JlEmailer =   require('just-login-emailer')

//Other
var url = require('url')
var http = require('http')
var dnode = require('dnode')
var shoe = require('shoe')
var Static = require('node-static')
var level = require('level')

//Create a few databases
var coreDb = level('./databases/core')
var debounceDb = level('./databases/debouncer')

//Set up just-login
var core = JlCore(coreDb)
justLoginDebouncer(core) //Modifies 'core'
var serverApi = JlServerApi(jlc)

//Set up just-login-emailer
function htmlEmail(token) {
	return 'Copy and paste this into your browser\'s address bar: http://example.com/login?token=' + token
}
var transportOptions = { //if using gmail sending server
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
	subject: 'login now'
}

JlEmailer(core, htmlEmail, transportOptions, mailOptions, function (err) {
	if (err) console.error(err)
})

//Set up your server
var DNODE_ENDPOINT =  "/dnode"
var TOKEN_ENDPOINT =  "/login"
var STATIC_DIR = "./static/"

var fileServer = new Static.Server(STATIC_DIR, {gzip: true})

var server = http.createServer(function requestListener(req, res) {
	var parsedUrl = url.parse(req.url, true) //queryString enabled
	var pathname = parsedUrl.pathname
	var token = parsedUrl.query.token

	function serve(path, statusCode) {
		if (path.lastIndexOf('/') === path.length-1) path += "index.html"
		fileServer.serveFile(path, statusCode || 200, {}, req, res).on('error', function (err) {
			res.writeHead(err.status, err.headers)
			res.end(err.message)
		})
	}

	if (pathname === TOKEN_ENDPOINT) {
		core.authenticate(token, function (err, addr) {
			if (err)        serve('loginFailure.html', 500)
			else if (!addr) serve('loginFailure.html', 400)
			else            serve('loginSuccess.html')
		})
	} else if (pathname.slice(0, DNODE_ENDPOINT.length) != DNODE_ENDPOINT) { //not dnode
		serve(pathname)
	}
})

//Expose API to user via Dnode
shoe(function (stream) {
	var d = dnode(serverApi)
	d.pipe(stream).pipe(d)
}).install(server, DNODE_ENDPOINT)
```

###What you need for your Website

To use Just-Login, you only **need** the [Core][core]. But it makes a lot of sense to also use the [Server API][sapi].

The [`Core`][core] is an event emitter that has some functions as properties. The functions are for logging you in or out, and checking if you're logged in.

The [`Server API`][sapi] takes a core. It returns two functions, one to continue and existing session, and one to create a new one. After a session is established, it gives back function for logging you in or out, and checking if you're logged in. The difference from the core, is that a session is bound to each function given back.

The [`Debouncer`][dbnc] disallows `core.beginAuthentication()` to be called in too quick of succession.

#Sending the Token
If you plan to email the user, you might as well use the [Emailer][emlr].

If you want to use something else, you'll have to write a bit of code. See the example below:

```js
core.on('authentication initiated', function (loginRequest) {

	//replace 'sendMessage' with whatever function you have for sending a message to the user.
	sendMessage(loginRequest.contactAddress, 'Here is your login code:\n' + loginRequest.token)
})
```


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[sapi]: https://github.com/coding-in-the-wild/just-login-server-api
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[level]: https://github.com/rvagg/node-levelup
