//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <video/core/FVideoModel>

var PlayPauseButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass(this.element, 'fdl-play-pause');
//    $(this.element).addClass('fdl-play-pause');
  },

  setListeners: function() {
    bind(this.element, 'click', this.handleClick.context(this));
  },

  destroy: function() {
    unbind(this.element, 'click', this.handleClick.context(this));
  },

  handleClick: function() {
    if (this.model.getPlaying()) {
      this.controller.pause();
    }
    else {
      this.controller.play();
    }
  }
});