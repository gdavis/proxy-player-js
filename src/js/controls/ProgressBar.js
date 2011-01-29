//= require <controls/FControl>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <utils/dom_util>
//= require <utils/mouse_util>
//= require <video/core/FVideoModel>

var ProgressBar = Class.create(FControl, {

  initialize: function($super, $model, $controller, $container) {
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();

    // configure main element with the proper classes
    DOMUtil.addClass( this.element, 'fdl-control-flexible fdl-progress-bar');
//    $(this.element).addClass('fdl-control-flexible fdl-progress-bar');

    // create download bar
    this.downloadBar = DOMUtil.createElement('div', { className:"fdl-load-progress"}, this.element);

    // create play progress bar
    this.progressBar = DOMUtil.createElement('div', { className:"fdl-play-progress"}, this.element);

    // create a handle
    this.handle = DOMUtil.createElement('div', { className:"fdl-handle"}, this.element);
  },

  setListeners: function() {
    bind(this.element, 'mousedown', this.handleMouseDown.context(this));
    bind(this.controller.container, 'resize', this.update.context(this));
    bind(this.model.dispatcher, FVideoModel.EVENT_LOAD_PROGRESS, this.update.context(this));
    bind(this.model.dispatcher, FVideoModel.EVENT_TIME_UPDATE, this.update.context(this));
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

  destroy: function() {
    unbind(this.element, 'mousedown', this.handleMouseDown.context(this));
    unbind(this.controller.container, 'resize', this.update.context(this));
    unbind(this.model.dispatcher, FVideoModel.EVENT_LOAD_PROGRESS, this.update.context(this));
    unbind(this.model.dispatcher, FVideoModel.EVENT_TIME_UPDATE, this.update.context(this));
    unbind(this.container, 'mousemove', this.handleMouseMove.context(this));
    unbind(document, 'mouseup', this.handleMouseUp.context(this));
  },

  handleMouseDown: function($e) {
    bind(this.container, 'mousemove', this.handleMouseMove.context(this));
    bind(document, 'mouseup', this.handleMouseUp.context(this));
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
    unbind(this.container, 'mousemove', this.handleMouseMove.context(this));
    unbind(document, 'mouseup', this.handleMouseUp.context(this));
  }

});