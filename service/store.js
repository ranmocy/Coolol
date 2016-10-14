(function() {
  "use strict";

  const CURRENT_VERSION = '0.2.0';
  const DEFAULT_CONFIG =
  {
    "filters": [
      "isBetweenUser('ranmocy', 'CathellieAir')",
    ],
    "channels": [{
      "name": "Home",
      "sources": {
        "statuses_homeTimeline": {},
      },
      "filters": [
        "tweetContainsAny('SomeDirtyWord', 'SomeUninterestingKeyword', 'OrSomeBoringEventName')"
      ],
    }, {
      "name": "Mentions",
      "sources": {
        "statuses_mentionsTimeline": {},
      },
    }, {
      "name": "Direct Messages",
      "sources": {
        "directMessages": {},
        "directMessages_sent": {},
      },
    }, {
      "name": "Mix sources",
      "sources": {
        "statuses_homeTimeline": {},
        "statuses_userTimeline": { "screen_name": "ranmocy" },
      },
      "filters": [
        "sender.screen_name == 'CathellieAir' && receiver.screen_name == 'ranmocy'",
      ],
    }, {
      "name": "My tweets",
      "sources": {
        "statuses_userTimeline": { "user_id": "me" },
      }
    }]
  };

  class Store {

    static log() {
      if (!document.debug) {
        console.debug.apply(console, arguments);
      }
    }

    static defaultValueFactoryFactory(default_value) {
      return function() { return default_value; };
    }

    // Add methods for application level field in format of `{value: <factory()>}`
    static addAccessToAppField(field_name, factory) {
      var capitalized = $.camelize(field_name);
      var field = field_name;

      var getMethodName = `get${capitalized}`;
      var saveMethodName = `save${capitalized}`;
      var deleteMethodName = `delete${capitalized}`;
      var registerMethodName = `register${capitalized}`;


      // read
      this.prototype[getMethodName] = function() {
        var value = this.getJSON(field, factory);
        Store.log(`[store] ${getMethodName}:`, value);
        return value;
      };

      // write
      this.prototype[saveMethodName] = function(new_value) {
        Store.log(`[store] ${saveMethodName}:`, new_value);
        this.saveJSON(field, new_value);
        return new_value;
      };

      // delete
      this.prototype[deleteMethodName] = function() {
        var old_value = this[getMethodName]();
        Store.log(`[store] ${deleteMethodName}:`, old_value);
        this.saveJSON(field, factory);
        return old_value;
      };

      // register
      this.prototype[registerMethodName] = function(callback) {
        return this.register(field, callback);
      };

      return field_name;
    }

    // Add methods for account level field in format of `{<screen_name>: <factory()>}`
    static addAccessToAccountField(field_name, factory) {
      var capitalized = $.camelize(field_name);
      var field = field_name + 's';
      var account_default_factory = this.defaultValueFactoryFactory({});

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
        var values = this.getJSON(field, account_default_factory);
        Store.log(`[store] ${getAllMethodName}:`, values);
        return values;
      };
      this.prototype[getMethodName] = function(account) {
        var value = this[getAllMethodName]()[account.screen_name];
        Store.log(`[store] ${getMethodName}:`, account.screen_name, value);
        if ($.isDefined(value)) {
          return value;
        } else if ($.isDefined(factory)) {
          return this[saveMethodName](account, factory(account));
        } else {
          return null;
        }
      };

      // write
      this.prototype[saveAllMethodName] = function(new_value) {
        Store.log(`[store] ${saveAllMethodName}:`, new_value);
        this.saveJSON(field, new_value);
        return new_value;
      };
      this.prototype[saveMethodName] = function(account, new_value) {
        var values = this[getAllMethodName]();
        Store.log(`[store] ${saveMethodName}:`, account.screen_name, new_value);
        values[account.screen_name] = new_value;
        this.saveJSON(field, values);
        return new_value;
      };

      // delete
      this.prototype[deleteAllMethodName] = function() {
        Store.log(`[store] ${deleteAllMethodName}:`);
        this.saveJSON(field, account_default_factory());
      };
      this.prototype[deleteMethodName] = function(account) {
        var values = this[getAllMethodName]();
        var old_value = values[account.screen_name];
        Store.log(`[store] ${deleteMethodName}:`, account.screen_name, old_value);
        if ($.isDefined(old_value)) {
          delete values[account.screen_name];
        }
        this.saveJSON(field, values);
        return old_value;
      };

      // register
      this.prototype[registerMethodName] = function(callback) {
        return this.register(field, callback);
      };

      return field_name;
    }

    constructor() {
      this.storage = {};
      this.callbacks = {};
    }

    extends(fields_object) {
      return Object.assign(this, fields_object);
    }

    register(field, callback) {
      if (!this.callbacks[field]) {
        this.callbacks[field] = [];
      }
      this.callbacks[field].push(callback);
      Store.log('[store] register:', field, this.callbacks);
    }

    // Don't call saveJSON! Calls may infinitely loop.
    // We don't have to save the default value to local storage,
    // since we can create the same/similar one every time.
    getJSON(field, factory) {
      if (field in this.storage) {
        return this.storage[field];
      }
      var data = this.getLocalStorageItem(field);
      if (! $.isDefined(data)) {
        data = factory();
      }
      this.storage[field] = data;
      return data;
    }

    saveJSON(field, value) {
      var old_value = this.getJSON(field, Store.defaultValueFactoryFactory(value));
      this.storage[field] = value;
      this.saveLocalStorageItem(field, value);
      Store.log('[store] saveJSON:', field, value, old_value, this.callbacks);
      if (this.callbacks[field]) {
        Store.log('[store] trigger callbacks', field);
        this.callbacks[field].forEach((callback) => {
          callback(value, old_value);
        });
      }
      return value;
    }

    getLocalStorageItem(field) {
      try {
        return JSON.parse(localStorage.getItem(field));
      } catch (e) {
        console.error('[storage] getLocalStorageItem: broken data, drop it.', field);
        localStorage.removeItem(field);
        return undefined;
      }
    }

    saveLocalStorageItem(field, value) {
      return localStorage.setItem(field, JSON.stringify(value));
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
  Store.addAccessToAccountField('config', Store.defaultValueFactoryFactory({}));
  store.extends({
    resetConfig: function(account) {
      this.saveConfig(account, DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    },
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
  Store.addAccessToAccountField('account', Store.defaultValueFactoryFactory({}));
  store.extends({
    updateAccount: function(account) {
      Store.log('[store] updateAccount:', account.screen_name);
      document.cache.getTwitterClient(account).fetch('users_show', {
        user_id: account.user_id,
        screen_name: account.screen_name,
      }).then((reply) => {
        Store.log('[store] get user info', reply);
        var new_account = Object.assign({}, account, reply); // keep old info as much as possible
        if (account.screen_name !== new_account.screen_name) {
          Store.log('[store] screen_name is changed!');
          this.deleteAccount(account);
        }
        this.saveAccount(new_account, new_account); // save new_account under new_account.screen_name
      });
    },

    updateAllAccounts: function() {
      var accounts = this.getAllAccounts();
      Store.log('[store] updateAllAccounts:', accounts);
      for (var screen_name in accounts) {
        this.updateAccount(accounts[screen_name]);
      }
    },
  });


  /*
  LastActiveAccount = <LAST_ACCOUNT>
  */
  Store.addAccessToAppField('last_active_account_name', Store.defaultValueFactoryFactory(''));


  /*
  Version = <CURRENT_VERSION>
  */
  Store.addAccessToAppField('version', Store.defaultValueFactoryFactory(CURRENT_VERSION));
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
      console.warn("ATTENTION: Backward incompatible update finished, your config may need updates and your account may need re-authorize!");
      if ($.isDefined(Notify)) {
        Notify.warn("ATTENTION: Backward incompatible update finished, your config may need updates and your account may need re-authorize!");
      }
    } else if (version[1] !== old_version[1]) {
      // Minor update, featuers extended, drop caches
    }
    // Bug fixes update, do nothing
  });
  store.saveVersion(CURRENT_VERSION);

  // Exported
  window.Store = Store;
  document.store = store;
})();
