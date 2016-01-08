window.$ = (function() {
  "use strict";

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
      return (typeof(v) !== "undefined") && (v !== null);
    },

    forEachKeyValue: function(obj, callback) {
      Object.keys(obj).forEach((key) => {
        callback(key, obj[key]);
      });
      return obj;
    },

    mapKeyValue: function(obj, callback) {
      return Object.keys(obj).map((key) => {
        return callback(key, obj[key]);
      });
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

    /* Callbacks */
    registerObjectCallback: function(obj, callback) {
      if (!$.isDefined(obj.__callbacks)) {
        obj.__callbacks = [];
      }
      if (typeof callback !== 'function') {
        console.error('[utils]', 'registerObjectCallback', 'callback is not a function', callback);
        Notify.error(`[utils] registerObjectCallback: callback is not a function!`);
        return;
      }
      obj.__callbacks.push(callback);
      return obj;
    },

    updateObject: function(obj, newFields) {
      Object.assign(obj, newFields);
      if ($.isDefined(obj.__callbacks)) {
        // call all the callbacks and remove these callbacks.
        // it's the callbacks' duty to re-register
        console.debug("Updated obj: ", obj, "trigger callbacks.", obj.__callbacks);
        var callbacks = obj.__callbacks;
        obj.__callbacks = [];
        callbacks.forEach((callback) => {
          if (typeof callback === 'function') {
            callback(obj);
          } else {
            console.error('[utils]', 'updateObject', 'callback is not a function', callback);
            Notify.error(`[utils] updateObject: callback is not a function!`);
          }
        });
      }
    },

  });


  /* Core extensions */
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
      if (this.style.display === 'none') {
        if (!$.isDefined(display)) {
          if ($.isDefined(this._old_display_value)) {
            display = this._old_display_value;
            this._old_display_value = undefined;
          } else {
            display = 'block';
          }
        }
        this.style.display = display;
      }
    },

    hide: function() {
      if (this.style.display !== 'none') {
        this._old_display_value = this.style.display;
        this.style.display = 'none';
      }
    },

    trigger: function(eventName) {
      var parameters = Array.from(arguments).slice(1);
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
        if (['mouseenter', 'mouseleave', 'scroll'].indexOf(eventName) < 0) {
          console.log('handle', eventName, event.detail);
        }
        if (callback) {
          callback(event);
        }
      });
    },

    handleActions: function(actions) {
      actions.forEach((actionName) => {
        this.handle(actionName, (event) => {
          this[actionName].apply(this, event.detail);
        });
      });
    },
  });


  /* A function is implemented in order to follow the standard Adapter pattern */
  function $http(url) {
    // A small example of object
    var core = {

      // Method that performs the Ajax request
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

  return $;
})();
