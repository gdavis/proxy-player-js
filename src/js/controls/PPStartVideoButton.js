//= require <controls/PPControl>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/event_util>

var PPStartVideoButton = Class.create(PPControl, {
  build: function($super) {
    $super();
    DOMUtil.addClass(this.element, 'pp-start-video');

    // create centered button
    DOMUtil.createElement( 'div', { className:'button' }, this.element );
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'click', this.handleClick.context(this));
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.element, 'click', this.handleClick.context(this));
    $super();
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