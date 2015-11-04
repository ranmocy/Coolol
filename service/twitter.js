(function () {
  "use strict";

  var consumerKey = "SCEdx4ZEOO68QDCTC7FFUQ";
  var consumerSecret = "2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw";
  var REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 mins

  class Twitter {
    constructor(token, token_secret) {
      this.client = new Codebird();
      this.client.setConsumerKey(consumerKey, consumerSecret);
      this.setToken(token, token_secret);
      this.promises = {};
    }

    start() {
      // Refresh channels every 60s
      var task_factory = () => {
        this.refresh();
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
      this.client.setToken(token, secret);
    }

    auth(callback) {
      this.client.__call("oauth_requestToken",
                {oauth_callback: "oob"},
                (reply) => {
                  // This is the request token, not final accessToken.
                  this.client.setToken(reply.oauth_token, reply.oauth_token_secret);

                  // gets the authorize screen URL
                  this.client.__call("oauth_authorize",
                            {},
                            (auth_url) => {
                              if (callback) {
                                callback(auth_url);
                              } else {
                                window.codebird_auth = window.open(auth_url);
                              }
                            });
                });
    }

    verify(pinCode, callback) {
      this.client.__call("oauth_accessToken",
                {oauth_verifier: pinCode},
                (reply) => {
                  console.log('twitter.verify', reply);
                  // store the authenticated token, which may be different from the request token (!)
                  this.setToken(reply.oauth_token, reply.oauth_token_secret);
                  if (callback) {
                    callback(reply);
                  }
                });
    }

    fetch(source, params) {
      var key = source;
      if (params) {
        key = key + JSON.stringify(params);
      } else {
        params = {};
      }
      this.promises[key] = new Promise((resolve, reject) => {
        this.client.__call(source, params, (reply, rate, err) => {
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
          if (reply.errors) {
            console.error('error in fetch reply:', reply.errors);
            reject(reply.errors);
            return;
          }
          if (reply) {
            resolve(reply);
          }
        });
      });
      return this.promises[key];
    }

    get(source, params) {
      var key = source;
      if (params) {
        key = key + JSON.stringify(params);
      }
      return this.promises[key];
    }

    post(source, params) {
      return new Promise((resolve, reject) => {
        this.client.__call( source, params, (reply, rate, err) => {
          if (err) {
            console.error('error in post', err);
            reject(err.error);
            return;
          }
          if (reply.httpstatus === 400) {
            console.error('twitter post rate exceeded!', rate);
          } else {
            console.log('rate limit:', rate);
          }
          if (reply.errors) {
            console.error('error in post reply:', reply.errors);
            reject(reply.errors);
            return;
          }
          if (reply) {
            resolve(reply);
          }
        });
      });
    }
  }

  /* globals module, define */
  if (typeof module === "object" && module && typeof module.exports === "object") {
      module.exports = Twitter;
  } else {
      // Otherwise expose to the global object as usual
      if (typeof window === "object" && window) {
        window.Twitter = Twitter;
      }
      if (typeof define === "function") {
        define("twitter", [], function () { return Twitter; });
      }
  }
})();
