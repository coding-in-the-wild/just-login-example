just-login-example
==================

Example of a site using the just-login modules.

#Try It

1. Go to the [Just Login Website](http://justlogin.xyz)
2. Type your email address into the text box; click `Login`.
3. Go to your email, open the email from `justloginexample`, and click the link.
4. Click `Click Meh` as many times as you want.
5. Logout, then click `Click Meh` a bit more.

#Use It

1. Clone this repository.
2. Install [node](http://nodejs.org/download). (Includes [npm](http://nodejs.org/download).)
3. Open a command prompt. (You might need to open it with administrative privileges; I'm not sure.)
4. Run `npm install`.
5. Edit the `config.json` file; add `hostname` & `pass`, and edit `user`:
```json
{
  "justLogin": {
    "url": {
      "hostname":"localhost"
    },
    "email": {
      "auth": {
        "user": "YOUR EMAIL HERE",
        "pass": "YOUR PASSWORD HERE"
      }
    }
  }
}
```
6. Run `node .`.
7. Open your browser to [Localhost](http://localhost).
8. Type your email address into the text box; click `Login`.
9. Go to your email, open the email from `justloginexample`, and click the link.
10. Go back to your localhost tab in your browser. Click `Click Meh`. (You should be logged in.)
11. Close the tab. Open [Localhost](http://localhost) again.
12. Click `Click Meh`. (You should still be logged in. Feel free to keep clicking, to make your number higher) 
13. Click `Logout`. Click `Click Meh`. (You shouldn't be logged in.)
14. Use the just-login modules for your website. :)

#Just-Login Modules

- [just-login-core](https://github.com/coding-in-the-wild/just-login-core)
- [just-login-client](https://github.com/coding-in-the-wild/just-login-client)
- [just-login-debouncer](https://github.com/coding-in-the-wild/just-login-debouncer)
- [just-login-emailer](https://github.com/coding-in-the-wild/just-login-emailer)
- [just-login-example-session-manager](https://github.com/coding-in-the-wild/just-login-example-session-manager)

#License

[VOL](http://veryopenlicense.com/)
