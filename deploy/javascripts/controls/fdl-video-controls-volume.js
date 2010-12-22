var VolumeControl = Class.create( FControl, {
    
    initialize: function($super, $model, $controller, $container/*, $numBars, $barWidth, $maxBarHeight*/ ) {
        this.wrapper = false;
        this.progressBar = false;
        this.numBars = 7;
        this.barWidth = 3;
        this.maxBarHeight = 15;
        this.lastMouseX = 0;
        $super( $model, $controller, $container );
    },

    build: function( $super ) {
        $super();
        $(this.element).addClass('fdl-volume');
        this.wrapper = DOMUtil.createElement('div', { className:'fdl-volume-wrapper' }, this.element );
        $(this.element).mousedown( this.handleMouseDown.context(this) );

        // create volume bars
        for(var i = 0; i < this.numBars; i++ ) {
            var hv = Math.ceil( i / this.numBars * this.maxBarHeight );
            var yp = this.maxBarHeight - hv;
            var el = DOMUtil.createElement('div', {}, this.wrapper );
            el.style.marginTop = yp + 'px';
            el.style.width = this.barWidth + 'px';
            el.style.height = hv + 'px';
        }
    },

    setListeners: function() {
        var self = this;
        $( this.model.dispatcher ).bind(FVideoModel.EVENT_VOLUME_UPDATE, this.update.context(this) );
    },

    update: function() {
        var dl = this.wrapper.children.length;
        var maxOnIndex = Math.round( this.model.getVolume() * dl);
        for( var i=0; i<dl; i++ ) {
            var child = this.wrapper.children[ i ];
            if( i <= maxOnIndex ) {
                $(child).addClass('on');
            }
            else{ $(child).removeClass('on');}
        }
    },

    handleMouseDown: function( $e ) {
        $( this.element ).mousemove( this.handleMouseMove.context(this) );
        $( document ).mouseup( this.handleMouseUp.context(this) );
        this.handleMouseMove($e);
    },

    handleMouseMove: function( $e ) {
        var dx = MouseUtil.getRelativeXFromEvent( $e, this.element );
        this.lastMouseX = dx;
        var vol = dx / this.wrapper.offsetWidth;
        this.controller._updateVolume( vol );
    },

    handleMouseUp: function( $e ) {
        // do the update
        var vol = this.lastMouseX / this.wrapper.offsetWidth;
        this.controller._updateVolume( vol );

        // remove listener
        $( this.element ).unbind('mousemove');
        $( document ).unbind('mouseup');
    }
});