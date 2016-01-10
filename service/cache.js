(function() {
  "use strict";

  // Cache is storage lives only in memory
  class Cache extends Store {
    getJSON(field, default_value) {
      if (!(field in this.storage)) {
        this.storage[field] = default_value;
      }
      return this.storage[field];
    }

    saveJSON(field, value) {
      var old_value = this.storage[field];
      this.storage[field] = value;
      console.log('[cache] saveJSON:', field, value, this.callbacks);
      if (this.callbacks[field]) {
        console.log('[cache] trigger callbacks', field);
        this.callbacks[field].forEach((callback) => {
          callback(value, old_value);
        });
      }
      return value;
    }
  }

  var cache = new Cache();

  /*
  Client = {
    <screen_name>: [Twitter]
  }
  */
  Cache.addAccessToAccountField('client', (account) => {
    return new Twitter(account.token, account.token_secret);
  });
  cache.extends({
    getTwitterClient: function(account) {
      if (!account || !account.token || !account.token_secret) {
        console.error('[cache] getTwitterClient:', account);
        Notify.error(`[cache] getTwitterClient: ${account.screen_name}`);
        throw "[cache] getTwitterClient: account/token/token_secret is null!";
      }
      return this.getClient(account);
    }
  });

  // Exported
  document.cache = cache;
})();
