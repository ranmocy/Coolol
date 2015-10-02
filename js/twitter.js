import Codebird from 'vendor/codebird.js';

var consumerKey = "SCEdx4ZEOO68QDCTC7FFUQ";
var consumerSecret = "2IBoGkVrpwOo7UZhjkYYekw0ciXG1WHpsqQtUqZCSw";
var REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 mins

var cb = new Codebird();
cb.setConsumerKey(consumerKey, consumerSecret);

class Twitter {
  constructor() {
    // Read saved token
    this.setToken(localStorage.getItem('oauth_token'), localStorage.getItem('oauth_token_secret'));
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
  //
  //   store.findAll('channel').then(function(channels) {
  //     console.debug('channels:', channels);
  //     var channelMap = {}; // api_name => [channels]
  //     channels.forEach(function(channel) {
  //       console.debug('c:', channel);
  //       var rule = channel.get('rules');
  //       if (!(rule in channelMap)) {
  //         channelMap[rule] = [];
  //       }
  //       channelMap[rule].push(channel);
  //     });
  //     console.debug('map:', channelMap, Object.keys(channelMap));
  //
  //     for (var api_name in channelMap) {
  //       if (channelMap.hasOwnProperty(api_name)) {
  //         var channelsNeedThisApi = channelMap[api_name];
  //         cb.__call(api_name, {}, function(reply) {
  //           if (reply.httpstatus !== 200) {
  //             console.error('Failed!', api_name, reply.httpstatus);
  //             return;
  //           }
  //
  //           var tweets = [];
  //           $(reply).each(function(index, tweet) {
  //             store.createRecord('tweet', tweet).save();
  //             tweets.push(store.findRecord('tweet', tweet.id));
  //           });
  //           console.debug('tweets', tweets);
  //
  //           channelsNeedThisApi.forEach(function(channelNeedTheseTweets) {
  //             var targetList = channelNeedTheseTweets.get('tweets');
  //             console.debug('update channel', channelNeedTheseTweets.id, tweets.length);
  //             // TODO: cleanup old tweets
  //             targetList.pushObjects(tweets);
  //             channelNeedTheseTweets.save();
  //           });
  //         });
  //       }
  //     }
  //   });
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

  getHomeTimeLine(callback) {
    return cb.__call("statuses_homeTimeline", {}, callback);
  }
}

var twitter = new Twitter();

export default twitter;
