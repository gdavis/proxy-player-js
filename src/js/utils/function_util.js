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


function addEvent(element, type, handler) {
	if (element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		if (!handler.$$guid) handler.$$guid = addEvent.guid++;
		if (!element.events) element.events = {};
		var handlers = element.events[type];
		if (!handlers) {
			handlers = element.events[type] = {};
			if (element['on' + type]) handlers[0] = element['on' + type];
			element['on' + type] = handleEvent;
		}

		handlers[handler.$$guid] = handler;
	}
}

addEvent.guid = 1;

function removeEvent(element, type, handler) {
	if (element.removeEventListener) {
		element.removeEventListener(type, handler, false);
	} else if (element.events && element.events[type] && handler.$$guid) {
		delete element.events[type][handler.$$guid];
	}
}

function handleEvent(event) {
	event = event || fixEvent(window.event);
	var returnValue = true;
	var handlers = this.events[event.type];

	for (var i in handlers) {
		if (!Object.prototype[i]) {
			this.$$handler = handlers[i];
			if (this.$$handler(event) === false) returnValue = false;
		}
	}

	if (this.$$handler) this.$$handler = null;

	return returnValue;
}

function fixEvent(event) {
	event.preventDefault = fixEvent.preventDefault;
	event.stopPropagation = fixEvent.stopPropagation;
	return event;
}

fixEvent.preventDefault = function() {
	this.returnValue = false;
}

fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
}