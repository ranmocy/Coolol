(function () {
  "use strict";

  var CONFIG_FIELD = 'config';
  var CLIENT_FIELD = 'client';
  var TWEETS_FIELD = 'tweets';
  var ACCOUNTS_FIELD = 'accounts';

  var cache = {};
  var callbacks = {};

  class Store {
    register(field, callback) {
      if (!callbacks[field]) {
        callbacks[field] = [];
      }
      callbacks[field].push(callback);
      console.log('store register callback', field, callbacks);
    }

    getJSON(field, defaultValue) {
      if (cache[field]) {
        return cache[field];
      }
      var data = JSON.parse(localStorage.getItem(field));
      if (!data) {
        data = defaultValue;
      }
      cache[field] = data;
      return data;
    }

    saveJSON(field, value) {
      cache[field] = value;
      localStorage.setItem(field, JSON.stringify(value));
      console.log('saveJSON', field, value, callbacks);
      if (callbacks[field]) {
        console.log('store trigger callbacks', field);
        callbacks[field].forEach((callback) => {
          callback(value);
        });
      }
      return value;
    }


    /*
    Config = {
      <screen_name>: {
        channels: [
          {
            'name': <NAME>,
            'sources': [
              <SOURCE>
            ]
          }
        ]
      }
    }
    */
    getConfig() {
      return this.getJSON(CONFIG_FIELD, {});
    }

    saveConfig(config) {
      return this.saveJSON(CONFIG_FIELD, config);
    }

    /*
    Client is not saved to local storage
    */
    getTwitterClient(account) {
      if (!account || !account.token || !account.token_secret) {
        console.error('getTwitterClient', account);
        throw "getTwitterClient: account/token/token_secret is null!";
      }
      if (!cache[CLIENT_FIELD]) {
        cache[CLIENT_FIELD] = {};
      }
      var client = new Twitter(account.token, account.token_secret);
      cache[CLIENT_FIELD][account.screen_name] = client;
      return client;
    }

    saveTwitterClient(account, client) {
      if (!cache[CLIENT_FIELD]) {
        cache[CLIENT_FIELD] = {};
      }
      cache[CLIENT_FIELD][account.screen_name] = client;
      return client;
    }

    deleteTwitterClient(account) {
      if (!cache[CLIENT_FIELD]) {
        cache[CLIENT_FIELD] = {};
      }
      console.log('delete client', account.screen_name);
      var client = cache[CLIENT_FIELD][account.screen_name];
      if ($.isDefined(client)) {
        delete cache[CLIENT_FIELD][account.screen_name];
      }
      return client;
    }

    /*
    Tweets = {
      <screen_name>: [<Tweet>]
    }
    */
    getTweets(account) {
      var tweets = this.getJSON(TWEETS_FIELD, {})[account.screen_name];
      if ($.isDefined(tweets) && tweets) {
        return tweets;
      }
      return [];
    }

    saveTweets(account, tweets) {
      var all_tweets = this.getJSON(TWEETS_FIELD, {});
      all_tweets[account.screen_name] = tweets;
      this.saveJSON(TWEETS_FIELD, all_tweets);
      return tweets;
    }

    deleteTweets(account) {
      var all_tweets = this.getJSON(TWEETS_FIELD, {});
      var tweets = all_tweets[account.screen_name];
      if ($.isDefined(tweets)) {
        delete all_tweets[account.screen_name];
      }
      return tweets;
    }

    /*
    Accounts = {
      <screen_name>: {
        'screen_name': '@NAME',
        'token': 'TOKEN',
        'token_secret': 'TOKEN_SECRET'
      }
    }
    */
    getAccounts() {
      var accounts = this.getJSON(ACCOUNTS_FIELD, {});
      console.log('getAccounts', accounts);
      return accounts;
    }

    updateAccount(account) {
      console.log('updateAccount');
      this.getTwitterClient(account).fetch('users_show', {
        user_id: account.user_id,
        screen_name: account.screen_name,
      }).then((reply) => {
        console.log('get user info', reply);
        account = Object.assign({}, account, reply);
        this.saveAccount(account);
        console.log('save account', account);
      });
    }

    updateAllAccounts() {
      console.log('updateAllAccounts', accounts);
      var accounts = this.getAccounts();
      for (var screen_name in accounts) {
        this.updateAccount(accounts[screen_name]);
      }
    }

    deleteAccount(account) {
      console.log('delete account', account.screen_name);
      // TODO: delete config
      this.deleteTwitterClient(account);
      this.deleteTweets(account);

      var accounts = this.getAccounts();
      delete accounts[account.screen_name];
      this.saveJSON(ACCOUNTS_FIELD, accounts);
      return account;
    }

    saveAccount(account, client) {
      console.log('saveAccount', account);
      var accounts = this.getAccounts();
      accounts[account.screen_name] = account;
      this.saveJSON(ACCOUNTS_FIELD, accounts);
      return account;
    }

    registerAccounts(callback) {
      return this.register(ACCOUNTS_FIELD, callback);
    }
  }

  document.store = new Store();
})();
