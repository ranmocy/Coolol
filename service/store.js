(function() {
  "use strict";

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
  const CONFIG_SPEC = {
    name: 'entire config',
    type: 'object',
    required: {
      channels: {
        name: 'channels',
        type: 'array',
        elements: {
          name: 'channel',
          type: 'object',
          required: {
            name: {
              name: 'channel name',
              type: 'string',
            },
            sources: {
              name: 'channel sources',
              type: 'object',
              values: {
                name: 'channel source parameters',
                type: 'object'
              }
            }
          },
          optional: {
            filters: {
              name: 'channel filters',
              type: 'array',
              elements: {
                name: 'channel filter rule',
                type: 'string',
              }
            }
          }
        }
      }
    },
    optional: {
      filters: {
        name: 'global filters',
        type: 'array',
        elements: {
          name: 'global filter rule',
          type: 'string',
        }
      }
    }
  };
  function createTypeErroMessage(name, type, config) {
    return `${name} needs to be ${type}, instead it is ${JSON.stringify(config)}`;
  }
  /* Returns array of error messages. */
  function verifyConfigWithSpec(spec, config) {
    let error_messages = [];
    if (!$.isDefined(spec)) {
      return error_messages;
    }
    if (!$.isDefined(config)) {
      error_messages.push(`${spec.name} is required`);
      return error_messages;
    }

    switch(spec.type) {
      case 'string':
        if (!$.isString(config)) {
          error_messages.push(createTypeErroMessage(spec.name, 'a string', config));
        }
        break;
      case 'array':
        if ($.isArray(config)) {
          let elements_spec = spec.elements;
          for (let sub_config of config) {
            error_messages = error_messages.concat(verifyConfigWithSpec(elements_spec, sub_config));
          }
        } else {
          error_messages.push(createTypeErroMessage(spec.name, 'an array', config));
        }
        break;
      case 'object':
        if ($.isObject(config)) {
          for (let [sub_key, sub_spec] of $.entries(spec.required)) {
            if (config[sub_key]) {
              error_messages = error_messages.concat(verifyConfigWithSpec(sub_spec, config[sub_key]));
            } else {
              error_messages.push(`${spec.name} requires key '${sub_key}'`);
            }
          }
          for (let [sub_key, sub_spec] of $.entries(spec.optional)) {
            if (config[sub_key]) {
              error_messages = error_messages.concat(verifyConfigWithSpec(sub_spec, config[sub_key]));
            }
          }
        } else {
          error_messages.push(createTypeErroMessage(spec.name, 'an object', config));
        }
        break;
      default:
        console.warn('Unknown spec type', spec);
    }

    return error_messages;
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
  Store.addAccessToAccountField('config', Store.defaultValueFactoryFactory({}));
  store.extends({
    verifyConfig: function(config) {
      return verifyConfigWithSpec(CONFIG_SPEC, config);
    },

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


  const CURRENT_VERSION = '0.2.0';
  /*
  Version = <CURRENT_VERSION>
  */
  Store.addAccessToAppField('version', Store.defaultValueFactoryFactory(CURRENT_VERSION));
  store.extends({
    updateVersionCode: function() {
      let old_version_str = this.getVersion();
      let version_str = CURRENT_VERSION;
      var require_reconfig = false;
      if (old_version_str) {
        // Not first time, check version code
        var version = version_str.split('.');
        var old_version = old_version_str.split('.');
        if (version.length !== old_version.length || version[0] !== old_version[0]) {
          // Major update, backward incompatible, config need update
          require_reconfig = true;
        } else if (version[1] !== old_version[1]) {
          // Minor update, featuers extended, drop caches
        }
        // Bug fixes update, do nothing
      } else {
        // First time app launched, cleanup everything.
        localStorage.clear();
      }

      // Update finished, save version
      this.saveVersion(CURRENT_VERSION);
      return require_reconfig;
    },
  });

  // Exported
  window.Store = Store;
  document.store = store;
})();
