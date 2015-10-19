System.import('vendor/codebird.js').then(function (Codebird) {
  "use strict";

  var consumerKey = "SCEdx4ZEOO68QDCTC7FFUQ";
  var consumerSecret = "2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw";
  var REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 mins

  var cb = new Codebird();
  cb.setConsumerKey(consumerKey, consumerSecret);

  class Twitter {
    constructor() {
      // Read saved token
      this.setToken(localStorage.getItem('oauth_token'), localStorage.getItem('oauth_token_secret'));
      this.promises = {};
    }

    start() {
      // Refresh channels every 60s
      var self = this;
      var task_factory = function() {
        self.refresh();
        setTimeout(task_factory, REFRESH_INTERVAL_MS);
      };
      console.debug('twitter.start');
      task_factory(); // call it immediately
    }

    refresh() {
      console.debug('twitter refreshing');
    }

    saveTokenToLocal(token, secret) {
      localStorage.setItem('oauth_token', token);
      localStorage.setItem('oauth_token_secret', secret);
    }

    setToken(token, secret) {
      console.debug('Set token: ', token, secret);
      cb.setToken(token, secret);
    }

    auth(callback) {
      cb.__call("oauth_requestToken",
                {oauth_callback: "oob"},
                function (reply) {
                  // This is the request token, not final accessToken.
                  cb.setToken(reply.oauth_token, reply.oauth_token_secret);

                  // gets the authorize screen URL
                  cb.__call("oauth_authorize",
                            {},
                            function (auth_url) {
                              if (callback) {
                                callback(auth_url);
                              } else {
                                window.codebird_auth = window.open(auth_url);
                              }
                            });
                });
    }

    verify(pinCode) {
      var service = this;
      cb.__call("oauth_accessToken",
                {oauth_verifier: pinCode},
                function (reply) {
                  // store the authenticated token, which may be different from the request token (!)
                  service.setToken(reply.oauth_token, reply.oauth_token_secret);
                  service.saveTokenToLocal(reply.oauth_token, reply.oauth_token_secret);
                });
    }

    fetch(source) {
      this.promises[source] = new Promise(function(resolve, reject) {
        cb.__call(source, {}, function (reply, rate, err) {
          if (err) {
            console.error('error in fetch', err);
            reject(err.error);
            return;
          }
          if (reply.httpstatus === 400) {
            console.error('twitter fetch rate exceeded!', rate);
          } else {
            console.log('rate limit:', rate);
          }
          if (reply) {
            resolve(reply);
          }
        });
      });
      return this.promises[source];
    }

    get(source) {
      return this.promises[source];
    }
  }

  var twitter = new Twitter();
  if (!document.services) {
    document.services = {};
  }
  document.services.twitter = twitter;

  /* globals module, define */
  if (typeof module === "object" && module && typeof module.exports === "object") {
      module.exports = twitter;
  } else {
      // Otherwise expose to the global object as usual
      if (typeof window === "object" && window) {
        window.twitter = twitter;
      }
      if (typeof define === "function") {
        define("twitter", [], function () { return twitter; });
      }
  }
});
