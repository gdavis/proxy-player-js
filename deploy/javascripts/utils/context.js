// Allows for binding context to functions
// when using in event listeners and timeouts
// ! From video.js
Function.prototype.context = function(obj){
  var method = this,
  temp = function(){
    return method.apply(obj, arguments);
  };
  return temp;
};