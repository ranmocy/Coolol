let $suite = window.new_test_suite(document.currentScript.src);
let $test_put = window.new_test($suite, 'Cache Table Access');


function getRequestPromise(request) {
  return new Promise((resolve, reject) => {
    console.log('set request', request);
    window.request = request;
    request.onsuccess = (event) => {
      console.log('promise success');
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      console.log('promise error');
      reject(event.target.errorCode);
    };
  });
}

document.account = {screen_name: 'ranmocy'};

let store = document.store;

let tweets = [
  {id_str: '1234', text: 'I love it.'},
  {id_str: '3123', text: 'I love it too.'},
  {id_str: '1234', text: 'I love it three.'},
];

console.debug('start!');
store
  .putTweets(tweets)
  .then(() => {
    return store.getTweets(['3123', '1234', '4444']);
  })
  .then((tweets) => {
    console.debug('read', tweets);
    if ((tweets[0].text !== 'I love it too.') ||
        (tweets[1].text !== 'I love it three.') ||
        (tweets[2] !== undefined)) {
      throw 'Expected tweets';
    }
  })
  .then(() => {
    console.debug('Removing!!!');
    return getRequestPromise(window.indexedDB.deleteDatabase('Coolol'));
  })
  .then(() => {
    console.log('Check Databases');
    return getRequestPromise(window.indexedDB.webkitGetDatabaseNames());
  })
  .then((names) => {
    console.log('Databases', names);
    if (names.length > 0) {
      throw 'Database is not deleted';
    }
  })
  .then(() => {
    $test_put.className = 'success';
  })
  .catch(() => {
    $test_put.className = 'failed';
  });
