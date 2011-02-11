//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>

var PlayPauseButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass(this.element, 'fdl-play-pause');
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'click', this.handleClick.context(this));
  },

  destroy: function() {
    EventUtil.unbind(this.element, 'click', this.handleClick.context(this));
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