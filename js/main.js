// Check features:

// HTML5 local storage
if(typeof(Storage) === "undefined") {
  throw "Can't read from storage!";
}

// Test to see if the browser supports the HTML template element by checking
// for the presence of the template element's content attribute.
if (!('content' in document.createElement('template'))) {
  throw "Can't use HTML template!";
}

// import twitter from "js/twitter.js";
// twitter.start();

// import $ from "js/utils.js";
// import Component from "js/component.js";
// Component.register();
// var c = new Component();
// c.attach($('div#main'));

var tweet = document.createElement('x-tweet');
tweet.set('title', 'Title here').set('text', 'body text');
document.body.appendChild(tweet);
