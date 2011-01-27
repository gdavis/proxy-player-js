//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <video/core/FVideoModel>

var PlayPauseButton = Class.create( FControl, {
    initialize: function($super, $model, $controller, $container ) {
        $super( $model, $controller, $container );
    },

    build: function( $super ) {
        $super();
        $(this.element).addClass('fdl-play-pause');
    },

    setListeners: function() {
        $(this.element).click( this.handleClick.context(this) );
    },

    destroy: function() {
      $(this.element).unbind( 'click', this.handleClick.context(this));
    },

    handleClick: function() {
        if( this.model.getPlaying() ) {
            this.controller.pause();
        }
        else {
            this.controller.play();
        }
    }
});