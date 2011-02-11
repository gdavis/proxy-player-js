//= require <utils/Class>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>
//= require <controls/FControl>

var FullscreenButton = Class.create(FControl, {
  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.origWidth = this.model.getWidth();
    this.origHeight = this.model.getHeight();
    this.origPosition = false;
    this.getViewportSize();
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'fdl-fullscreen');
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'click', this.toggleFullscreen.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.TOGGLE_FULLSCREEN, this.handleFullscreen.context(this));
  },

  destroy: function( $super ) {
    EventUtil.unbind( window, 'resize', this.size.context(this));
    EventUtil.unbind(this.element, 'click', this.toggleFullscreen.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.TOGGLE_FULLSCREEN, this.handleFullscreen.context(this));
    $super();
  },

  handleFullscreen: function() {
    if (this.model.getFullscreen()) {
      this.enterFullscreen();
    }
    else {
      this.exitFullscreen();
    }
  },

  toggleFullscreen: function() {
    this.controller.setFullscreen(!this.model.getFullscreen());
  },

  size: function() {
    this.getViewportSize();
    this.controller.setSize(this.viewportWidth, this.viewportHeight);
  },

  enterFullscreen: function() {
    this.size();
    EventUtil.bind(window, 'resize', this.size.context(this));
    DOMUtil.addClass(this.controller.container, 'fdl-fullscreen');
  },

  exitFullscreen: function() {
    EventUtil.unbind( window, 'resize', this.size.context(this));
    this.controller.setSize(this.origWidth, this.origHeight);
    DOMUtil.removeClass(this.controller.container, 'fdl-fullscreen');
  },

  getViewportSize: function() {
    // viewport code modified from: http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
      this.viewportWidth = window.innerWidth;
      this.viewportHeight = window.innerHeight;
    }
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
      && typeof document.documentElement.clientWidth != 'undefined'
      && document.documentElement.clientWidth != 0) {
      this.viewportWidth = document.documentElement.clientWidth;
      this.viewportHeight = document.documentElement.clientHeight;
    }
    // older versions of IE
    else {
      this.viewportWidth = document.getElementsByTagName('body')[0].clientWidth;
      this.viewportHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
  }

});

