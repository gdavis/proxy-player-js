//= require <controls/FControl>
//= require <utils/function_util>
//= require <utils/dom_util>
//= require <utils/mouse_util>
//= require <video/core/FVideoModel>

var ProgressBar = Class.create( FControl, {

    initialize: function($super, $model, $controller, $container) {
        $super( $model, $controller, $container );
    },
    
    build: function( $super ) {
        $super();

        // configure main element with the proper classes
        $(this.element).addClass('fdl-control-flexible fdl-progress-bar');

        // create download bar
        this.downloadBar = DOMUtil.createElement('div', { className:"fdl-load-progress"}, this.element );

        // create play progress bar
        this.progressBar = DOMUtil.createElement('div', { className:"fdl-play-progress"}, this.element );

        // create a handle
        this.handle = DOMUtil.createElement('div', { className:"fdl-handle"}, this.element );
    },

    setListeners: function() {
        $( this.element ).mousedown( this.handleMouseDown.context( this ) );
        $( this.controller.container ).bind('resize', this.update.context( this ) );
        $( this.model.dispatcher ).bind(FVideoModel.EVENT_LOAD_PROGRESS, this.update.context(this) );
        $( this.model.dispatcher ).bind(FVideoModel.EVENT_TIME_UPDATE, this.update.context(this) );
    },

    update: function() {
        var dw;

        // update download progress
        dw = ( this.model.getBytesLoaded() / this.model.getBytesTotal() ) * this.element.offsetWidth;
        $(this.downloadBar).css({width:dw + "px" });

        // update playhead progress
        dw = ( this.model.getTime() / this.model.getDuration() ) * this.element.offsetWidth;
        $(this.progressBar).css({width:dw + "px" });
    },

    destroy: function() {
      $( this.element ).unbind( 'mousedown', this.handleMouseDown.context( this ) );
      $( this.controller.container ).unbind('resize', this.update.context( this ) );
      $( this.model.dispatcher ).unbind(FVideoModel.EVENT_LOAD_PROGRESS, this.update.context(this) );
      $( this.model.dispatcher ).unbind(FVideoModel.EVENT_TIME_UPDATE, this.update.context(this) );
      $( this.container ).unbind('mousemove');
      $( document ).unbind('mouseup');
    },

    handleMouseDown: function( $e ) {
        $( this.container ).mousemove( this.handleMouseMove.context(this) );
        $( document ).mouseup( this.handleMouseUp.context(this) );
    },

    handleMouseMove: function( $e ) {
        var dx = MouseUtil.getRelativeXFromEvent( $e, this.element );
        this.handle.style.left = dx + "px";
        var clickedTime = (dx / parseInt( this.element.offsetWidth )) * this.model.getDuration();
        this.controller.seek( clickedTime );
    },

    handleMouseUp: function( $e ) {
        // do the update
        this.handleMouseMove( $e );

        // remove listener
        $( this.container ).unbind('mousemove');
        $( document ).unbind('mouseup');
    }

});