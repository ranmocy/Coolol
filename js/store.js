(function () {
  "use strict";

  class Store {
    constructor() {
      this.cache = {};
    }

    getConfig() {
      if (this.cache.config) {
        return this.cache.config;
      }
      var config = JSON.parse(localStorage.getItem('config'));
      if (!config) {
        config = {};
      }
      this.cache.config = config;
      return config;
    }

    saveConfig(config) {
      this.cache.config = config;
      localStorage.setItem('config', JSON.stringify(config));
      return config;
    }
  }

  document.store = new Store();
})();
