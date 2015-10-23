(function () {
  "use strict";

  var CONFIG_FIELD = 'config';
  var ACCOUNTS_FIELD = 'accounts';

  var cache = {};
  // var callbacks = {};

  class Store {
    constructor() {
    }

    getJSON(name, defaultValue) {
      if (cache[name]) {
        return cache[name];
      }
      var data = JSON.parse(localStorage.getItem(name));
      if (!data) {
        data = defaultValue;
      }
      cache[name] = data;
      return data;
    }

    saveJSON(name, value) {
      cache[name] = value;
      localStorage.setItem(name, JSON.stringify(value));
      return value;
    }

    getConfig() {
      return this.getJSON(CONFIG_FIELD, {});
    }

    saveConfig(config) {
      return this.saveJSON(CONFIG_FIELD, config);
    }

    getAccounts() {
      var accounts = this.getJSON(ACCOUNTS_FIELD, []);
      return accounts;
    }

    saveAccounts(accounts) {
      return this.saveJSON(ACCOUNTS_FIELD, accounts);
    }

    getTwitterClient(account) {
      if (!account || !account.token || !account.token_secret) {
        throw "getTwitterClient: account/token/token_secret is null!";
      }
      if (!cache.twitter_clients || !cache.twitter_clients[account.screen_name]) {
        this.saveTwitterClient(account, new Twitter(account.token, account.token_secret));
      }
      return cache.twitter_clients[account.screen_name];
    }

    saveTwitterClient(account, client) {
      if (!cache.twitter_clients) {
        cache.twitter_clients = {};
      }
      cache.twitter_clients[account.screen_name] = client;
    }
  }

  document.store = new Store();
})();
