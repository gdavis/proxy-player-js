//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/FVideoModel>

var VolumeControl = Class.create(FControl, {

  initialize: function($super, $model, $controller, $container) {
    this.wrapper = false;
    this.progressBar = false;
    this.numBars = 7;
    this.barWidth = 3;
    this.maxBarHeight = 15;
    this.lastMouseX = 0;
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'fdl-volume');

    this.wrapper = DOMUtil.createElement('div', { className:'fdl-volume-wrapper' }, this.element);

    // create volume bars
    for (var i = 0; i < this.numBars; i++) {
      var hv = Math.ceil(i / this.numBars * this.maxBarHeight);
      var yp = this.maxBarHeight - hv;
      var el = DOMUtil.createElement('div', {}, this.wrapper);
      el.style.marginTop = yp + 'px';
      el.style.width = this.barWidth + 'px';
      el.style.height = hv + 'px';
    }

    // update UI to match model.
    this.update();
  },

  setListeners: function() {
    EventUtil.bind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.VOLUME_UPDATE, this.update.context(this));
  },

  update: function() {
    var dl = this.wrapper.children.length;
    var maxOnIndex = Math.round(this.model.getVolume() * dl);
    for (var i = 0; i < dl; i++) {
      var child = this.wrapper.children[ i ];
      if (i <= maxOnIndex) {
        DOMUtil.addClass( child, 'on');
      }
      else {
        DOMUtil.removeClass( child, 'on');
      }
    }
  },

  destroy: function() {
    EventUtil.unbind(this.element, 'mousedown', this.handleMouseDown.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.VOLUME_UPDATE, this.update.context(this));
    EventUtil.unbind(this.element, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.unbind(document, 'mouseup', this.handleMouseUp.context(this));
  },

  handleMouseDown: function($e) {
    EventUtil.bind(this.element, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.bind(document, 'mouseup', this.handleMouseUp.context(this));
    this.handleMouseMove($e);
  },

  handleMouseMove: function($e) {
    var dx = MouseUtil.getRelativeXFromEvent($e, this.element);
    this.lastMouseX = dx;
    var vol = dx / this.wrapper.offsetWidth;
    this.controller._updateVolume(vol);
  },

  handleMouseUp: function($e) {
    // do the update
    var vol = this.lastMouseX / this.wrapper.offsetWidth;
    this.controller._updateVolume(vol);

    // remove listener
    EventUtil.unbind(this.element, 'mousemove', this.handleMouseMove.context(this));
    EventUtil.unbind(document, 'mouseup', this.handleMouseUp.context(this));
  }
});