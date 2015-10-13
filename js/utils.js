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

$.get = function (url) {
  return $http(url).get();
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
