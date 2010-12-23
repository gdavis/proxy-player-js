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
//= require <controls/FControl>
//= require <video/core/FVideoModel>

var FControls = Class.create({
    initialize: function( $model, $controller, $container ) {
        this.model = $model;
        this.controller = $controller;
        this.container = $container;
        this.controls = [];
        if( arguments[3] !== undefined ) {
            var controls = arguments[3];
            var dl = controls.length;
            for(var i=0; i<dl;i++) {
                this.addControl(controls[i]);
            }
        }
        this.setListeners();
        this.position();
    },

    addControl: function( $controlClass ) {
        if(typeof $controlClass === 'string') {
            this.controls.push(new window[$controlClass](this.model, this.controller, this.container));
        }
        else if( typeof $controlClass === 'function' ) {
            this.controls.push(new $controlClass(this.model, this.controller, this.container));
        }
        else if( typeof $controlClass === 'object') {
            if( $controlClass.tagName !== undefined ) { // check for a node
                this.container.appendChild($controlClass);
                $($controlClass).addClass('fdl-control'); // make sure it has the proper class
                this.controls.push($controlClass);
            }
        }
    },

    setListeners: function() {
        $(this.model.dispatcher).bind(FVideoModel.EVENT_RESIZE, this.position.context(this) );
    },

    position: function() {
        var dl = this.controls.length,
            flexibles = [],
            sum = 0,
            i;
        for(i=0; i<dl;i++) {
            var control = this.controls[i];
            var el = ( control.tagName !== undefined ) ? control : control.element;
            if( $(el).hasClass('fdl-control-flexible')) {
                flexibles.push(el);
            }
            // ignore absolutely positioned elements
            else if( !$(el).hasClass('fdl-control-absolute')) {
                sum += el.offsetWidth;
            }
        }
        dl = flexibles.length;
        var wv = ( this.model.getWidth() - sum ) / dl;
        for(i=0; i<dl;i++) {
            var flexi = flexibles[i];
            $(flexi).width(wv);
        }
    }
});