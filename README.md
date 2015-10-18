# Coolol

Coolol is a fully customizable twitter client based on JavaScript ES6.
It allows you to write a config like:

```json
{
  "boards": [
    {
      "name": "board1",
      "channels": [
        {
          "name": "b1-channel1",
          "sources": [
            "statuses_homeTimeline",
            "statuses_mentionsTimeline"
          ]
        },
        {
          "name": "b1-channel2",
          "sources": [
            "statuses_mentionsTimeline"
          ]
        }
      ]
    }
  ]
}
```

# Usage

* `git clone https://github.com/ranmocy/Coolol.git`
* `cd Coolol`
* `python -m SimpleHTTPServer`
* Open browser with url: `http://localhost:8080`

## Dev

* `git clone https://github.com/ranmocy/Coolol.git`
* `npm install -g jspm`
* `jspm init`
