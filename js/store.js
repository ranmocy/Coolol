(function () {
  "use strict";

  var CONFIG_FIELD = 'config';
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

    getConfig() {
      return this.getJSON(CONFIG_FIELD, {});
    }

    saveConfig(config) {
      return this.saveJSON(CONFIG_FIELD, config);
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

    getTwitterClient(account) {
      if (!account || !account.token || !account.token_secret) {
        console.error('getTwitterClient', account);
        throw "getTwitterClient: account/token/token_secret is null!";
      }
      if (!cache.twitter_clients || !cache.twitter_clients[account.screen_name]) {
        this.saveAccount(account, new Twitter(account.token, account.token_secret));
      }
      return cache.twitter_clients[account.screen_name];
    }

    updateUserInfo(account) {
      console.log('updateUserInfo');
      document.store.getTwitterClient(account).fetch('users_show', {
        user_id: account.user_id,
        screen_name: account.screen_name,
      }).then((reply) => {
        console.log('get user info', reply);
        account = Object.assign({}, account, reply);
        document.store.saveAccount(account, this.current_client);
        console.log('save account', account);
      });
    }

    updateAllUsers() {
      var accounts = this.getAccounts();
      for (var screen_name in accounts) {
        this.updateUserInfo(accounts[screen_name]);
      }
      console.log('updateAllUsers', accounts);
    }

    deleteAccount(account) {
      if (cache.twitter_clients && cache.twitter_clients[account.screen_name]) {
        console.log('delete client', account);
        delete cache.twitter_clients[account.screen_name];
      }
      console.log('delete account', account);
      var accounts = this.getAccounts();
      delete accounts[account.screen_name];
      this.saveAccounts(accounts);
    }

    saveAccount(account, client) {
      if (!cache.twitter_clients) {
        cache.twitter_clients = {};
      }
      cache.twitter_clients[account.screen_name] = client;
      var accounts = this.getAccounts();
      accounts[account.screen_name] = account;
      this.saveAccounts(accounts);
    }

    saveAccounts(accounts) {
      console.log('saveAccounts', accounts);
      return this.saveJSON(ACCOUNTS_FIELD, accounts);
    }

    registerAccounts(callback) {
      return this.register(ACCOUNTS_FIELD, callback);
    }
  }

  document.store = new Store();
})();
