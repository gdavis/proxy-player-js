//= require <controls/PPControl>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <utils/dom_util>
//= require <utils/mouse_util>
//= require <video/core/PPVideoModel>
//= require <video/core/PPVideoEvent>

var PPProgressBar = Class.create(PPControl, {

  resizeType: function() {
    return PPControl.TYPE_FLEXIBLE;
  },

  build: function($super) {
    $super();

    // configure main element with the proper classes
    DOMUtil.addClass( this.element, 'pp-progress-bar');

    // create download bar
    this.downloadBar = DOMUtil.createElement('div', { className:"pp-load-progress"}, this.element);

    // create play progress bar
    this.PPProgressBar = DOMUtil.createElement('div', { className:"pp-play-progress"}, this.element);

    // create a handle
    this.handle = DOMUtil.createElement('div', { className:"pp-handle"}, this.element);
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.bind(this.controller.container, 'resize', this.update.context(this));
    EventUtil.bind(this.model.dispatcher, PPVideoEvent.LOAD_PROGRESS, this.update.context(this));
    EventUtil.bind(this.model.dispatcher, PPVideoEvent.TIME_UPDATE, this.update.context(this));
  },

  update: function() {
    var dw;

    // update download progress
    dw = ( this.model.getBytesLoaded() / this.model.getBytesTotal() ) * this.element.offsetWidth;
    if(!isNaN(dw)) this.downloadBar.style.width = dw + "px";

    // update playhead progress
    dw = ( this.model.getTime() / this.model.getDuration() ) * this.element.offsetWidth;
    if(!isNaN(dw)) this.PPProgressBar.style.width = dw + "px";
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.unbind(this.controller.container, 'resize', this.update.context(this));
    EventUtil.unbind(this.model.dispatcher, PPVideoEvent.LOAD_PROGRESS, this.update.context(this));
    EventUtil.unbind(this.model.dispatcher, PPVideoEvent.TIME_UPDATE, this.update.context(this));
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