//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/FVideoModel>

var StopButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'fdl-stop');
//    $(this.element).addClass('fdl-stop');
  },

  setListeners: function() {
    bind(this.element, 'click', this.controller.stop.context(this.controller));
  },

  destroy: function() {
    unbind(this.element, 'click', this.controller.stop.context(this.controller));
  }
});