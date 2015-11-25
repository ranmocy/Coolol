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

Name of sources come from [Codebird convention][codebirdMapping] based on [Twitter API][twitterApi]


# Local Usage

* `git clone https://github.com/ranmocy/Coolol.git`
* `cd Coolol`
* `python -m SimpleHTTPServer 8080`
* Open browser with url: `http://localhost:8080`


# TODO

* When retweet a tweet, all tweet component should refresh.
* Auto refresh
* Fetch more tweet when scroll down to the bottom
* Refresh button can spin
* Prepends tweet when publish new tweet.

   [codebirdMapping]: https://github.com/jublonet/codebird-js#mapping-api-methods-to-codebird-function-calls (Codebird API Mapping)
   [twitterApi]: https://dev.twitter.com/rest/public (Twitter REST API)
