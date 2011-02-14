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
  initialize: function($model, $controller, $container, $controls, $overlays ) {
    this.model = $model;
    this.controller = $controller;
    this.container = $container;
    this.controls = [];
    this.overlays = [];

    // create containers for overlays and the control bar
    this.overlayContainer = DOMUtil.createElement( 'div', { className:'fdl-overlays' }, this.container );
    this.controlBar = DOMUtil.createElement( 'div', { className:'fdl-control-bar' }, this.container );

    // disable dragging and highlighting of elements
    this.container.onmousedown = function() { return false; };
    this.container.onselectstart = function() { return false; };

    // under android, we cannot use custom controls so we just bind the video container's click event to start playback
    if( EnvironmentUtil.android ) {
      EventUtil.bind( this.controller.container, 'click', this.controller.play.context(this.controller));
    }
    
    // build control bar
    var i, dl = $controls.length;
    for (i = 0; i < dl; i++) {
      var control = this.createControl($controls[i], this.controlBar );
      if( control ) {
        DOMUtil.addClass( control.element, 'fdl-control');
        this.controls.push(control);
      }
    }
    // build overlays
    dl = $overlays.length;
    for (i = 0; i < dl; i++) {
      var overlay = this.createControl($overlays[i], this.overlayContainer );
      if( overlay ) {
        DOMUtil.addClass( overlay.element, 'fdl-overlay');
        this.overlays.push(overlay);
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
    for (i = 0; i < dl; i++) {
      var overlay = this.overlays[i];
      if (typeof overlay == 'function') {
        overlay.destroy();
      }
    }
  },

  createControl: function($controlClass, $container ) {
    var control = this.constructControl( $controlClass, $container );
    if( control.canSupportPlatform()) {
      control.build();
      control.setListeners();
      control.update();
      return control;
    }
    delete control;
    return false;
  },

  constructControl: function($klass, $container ) {
    var obj;
    if (typeof $klass === 'string') {
      obj = new window[$klass](this.model, this.controller, $container);
    }
    else if (typeof $klass === 'function') {
      obj = new $klass(this.model, this.controller, $container);
    }
    return obj;
  },

  setListeners: function() {
    EventUtil.bind(this.model.dispatcher, FVideoEvent.RESIZE, this.position.context(this));
  },

  position: function() {
    var el,
      dl = this.controls.length,
      flexibles = [],
      sum = 0,
      i;
    for (i = 0; i < dl; i++) {
      var control = this.controls[i];
      el = ( control.tagName !== undefined ) ? control : control.element;
      if (DOMUtil.hasClass(el, 'fdl-control-flexible')) {
        flexibles.push(el);
      }
      else {
        sum += el.offsetWidth;
      }
    }
    dl = flexibles.length;
    var wv = ( this.model.getWidth() - sum ) / dl;
    for (i = 0; i < dl; i++) {
      var flexi = flexibles[i];
      flexi.style.width = wv + 'px';
    }

    // size overlays to match player size.
    dl = this.overlays.length;
    for (i = 0; i < dl; i++) {
      var overlay = this.overlays[i];
      el = ( overlay.tagName !== undefined ) ? overlay : overlay.element;
      el.style.width = this.model.getWidth() + 'px';
      el.style.height = this.model.getHeight() + 'px';
    }
  }
});