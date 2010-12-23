/**
 * Fires an HTML Event.
 */
function fire() {
    var $el, $type;
    // only one value passed, assume we are given the type and dispatch from the body.
    if( arguments.length == 1 ) {
        $el = document.body;
        $type = arguments[0];
    }
    // if two value are passed, assume we are given the element and type.
    if( arguments.length > 1 ) {
        $el = arguments[0];
        $type = arguments[1];
    }
    // dispatch for IE
    if( $el.fireEvent ) {
        $el.fireEvent($type);
    }
    // dispatch for Gecko
    if( document.createEvent ) {
        var evt = document.createEvent('HTMLEvents');
        if( evt.initEvent ) {
            evt.initEvent($type,true,true);
        }
        if( $el.dispatchEvent ) {
            $el.dispatchEvent(evt);
        }
    }
}




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