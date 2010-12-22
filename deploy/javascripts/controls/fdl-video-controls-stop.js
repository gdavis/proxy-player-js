var StopButton = Class.create( FControl, {
    initialize: function($super, $model, $controller, $container ) {
        $super( $model, $controller, $container );
    },

    build: function( $super ) {
        $super();
        $(this.element).addClass('fdl-stop');
    },

    setListeners: function() {
        $(this.element).click( this.controller.stop.context(this.controller) );
    }
});