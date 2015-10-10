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

if (document.services != null) {
  throw "document.services is not null?!";
}
document.services = {};

import twitter from "js/twitter.js";
twitter.start();
document.services.twitter = twitter;

import $ from "js/utils.js";
$('button[name=auth]').addEventListener('click', function () {
  twitter.auth();
});
$('button[name=verify]').addEventListener('click', function () {
  twitter.verify($('input[name=pinCode]').value);
});

$('button[name=save]').addEventListener('click', function () {
  localStorage.setItem('config', $("textarea[name='config']").value);
  console.log("Config saved.");
});

var config = localStorage.getItem('config');
console.log("Config loaded:", config);

// var tweet = document.createElement('x-tweet');
// tweet.set('title', 'Title here').set('text', 'body text');
// document.body.appendChild(tweet);
