# Coolol

Coolol is a fully customizable twitter client based on JavaScript ES6 without any backend. It communicates with Twitter server directly. So you don't have to sign up or give your token to me. Everything stays and only stays in your browser.

Open [Coolol.Me](http://coolol.me) and you are ready to go.

Notice: I only test in latest Google Chrome. May or may not support other browser in the future. But contribution is welcomed.

It allows you to write a config like:

```json
{
  "channels": [
    {
      "name": "Home",
      "sources": {
        "statuses_homeTimeline": {}
      }
    },
    {
      "name": "Mentions",
      "sources": {
        "statuses_mentionsTimeline": {}
      }
    },
    {
      "name": "Mix sources",
      "sources": {
        "statuses_homeTimeline": {},
        "statuses_mentionsTimeline": {}
      }
    },
    {
      "name": "My tweets",
      "sources": {
        "statuses_userTimeline": {
          "user_id": "me"
        }
      }
    }
  ]
}
```

# Local Usage

* `git clone https://github.com/ranmocy/Coolol.git`
* `cd Coolol`
* `python -m SimpleHTTPServer 8080`
* Open browser with url: `http://localhost:8080`
