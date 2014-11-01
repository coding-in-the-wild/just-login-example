#Authentication

So you're making a site where users need to be authenticated to use its cool service. And you want to use a javascript module to do the authentication stuff.

Do you really want to have passwords? [Skip passwords!](https://medium.com/@ninjudd/lets-boycott-passwords-680d97eddb01) Think about the advantages:

1. [Identities](http://blog.moertel.com/posts/2006-12-15-never-store-passwords-in-a-database.html) [won't](http://heartbleed.com/) [get](https://en.wikipedia.org/wiki/SQL_injection#Examples) [comprimised](http://readwrite.com/2009/12/16/rockyou_hacker_30_of_sites_store_plain_text_passwords) [so](http://www.net-security.org/secworld.php?id=8612) [easily.](http://en.blog.wordpress.com/2014/09/12/gmail-password-leak-update/)
2. [You don't need them](https://medium.com/@ninjudd/passwords-are-obsolete-9ed56d483eb).
3. Easier frontend. (None of those ridiculous `Registration` or `Forgot your Password` pages.)
4. You will probably get more users. (I always hate signing up for another site.)
5. Users are dumb; they'll use `123456` or reuse a password.
6. The tokens are basically impossible to guess, and expire shortly. (In this case, the token is an UUID and expires in just 5 minutes.)

#Overview of each just-login module

J.L. = Just Login

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

┼ ├ ┬ ┤ ┴ ┌ └ ┐ ┘ ─ │ ▼ ◄ ▲ ►




To use Just-Login, you only **need** the [Core][core]. But it makes a lot of sense to also use the [Server API][sapi].

The core is an event emitter that has some functions as properties. The functions are for logging you in or out, and checking if you're logged in. (For more specific information, check [this][core] out.)

The server api takes a core. It returns two functions, one to continue and existing session, and one to create a new one. After a session is established, it gives back function for logging you in or out, and checking if you're logged in. The difference from the core, is that a session is bound to each function given back. (For more specific information, check [this][sapi] out.)

#Sending the Token
If you plan to email the user, you might as well use the [Emailer][emlr].

If you want to use something else, you'll have to write a bit of code. See the example below:

```js
//core is your just-login-core object
core.on('authentication initiated', function (loginReq) {

	//replace 'sendSMS' with whatever function you have for sending a message to the user.
	sendSMS(loginReq.contactAddress, 'Here is your login code:\n' + loginReq.token)
})
```


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[sapi]: https://github.com/coding-in-the-wild/just-login-server-api
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[level]: https://github.com/rvagg/node-levelup
