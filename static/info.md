#Authentication

So you're making a site where users need to be authenticated to use its cool service. And you want to use a javascript module to do the authentication stuff.

Do you really want to have passwords? [Skip passwords!](https://medium.com/@ninjudd/lets-boycott-passwords-680d97eddb01) Think about the advantages:

1. [Identities](http://blog.moertel.com/posts/2006-12-15-never-store-passwords-in-a-database.html) [won't](http://heartbleed.com/) [get](https://en.wikipedia.org/wiki/SQL_injection#Examples) [comprimised](http://readwrite.com/2009/12/16/rockyou_hacker_30_of_sites_store_plain_text_passwords) [so](http://www.net-security.org/secworld.php?id=8612) [easily.](http://en.blog.wordpress.com/2014/09/12/gmail-password-leak-update/)
2. [You don't need them](https://medium.com/@ninjudd/passwords-are-obsolete-9ed56d483eb).
3. Easier frontend. (None of those ridiculous `Registration` or `Forgot your Password` pages.)
4. You will probably get more users. (I always hate signing up for another site.)
5. Users are dumb; they'll use `123456` or reuse a password.
6. The tokens are basically impossible to guess, and expire shortly. (In this case, the token is an UUID and expires in just 5 minutes.)

#Diagram

`J.L.` = `Just Login`

[Example Server] ←→ [[Dnode][dnode]] ←→ [[J.L. Client][clnt]]
       ↓
[[J.L. Server API][sapi]]
       ↓
[[J.L. Core][core]] ←─┬── [[J.L. Debouncer][dbnc]]
       ↓              └── [[J.L. Emailer][emlr]]
[[LevelUP DB][level]]  



To use Just-Login, you only **need** the [Core][core]. But it makes a lot of sense to also use the [Server API][sapi]

Maybe you want to text users thier token. (I suggest using a different token generator. ☺) Don't use the just-login-emailer.


[core]: https://github.com/coding-in-the-wild/just-login-core
[dbnc]: https://github.com/coding-in-the-wild/just-login-debouncer
[sapi]: https://github.com/coding-in-the-wild/just-login-server-api
[clnt]: https://github.com/coding-in-the-wild/just-login-client
[emlr]: https://github.com/coding-in-the-wild/just-login-emailer
[dnode]: https://github.com/substack/dnode
[level]: https://github.com/rvagg/node-levelup
