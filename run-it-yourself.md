# Run it yourself

Open an issue if you have trouble with these steps.

- Clone this repo
- Install [node/npm](http://nodejs.org/download)
- Run `npm install`.
- Add `email.auth` to the `config.json`:
	- Note, if you use gmail, you will have to enable [less secure apps](https://support.google.com/accounts/answer/6010255?hl=en)
```json
{
  "email": {
     "auth": {
      "user": "YOUR EMAIL HERE",
      "pass": "YOUR PASSWORD HERE"
    }
  }
}
```
- Run `node .`
- Open your browser to [http://localhost](http://localhost), and try it out
- Use the just-login modules for your website. :)
