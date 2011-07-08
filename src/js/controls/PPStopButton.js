//= require <controls/PPControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/PPVideoModel>
//= require <video/core/PPVideoEvent>

var PPStopButton = Class.create(PPControl, {
  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'pp-stop');
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'click', this.controller.stop.context(this.controller));
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.element, 'click', this.controller.stop.context(this.controller));
    $super();
  }
});