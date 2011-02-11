//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>

var StopButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'fdl-stop');
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'click', this.controller.stop.context(this.controller));
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.element, 'click', this.controller.stop.context(this.controller));
    $super();
  }
});