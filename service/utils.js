(function() {

  var $ = Object.assign(function() {
    return document.querySelector.apply(document, arguments);
  }, {
    /* DOM */
    findAll: function() {
      return document.querySelectorAll.apply(document, arguments);
    },

    removeAllChildren: function(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      return element;
    },

    /* AJAX */
    get: function(url) {
      return $http(url).get();
    },

    /* Object */
    isDefined: function(v) {
      return typeof v !== "undefined";
    },

    forEachKeyValue: function(obj, callback) {
      Object.keys(obj).forEach((key) => {
        callback(key, obj[key]);
      });
      return obj;
    },

    /* String */
    capitalize: function(s) {
      return s[0].toUpperCase() + s.substr(1);
    },

    camelize: function(s) {
      return s.replace(/_([a-z])/g, function(g) {
        return g[1].toUpperCase();
      });
    },


  });


  /* Core extentions */
  NodeList.prototype.forEach = Array.prototype.forEach;

  Object.assign(DocumentFragment.prototype, {
    $: function() {
      return this.querySelector.apply(this, arguments);
    },
  });

  Object.assign(HTMLElement.prototype, {
    $: function() {
      return this.querySelector.apply(this, arguments);
    },

    detach: function() {
      var parent = this.parentNode;
      if (!parent) {
        return;
      }
      parent.removeChild(this);
      return this;
    },

    show: function(display) {
      if (!$.isDefined(display)) {
        if ($.isDefined(this._old_display_value)) {
          display = this._old_display_value;
          this._old_display_value = undefined;
        } else {
          display = 'block';
        }
      }
      this.style.display = display;
    },

    hide: function() {
      this._old_display_value = this.style.display;
      this.style.display = 'none';
    },

    trigger: function(eventName, parameters) {
      console.log('trigger', eventName, parameters);
      this.dispatchEvent(new CustomEvent(eventName, {
        detail: parameters
      }));
    },

    handle: function(eventName, callback, popup) {
      this.addEventListener(eventName, (event) => {
        event.preventDefault();
        if ($.isDefined(popup) && popup) {
          console.log('handle propagate up');
        } else {
          event.stopPropagation();
        }
        console.log('handle', eventName, event.detail);
        if (callback) {
          callback(event);
        }
      });
    },

    handleActions: function(actions) {
      actions.forEach((actionName) => {
        this.handle(actionName, (event) => {
          this[actionName].call(this, event.detail);
        });
      });
    },
  });


  /* A-> $http function is implemented in order to follow the standard Adapter pattern */
  function $http(url) {
    'use strict';

    // A small example of object
    var core = {

      // Method that performs the ajax request
      ajax: function(method, url, args) {

        // Creating a promise
        var promise = new Promise(function(resolve, reject) {

          // Instantiates the XMLHttpRequest
          var client = new XMLHttpRequest();
          var uri = url;

          if (args && (method === 'POST' || method === 'PUT')) {
            uri += '?';
            var argcount = 0;
            for (var key in args) {
              if (args.hasOwnProperty(key)) {
                if (argcount++) {
                  uri += '&';
                }
                uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
              }
            }
          }

          client.open(method, uri);
          client.send();

          client.onload = function() {
            if (this.status >= 200 && this.status < 300) {
              // Performs the function "resolve" when this.status is equal to 2xx
              resolve(this.response);
            } else {
              // Performs the function "reject" when this.status is different than 2xx
              reject(this.statusText);
            }
          };
          client.onerror = function() {
            reject(this.statusText);
          };
        });

        // Return the promise
        return promise;
      }
    };

    // Adapter pattern
    return {
      'get': function(args) {
        return core.ajax('GET', url, args);
      },
      'post': function(args) {
        return core.ajax('POST', url, args);
      },
      'put': function(args) {
        return core.ajax('PUT', url, args);
      },
      'delete': function(args) {
        return core.ajax('DELETE', url, args);
      }
    };
  }


  /* globals module, define */
  if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports = $;
  } else {
    // Otherwise expose to the global object as usual
    if (typeof window === "object" && window) {
      window.$ = $;
    }
    if (typeof define === "function") {
      define("$", [], function() {
        return $;
      });
    }
  }
})();
