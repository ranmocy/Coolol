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
document.services.twitter = twitter;

$('button[name=auth]').addEventListener('click', function () {
  twitter.auth();
});
$('button[name=verify]').addEventListener('click', function () {
  twitter.verify($('input[name=pinCode]').value);
});


// load Config
document.config = JSON.parse(localStorage.getItem('config'));
console.log("Config loaded:", document.config);


var mainElem = $('#main');
var switchToBoard = function () {
  $.removeAllChild(mainElem);
  var board = document.createElement('x-board');
  mainElem.appendChild(board);

  // load cached
  var boardConfig = document.config.boards[0];
  board.setConfig(boardConfig);
  var data = JSON.parse(localStorage.getItem('tweets'));
  if (data !== null) {
    board.setData(data);
  }
};
$('button[name=switch-board]').addEventListener('click', switchToBoard);

// init view is board
switchToBoard();
