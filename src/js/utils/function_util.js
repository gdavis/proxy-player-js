// Allows for binding context to functions
// when using in event listeners and timeouts
// ! From video.js
// Modified to maintain singular references to context-scoped methods so you can remove the listener later.
Function.prototype.contextMethods = {};
Function.prototype.context = function(obj){
  var method = this;
  if (Function.contextMethods[obj]) {
    return Function.contextMethods[obj];
  }
  else {
    var temp = function() {
      return method.apply(obj, arguments);
    };
    Function.contextMethods[obj] = temp;
    return temp;
  }
};