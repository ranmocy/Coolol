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
// twitter.start();
document.services.twitter = twitter;

import $ from "js/utils.js";
$('button[name=auth]').addEventListener('click', function () {
  twitter.auth();
});
$('button[name=verify]').addEventListener('click', function () {
  twitter.verify($('input[name=pinCode]').value);
});

// config
var editor = new JSONEditor($('.config-editor'), {mode: 'code'});
document.config = JSON.parse(localStorage.getItem('config'));
console.log("Config loaded:", document.config);
editor.set(document.config);

$('button[name=save]').addEventListener('click', function () {
  document.config = editor.get();
  localStorage.setItem('config', JSON.stringify(document.config));
  console.log("Config saved.", JSON.stringify(document.config));
});

$('button[name=reset]').addEventListener('click', function () {
  document.config = {
    boards: [
      {
        // board1
        channels: [
          {
            // b1-channel1
            sources: ['statuses_homeTimeline']
          },
          {
            // b1-channel2
            sources: ['statuses_mentionsTimeline']
          }
        ]
      }
    ]
  };
  editor.set(document.config);
  localStorage.setItem('config', JSON.stringify(document.config));
  console.log("Config saved.", JSON.stringify(document.config));
});

// refresh
$('button[name=refresh]').addEventListener('click', function () {
  var channels = document.config.boards[0].channels;
  var allSources = new Set();
  channels.forEach(function (channel) {
    channel.sources.forEach(function (source) {
      allSources.add(source);
    });
  });
  console.log(allSources);

  allSources.forEach(function (source) {
    document.services.twitter.fetch(source);
  });

  channels.forEach(function (channel) {
    Promise.all(channel.sources.map((source) => document.services.twitter.get(source)))
      .then(function () {
        console.log('all promises:', arguments);
      });
  });
});

// var tweet = document.createElement('x-tweet');
// tweet.set('title', 'Title here').set('text', 'body text');
// document.body.appendChild(tweet);
