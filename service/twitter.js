window.Twitter = (function() {
  "use strict";

  const CONSUMER_KEY = "vbUQPCkkyFYUiomrSk9Nnysh0";
  const CONSUMER_SECRET = "2EEZCi4nDKHK8rc4Y43iBQ3Nl9HSLbmaZeVigip1grhcmL8ajF";
  const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 mins
  const CACHE_LIFETIME_MS = 5 * 1000; // 5 seconds

  function hashKey(source, params) {
    if (!$.isDefined(params)) {
      params = {};
    }
    return `${source}:${JSON.stringify(params)}`;
  }

  // => func(resolve, reject)
  function fetchPromiseFuncFactory(client, source, params) {
    return function(resolve, reject) {
      console.log('[twitter]', source, params);
      return client.__call(source, params, (reply, rate, err) => {
        if (err) {
          console.error(`[twitter] error:`, err, source, params);
          Notify.error(`[twitter] error in API ${source} fetch: ${err}`);
          reject(err.error);
        }
        if (reply.httpstatus === 400) {
          console.error(`[twitter] rate exceeded!`, rate, source, params);
          Notify.error(`[twitter] API ${source} rate exceeded!`);
          reject(err.error);
        } else {
          console.log(`[twitter] rate limit:`, rate);
        }
        if (reply.errors) {
          reply.errors.forEach((error) => {
            console.error(`[twitter] error in reply:`, error.code, error.message, source, params);
            Notify.error(`[twitter] error in API ${source} reply: ${error.code}: ${error.message}`);
          });
          reject(reply.errors);
        }
        if (reply) {
          resolve(reply);
        }
        reject("No reply");
      });
    };
  }

  class TweetCache {
    constructor(func) {
      this.func = func;
      this.value = null;
      this.timestamp = new Date(0); // data at 1969
    }

    getValuePromise() {
      var now = new Date();
      return new Promise((resolve, reject) => {
        if (this.timestamp !== null && ((now - this.timestamp) < CACHE_LIFETIME_MS)) {
          // TweetCache is valid!
          resolve(this.value);
        } else {
          // Otherwise fetch it!
          this.func(resolve, reject);
        }
      });
    }
  }

  class Twitter {
    constructor(token, token_secret) {
      this.client = new Codebird();
      this.client.setConsumerKey(CONSUMER_KEY, CONSUMER_SECRET);
      this.setToken(token, token_secret);
      this.cache = {}; // String => TweetCache
    }

    setToken(token, secret) {
      console.debug('Set token: ', token, secret);
      this.client.setToken(token, secret);
    }

    auth(callback) {
      this.client.__call("oauth_requestToken", {
        oauth_callback: "oob"
      }, (reply) => {
        // This is the request token, not final accessToken.
        this.client.setToken(reply.oauth_token, reply.oauth_token_secret);

        // gets the authorize screen URL
        this.client.__call("oauth_authorize", {}, (auth_url) => {
          if (callback) {
            callback(auth_url);
          } else {
            window.codebird_auth = window.open(auth_url);
          }
        });
      });
    }

    verify(pinCode, callback) {
      this.client.__call("oauth_accessToken", {
        oauth_verifier: pinCode
      }, (reply) => {
        console.log('twitter.verify', reply);
        // store the authenticated token, which may be different from the request token (!)
        this.setToken(reply.oauth_token, reply.oauth_token_secret);
        if (callback) {
          callback(reply);
        }
      });
    }

    // try to get the cache or fetch it
    // => Promise
    fetch(source, params) {
      if (!$.isDefined(params)) {
        params = {};
      }
      var key = hashKey(source, params);
      if (!(key in this.cache)) {
        this.cache[key] = new TweetCache(fetchPromiseFuncFactory(this.client, source, params));
      }
      return this.cache[key].getValuePromise();
    }

    // => Promise
    post(source, params) {
      if (!$.isDefined(params)) {
        params = {};
      }
      return new Promise((resolve, reject) => {
        fetchPromiseFuncFactory(this.client, source, params)(resolve, reject);
      });
    }
  }

  return Twitter;
})();
