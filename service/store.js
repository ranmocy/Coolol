(function() {
  "use strict";

  var CLIENT_FIELD = 'clients';
  var LAST_ACTIVE_ACCOUNT_FIELD = 'last_account';

  var DEFAULT_CONFIG = {
    channels: [{
      name: 'Home',
      sources: ['statuses_homeTimeline']
    }, {
      name: 'Mentions',
      sources: ['statuses_mentionsTimeline']
    }, {
      name: 'Mix sources',
      sources: ['statuses_homeTimeline', 'statuses_mentionsTimeline']
    }]
  };

  var cache = {};
  var callbacks = {};

  class Store {
    // Add get method for field
    static addAccessTo(field_name, default_value) {
      var capitalized = $.capitalize(field_name);
      var field = field_name + 's';

      var getAllMethodName = `getAll${capitalized}s`;
      var getMethodName = `get${capitalized}`;
      var saveMethodName = `save${capitalized}`;
      var deleteMethodName = `delete${capitalized}`;
      var registerMethodName = `register${capitalized}s`;

      // read
      this.prototype[getAllMethodName] = function() {
        // the default value of whole field is always {}, because they are all saved in account space
        var values = this.getJSON(field, {});
        console.log(`[store] ${getAllMethodName}:`, values);
        return values;
      };
      this.prototype[getMethodName] = function(account) {
        var value = this[getAllMethodName]()[account.screen_name];
        console.log(`[store] ${getMethodName}:`, account.screen_name, value);
        if ($.isDefined(value) && value) {
          return value;
        }
        return default_value;
      };

      // write
      this.prototype[saveMethodName] = function(account, new_value) {
        var values = this[getAllMethodName]();
        console.log(`[store] ${saveMethodName}:`, account.screen_name, new_value);
        values[account.screen_name] = new_value;
        this.saveJSON(field, values);
        return new_value;
      };

      // delete
      this.prototype[deleteMethodName] = function(account) {
        var values = this[getAllMethodName]();
        var value = values[account.screen_name];
        console.log(`[store] ${deleteMethodName}:`, account.screen_name, value);
        if ($.isDefined(value)) {
          delete values[account.screen_name];
        }
        this.saveJSON(field, values);
        return value;
      };

      // register
      this.prototype[registerMethodName] = function(callback) {
        return this.register(field, callback);
      };

      return field_name;
    }

    register(field, callback) {
      if (!callbacks[field]) {
        callbacks[field] = [];
      }
      callbacks[field].push(callback);
      console.log('[store] register:', field, callbacks);
    }

    getJSON(field, default_value) {
      if (cache[field]) {
        return cache[field];
      }
      var data = JSON.parse(localStorage.getItem(field));
      if (!data) {
        data = default_value;
      }
      cache[field] = data;
      return data;
    }

    saveJSON(field, value) {
      cache[field] = value;
      localStorage.setItem(field, JSON.stringify(value));
      console.log('[store] saveJSON:', field, value, callbacks);
      if (callbacks[field]) {
        console.log('[store] trigger callbacks', field);
        callbacks[field].forEach((callback) => {
          callback(value);
        });
      }
      return value;
    }


    /*
    Client is not saved to local storage
    */
    getTwitterClient(account) {
      if (!account || !account.token || !account.token_secret) {
        console.error('[store] getTwitterClient:', account);
        throw "[store] getTwitterClient: account/token/token_secret is null!";
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
      console.log('[store] delete client:', account.screen_name);
      var client = cache[CLIENT_FIELD][account.screen_name];
      if ($.isDefined(client)) {
        delete cache[CLIENT_FIELD][account.screen_name];
      }
      return client;
    }

    /* Config */
    resetConfig(account) {
      this.saveConfig(account, DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }

    /* Account */
    updateAccount(account) {
      console.log('[store] updateAccount:', account.screen_name);
      this.getTwitterClient(account).fetch('users_show', {
        user_id: account.user_id,
        screen_name: account.screen_name,
      }).then((reply) => {
        console.log('[store] get user info', reply);
        var new_account = Object.assign({}, account, reply); // keep old info as much as possible
        if (account.screen_name !== new_account.screen_name) {
          console.log('[store] screen_name is changed!');
          this.deleteAccount(account);
        }
        this.saveAccount(new_account, new_account); // save new_account under new_account.screen_name
      });
    }

    updateAllAccounts() {
      console.log('[store] updateAllAccounts:', accounts);
      var accounts = this.getAllAccounts();
      for (var screen_name in accounts) {
        this.updateAccount(accounts[screen_name]);
      }
    }

    /* Last active account */
    getLastActiveAccount() {
      return this.getJSON(LAST_ACTIVE_ACCOUNT_FIELD, '');
    }

    saveLastActiveAccount(account) {
      this.saveJSON(LAST_ACTIVE_ACCOUNT_FIELD, account.screen_name);
      return account;
    }
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
  Store.addAccessTo('config', {});

  /*
  Tweets = {
    <screen_name>: [<Tweet>]
  }
  */
  Store.addAccessTo('tweets', []);

  /*
  Accounts = {
    <screen_name>: {
      'screen_name': '@NAME',
      'token': 'TOKEN',
      'token_secret': 'TOKEN_SECRET'
    }
  }
  */
  Store.addAccessTo('account', {});

  document.store = new Store();
})();
