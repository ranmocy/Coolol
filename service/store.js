document.store = (function() {
  "use strict";

  var CLIENT_FIELD = 'clients';
  var LAST_ACTIVE_ACCOUNT_FIELD = 'last_account';

  var CURRENT_VERSION = '0.0.2';
  var DEFAULT_CONFIG =
  {
    "channels": [{
      "name": "Home",
      "sources": {
        "statuses_homeTimeline": {}
      },
    }, {
      "name": "Mentions",
      "sources": {
        "statuses_mentionsTimeline": {}
      },
    }, {
      "name": "Mix sources",
      "sources": {
        "statuses_homeTimeline": {},
        "statuses_userTimeline": { "user_id": "ranmocy" }
      },
    }, {
      "name": "My tweets",
      "sources": {
        "statuses_userTimeline": { "user_id": "me" }
      }
    }]
  };

  var cache = {};
  var callbacks = {};

  class Store {
    // Add methods for application level field in format of `{value: <default_value>}`
    static addAccessToAppField(field_name, default_value) {
      var capitalized = $.capitalize(field_name);
      var field = field_name;

      var getMethodName = `get${capitalized}`;
      var saveMethodName = `save${capitalized}`;
      var deleteMethodName = `delete${capitalized}`;
      var registerMethodName = `register${capitalized}`;


      // read
      this.prototype[getMethodName] = function() {
        var value = this.getJSON(field, default_value);
        console.log(`[store] ${getMethodName}:`, value);
        return value;
      };

      // write
      this.prototype[saveMethodName] = function(new_value) {
        this.saveJSON(field, new_value);
        console.log(`[store] ${saveMethodName}:`, new_value);
        return new_value;
      };

      // delete
      this.prototype[deleteMethodName] = function() {
        this.saveJSON(field, default_value);
        console.log(`[store] ${deleteMethodName}:`, default_value);
        return default_value;
      };

      // register
      this.prototype[registerMethodName] = function(callback) {
        return this.register(field, callback);
      };

      return field_name;
    }

    // Add methods for account level field in format of `{<screen_name>: <default_value>}`
    static addAccessToAccountField(field_name, default_value) {
      var capitalized = $.capitalize(field_name);
      var field = field_name + 's';

      var getAllMethodName = `getAll${capitalized}s`;
      var getMethodName = `get${capitalized}`;
      var saveAllMethodName = `saveAll${capitalized}s`;
      var saveMethodName = `save${capitalized}`;
      var deleteAllMethodName = `deleteAll${capitalized}s`;
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
      this.prototype[saveAllMethodName] = function(new_value) {
        console.log(`[store] ${saveAllMethodName}:`, new_value);
        this.saveJSON(field, new_value);
        return new_value;
      };
      this.prototype[saveMethodName] = function(account, new_value) {
        var values = this[getAllMethodName]();
        console.log(`[store] ${saveMethodName}:`, account.screen_name, new_value);
        values[account.screen_name] = new_value;
        this.saveJSON(field, values);
        return new_value;
      };

      // delete
      this.prototype[deleteAllMethodName] = function() {
        console.log(`[store] ${deleteAllMethodName}:`);
        this.saveJSON(field_name, default_value)
      };
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
      if (! $.isDefined(data)) {
        data = default_value;
      }
      cache[field] = data;
      return data;
    }

    saveJSON(field, value) {
      var old_value = cache[field];
      cache[field] = value;
      localStorage.setItem(field, JSON.stringify(value));
      console.log('[store] saveJSON:', field, value, callbacks);
      if (callbacks[field]) {
        console.log('[store] trigger callbacks', field);
        callbacks[field].forEach((callback) => {
          callback(value, old_value);
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
        Notify.error(`[store] getTwitterClient: ${account.screen_name}`);
        throw "[store] getTwitterClient: account/token/token_secret is null!";
      }
      if (!cache[CLIENT_FIELD]) {
        cache[CLIENT_FIELD] = {};
      }
      if (!(account.screen_name in cache[CLIENT_FIELD])) {
        this.saveTwitterClient(account, new Twitter(account.token, account.token_secret));
      }
      return cache[CLIENT_FIELD][account.screen_name];
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

  var store = new Store();

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
  Store.addAccessToAccountField('config', {});
  store.registerConfigs((configs, old_configs) => {
    for (var screen_name in configs) {
      if (configs[screen_name] !== old_configs[screen_name]) {
        var account = store.getAllAccounts()[screen_name];
        store.deleteTweets(account);
      }
    }
  });

  /*
  Accounts = {
    <screen_name>: {
      'screen_name': '@NAME',
      'token': 'TOKEN',
      'token_secret': 'TOKEN_SECRET'
    }
  }
  */
  Store.addAccessToAccountField('account', {});

  /*
  Version = <CURRENT_VERSION>
  */
  Store.addAccessToAppField('version', CURRENT_VERSION);
  store.registerVersion((version_str, old_version_str) => {
    if (! $.isDefined(old_version_str)) {
      // First time app launched, cleanup everything.
      store.deleteAllConfigs();
      store.deleteAllAccounts();
      return;
    }
    var version = version_str.split('.');
    var old_version = old_version_str.split('.');
    if (version.length !== old_version.length || version[0] !== old_version[0]) {
      // Major update, backward incompatible, drop everything
      console.error("ATTENTION: Backward incompatible update finished, your config may need updates and your account may need re-authorize!");
      if ($.isDefined(Notify)) {
        Notify.error("ATTENTION: Backward incompatible update finished, your config may need updates and your account may need re-authorize!");
      }
    } else if (version[1] !== old_version[1]) {
      // Minor update, featuers extended, drop caches
    }
    // Bug fixes update, do nothing
  });
  store.saveVersion(CURRENT_VERSION);

  return store;
})();
