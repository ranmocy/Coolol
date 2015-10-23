(function () {

/* DOM */
var $ = function () {
  return document.querySelector.apply(document, arguments);
};

$.findAll = document.querySelectorAll;

$.removeAllChild = function(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  return element;
};

/* AJAX */
// A-> $http function is implemented in order to follow the standard Adapter pattern
function $http(url){
  'use strict';

  // A small example of object
  var core = {

    // Method that performs the ajax request
    ajax : function (method, url, args) {

      // Creating a promise
      var promise = new Promise( function (resolve, reject) {

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

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            // Performs the function "resolve" when this.status is equal to 2xx
            resolve(this.response);
          } else {
            // Performs the function "reject" when this.status is different than 2xx
            reject(this.statusText);
          }
        };
        client.onerror = function () {
          reject(this.statusText);
        };
      });

      // Return the promise
      return promise;
    }
  };

  // Adapter pattern
  return {
    'get' : function(args) {
      return core.ajax('GET', url, args);
    },
    'post' : function(args) {
      return core.ajax('POST', url, args);
    },
    'put' : function(args) {
      return core.ajax('PUT', url, args);
    },
    'delete' : function(args) {
      return core.ajax('DELETE', url, args);
    }
  };
}

$.get = function (url) {
  return $http(url).get();
};


/* Object */
$.isDefined = function (v) { return typeof v !== "undefined"; };

$.forEachKeyValue = function (obj, callback) {
  Object.keys(obj).forEach((key) => {
    callback(key, obj[key]);
  });
  return obj;
};

/* String */
$.capitalize = function (s) {
  return s[0].toUpperCase() + s.substr(1);
};
$.camelize = function (s) {
  return s.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
};

$.decodeEntities = (function () {
  // Source: http://stackoverflow.com/questions/5796718/html-entity-decode
  // create a new html document (doesn't execute script tags in child elements)
  var doc = document.implementation.createHTMLDocument("");
  var element = doc.createElement('div');

  function getText(str) {
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
      return str;
  }

  function decodeHTMLEntities(str) {
      if (str && typeof str === 'string') {
          var x = getText(str);
          while (str !== x) {
              str = x;
              x = getText(x);
          }
          return x;
      }
  }
  return decodeHTMLEntities;
})();


/* Core extentions */
NodeList.prototype.forEach = Array.prototype.forEach;

HTMLElement.prototype.trigger = function (eventName, parameters) {
  console.log('trigger', eventName, parameters);
  this.dispatchEvent(new CustomEvent(eventName, {detail: parameters}));
};

HTMLElement.prototype.handle = function (eventName, callback, popup) {
  this.addEventListener(eventName, (event) => {
    event.preventDefault();
    if ($.isDefined(popup) && popup) {
      console.log('handle propagate up');
    } else {
      event.stopPropagation();
    }
    console.log('handle', eventName, event.detail);
    callback(event);
  });
};

HTMLElement.prototype.handleActions = function (actions) {
  actions.forEach((actionName) => {
    this.handle(actionName, (event) => { this[actionName].call(this, event.detail); });
  });
};


/* globals module, define */
if (typeof module === "object" && module && typeof module.exports === "object") {
    module.exports = $;
} else {
    // Otherwise expose to the global object as usual
    if (typeof window === "object" && window) {
      window.$ = $;
    }
    if (typeof define === "function") {
    	define("$", [], function () { return $; });
    }
}
})();
