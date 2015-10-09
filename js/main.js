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

// start twitter service
System.import("js/twitter.js").then(function (m) {
  var twitter = m.default;
  twitter.start();
  document.services.twitter = twitter;
});

var tweet = document.createElement('x-tweet');
tweet.set('title', 'Title here').set('text', 'body text');
document.body.appendChild(tweet);
