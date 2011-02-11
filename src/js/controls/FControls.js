//  method 1:
//  var controls = new FControls( modelInstance, controllerInstance, HTMLContainer, [ PlayPauseButton, StopButton, ProgressBar, VolumeControl, FullscreenButton ]);
//
//  method 2:
//  var controls = new FControls( fVideoInstance );
//  controls.addControl( PlayPauseButton );
//  controls.addControl( StopButton );
//  ...
//  controls.position();
//
//
//  method 3:
//  <video data-controls="PlayPauseButton,StopButton,ProgressBar,VolumeControl,FullscreenButton"></video>


//= require <utils/Class>
//= require <utils/function_util>
//= require <utils/event_util>
//= require <controls/FControl>
//= require <video/core/FVideoModel>

var FControls = Class.create({
  initialize: function($model, $controller, $container) {
    this.model = $model;
    this.controller = $controller;
    this.container = $container;
    this.controls = [];

    // disable dragging and highlighting of elements
    this.container.onmousedown = function() { return false; };
    this.container.onselectstart = function() { return false; };

    // under android, we cannot use custom controls so we just bind the video container's click event to start playback
    if( EnvironmentUtil.android ) {
      EventUtil.bind( this.controller.container, 'click', this.controller.play.context(this.controller));
    }
    // otherwise, go ahead and build controls.
    else {
      if (arguments[3] !== undefined) {
        var controls = arguments[3];
        var dl = controls.length;
        for (var i = 0; i < dl; i++) {
          this.addControl(controls[i]);
        }
      }
    }
    this.setListeners();
    this.position();
  },

  destroy: function() {
    if( EnvironmentUtil.android || (EnvironmentUtil.iPad && EnvironmentUtil.iOS_3 )) {
      EventUtil.unbind( this.controller.container, 'click', this.controller.play.context(this.controller));
    }
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.RESIZE, this.position.context(this));
    var i, dl = this.controls.length;
    for (i = 0; i < dl; i++) {
      var control = this.controls[i];
      if (typeof control == 'function') {
        control.destroy();
      }
    }
  },

  addControl: function($controlClass) {
    var control;
    if (typeof $controlClass === 'string') {
      control = new window[$controlClass](this.model, this.controller, this.container);
      if( control.canSupportPlatform()) this.controls.push(control);
      else control.destroy();
    }
    else if (typeof $controlClass === 'function') {
      control = new $controlClass(this.model, this.controller, this.container);
      if( control.canSupportPlatform()) this.controls.push(control);
      else control.destroy();
    }
//    else if (typeof $controlClass === 'object') {
//      if ($controlClass.tagName !== undefined) { // check for a node
//        this.container.appendChild($controlClass);
//        DOMUtil.addClass($controlClass, 'fdl-control');
//        this.controls.push($controlClass);
//      }
//    }
  },

  setListeners: function() {
    EventUtil.bind(this.model.dispatcher, FVideoEvent.RESIZE, this.position.context(this));
  },

  position: function() {
    var dl = this.controls.length,
      flexibles = [],
      sum = 0,
      i;
    for (i = 0; i < dl; i++) {
      var control = this.controls[i];
      var el = ( control.tagName !== undefined ) ? control : control.element;
      if (DOMUtil.hasClass(el, 'fdl-control-flexible')) {
        flexibles.push(el);
      }
      // ignore absolutely positioned elements
      else if (!DOMUtil.hasClass( el, 'fdl-control-absolute')) {
        sum += el.offsetWidth;
      }
    }
    dl = flexibles.length;
    var wv = ( this.model.getWidth() - sum ) / dl;
    for (i = 0; i < dl; i++) {
      var flexi = flexibles[i];
      flexi.style.width = wv + 'px';
    }
  }
});