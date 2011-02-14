//= require <controls/FControl>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <utils/dom_util>
//= require <utils/mouse_util>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>

var ProgressBar = Class.create(FControl, {

  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  resizeType: function() {
    return FControl.TYPE_FLEXIBLE;
  },

  build: function($super) {
    $super();

    // configure main element with the proper classes
    DOMUtil.addClass( this.element, 'fdl-progress-bar');

    // create download bar
    this.downloadBar = DOMUtil.createElement('div', { className:"fdl-load-progress"}, this.element);

    // create play progress bar
    this.progressBar = DOMUtil.createElement('div', { className:"fdl-play-progress"}, this.element);

    // create a handle
    this.handle = DOMUtil.createElement('div', { className:"fdl-handle"}, this.element);
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.bind(this.controller.container, 'resize', this.update.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.LOAD_PROGRESS, this.update.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.TIME_UPDATE, this.update.context(this));
  },

  update: function() {
    var dw;

    // update download progress
    dw = ( this.model.getBytesLoaded() / this.model.getBytesTotal() ) * this.element.offsetWidth;
    if(!isNaN(dw)) this.downloadBar.style.width = dw + "px";

    // update playhead progress
    dw = ( this.model.getTime() / this.model.getDuration() ) * this.element.offsetWidth;
    if(!isNaN(dw)) this.progressBar.style.width = dw + "px";
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.unbind(this.controller.container, 'resize', this.update.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.LOAD_PROGRESS, this.update.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.TIME_UPDATE, this.update.context(this));
    EventUtil.unbind(this.container, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.unbind(document, 'mouseup', this.handleMouseUp.context(this));
    $super();
  },

  handleMouseDown: function($e) {
    EventUtil.bind(this.container, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.bind(document, 'mouseup', this.handleMouseUp.context(this));
  },

  handleMouseMove: function($e) {
    var dx = MouseUtil.getRelativeXFromEvent($e, this.element);
    this.handle.style.left = dx + "px";
    if(this.model.getDuration() > 0) {
      var clickedTime = (dx / parseInt(this.element.offsetWidth)) * this.model.getDuration();
      this.controller.seek(clickedTime);
    }
  },

  handleMouseUp: function($e) {
    // do the update
    this.handleMouseMove($e);

    // remove listeners
    EventUtil.unbind(this.container, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.unbind(document, 'mouseup', this.handleMouseUp.context(this));
  }

});