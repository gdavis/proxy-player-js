// Allows for binding context to functions
// when using in event listeners and timeouts
// ! From video.js
// Modified to maintain singular references to context-scoped methods so you can remove the listener later.
Function.prototype.contextMethods = {};
Function.prototype.context = function(obj) {
  var method = this;
  if (Function.contextMethods[method] && Function.contextMethods[method][obj]) {
    return Function.contextMethods[method][obj];
  }
  else {
    var temp = function() {
      return method.apply(obj, arguments);
    };
    if (Function.contextMethods[method] === undefined) {
      Function.contextMethods[method] = {};
    }
    Function.contextMethods[method][obj] = temp;
    return temp;
  }
};