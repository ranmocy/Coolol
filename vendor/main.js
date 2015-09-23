// Extend JavaScript
Array.prototype.reduce_from = function(init, func) {
  return this.reduce(func, init);
};
Array.prototype.remove = function(elem) {
  var index = this.indexOf(elem);
  if (index > -1) {
    this.splice(index, 1);
  }
};
String.prototype.toUnderScoreCase = function() {
  return this.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

