# Coolol

Coolol is a fully customizable twitter client based on JavaScript ES6 without any backend. It communicates with Twitter server directly. So you don't have to sign up or give your token to me. Everything stays and only stays in your browser.

Open [Coolol.Me](http://coolol.me) and you are ready to go.

*Notice*: I only test in latest Google Chrome. May or may not support other browser in the future. But contribution is welcomed.


## Features

* Multi-column board view.
* Multi accounts.
* Multi-source for one channel.
* Customizable JavaScript based filter rules at both board/channel levels.
* Web-based allows accessing from everywhere, and no backend.
* Open-source and free to hack.

## Config

It allows you to write a config like:

```json
{
  "filters": [
    "isBetweenUser('ranmocy', 'CathellieAir')"
  ],
  "channels": [
    {
      "name": "Home",
      "sources": {
        "statuses_homeTimeline": {}
      },
      "filters": [
        "tweetContainsAny('SomeDirtyWord', 'SomeUninterestingKeyword', 'OrSomeBoringEventName')"
      ]
    },
    {
      "name": "Mentions",
      "sources": {
        "statuses_mentionsTimeline": {}
      }
    },
    {
      "name": "Direct Messages",
      "sources": {
        "directMessages": {},
        "directMessages_sent": {}
      }
    },
    {
      "name": "Mix sources",
      "sources": {
        "statuses_homeTimeline": {},
        "statuses_userTimeline": {
          "user_id": "ranmocy"
        }
      },
      "filters": [
        "sender.screen_name == 'CathellieAir' && receiver.screen_name == 'ranmocy'"
      ]
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

### Sources

Name of sources come from [Codebird convention][codebirdMapping] based on [Twitter API][twitterApi]

### Filters

Rule of filters are pure JavaScript expression returns a boolean.
If the expression returns true, the corresponding tweet will be removed from the channel.

Pre-defined variables:

1. **`tweet`**: The tweet object to determine, fetched from Twitter server.
2. **`sender`**: The user object of the tweet sender/creator. Typical fields to be used: `sender.id_str`, `sender.screen_name`.
3. **`receiver`**: The user object of the tweet receiver. Used in replying tweet, or direct message. Would be empty object `{}` in other cases.

Pre-defined functions:

1. **`isBetweenUser(user1, user2)`**: returns true if the tweet is a conversation between `user1` and `user2`.
2. **`tweetContains(keyword)`**: returns true if the tweet body contains the given keyword.
3. **`tweetContainsAny(keyword1, keyword2, ...)`**: returns true if the tweet body contains any given keyword.


# Local Usage

* `git clone https://github.com/ranmocy/Coolol.git`
* `cd Coolol`
* `python -m SimpleHTTPServer 8080`
* Open browser with url: `http://localhost:8080`


# TODO list

* Support Direct-Message composition
* Re-auth when token invalid
* Auto refresh
* Prepends tweet when publish new tweet.

   [codebirdMapping]: https://github.com/jublonet/codebird-js#mapping-api-methods-to-codebird-function-calls (Codebird API Mapping)
   [twitterApi]: https://dev.twitter.com/rest/public (Twitter REST API)
