//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/event_util>

var StartVideoButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super( $model, $controller, $container );
  },

  build: function($super) {
    $super();
    DOMUtil.addClass(this.element, 'fdl-start-video');

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

  handleClick: function( $e ) {
    this.controller.play();
  }
});