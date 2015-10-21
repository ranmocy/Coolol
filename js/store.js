(function () {
  "use strict";

  var CONFIG_FIELD = 'config';
  var ACCOUNTS_FIELD = 'accounts';

  class Store {
    constructor() {
      this.cache = {};
    }

    getJSON(name, defaultValue) {
      if (this.cache[name]) {
        return this.cache[name];
      }
      var data = JSON.parse(localStorage.getItem(name));
      if (!data) {
        data = defaultValue;
      }
      this.cache[name] = data;
      return data;
    }

    saveJSON(name, value) {
      this.cache[name] = value;
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
  }

  document.store = new Store();
})();
