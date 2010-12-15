var FVolume = Class.create({
    
    initialize: function( $container, $video, $numBars, $barWidth, $maxBarHeight ) {
        this.container = $container;
        this.video = $video;
        this.wrapper = false;
        this.progressBar = false;
        this.numBars = $numBars || 7;
        this.barWidth = $barWidth || 3;
        this.maxBarHeight = $maxBarHeight || 15;
        this.lastMouseX = 0;
        this.build();
        this.addModelListeners();
    },

    build: function() {
        var self = this;
        this.wrapper = FVideo.createElement('div', { className:'fdl-volume-wrapper' }, this.container );
        $(this.container).mousedown(function( $e ){ self.handleMouseDown( $e ); });

        // create volume bars
        for(var i = 0; i < this.numBars; i++ ) {
            var hv = Math.ceil( i / this.numBars * this.maxBarHeight );
            var yp = this.maxBarHeight - hv;
            var el = FVideo.createElement('div', {}, this.wrapper );
            el.style.marginTop = yp + 'px';
            el.style.width = this.barWidth + 'px';
            el.style.height = hv + 'px';
        }
    },

    addModelListeners: function() {
        var self = this;
        $( this.video.container ).bind(FVideoModel.EVENT_VOLUME_UPDATE, function( $e ){ self.handleVolumeUpdate( $e ); });
    },

    handleVolumeUpdate: function( $e ) {
        var dl = this.wrapper.children.length;
        var maxOnIndex = Math.round( this.video.model.getVolume() * dl);
        for( var i=0; i<dl; i++ ) {
            var child = this.wrapper.children[ i ];
            if( i <= maxOnIndex ) {
                $(child).addClass('on');
            }
            else{ $(child).removeClass('on');}
        }
    },

    handleMouseDown: function( $e ) {
        var self = this;
        $( this.container ).mousemove(function( $e ){ self.handleMouseMove( $e ); });
        $( document ).mouseup(function( $e ){ self.handleMouseUp( $e ); });
        this.handleMouseMove($e);
    },

    handleMouseMove: function( $e ) {

//        console.log('move! x: ' + $e.layerX + ", y: " + $e.layerY );
//        console.log('offsetWidth: ' + this.container.offsetWidth + ", offsetHeight: " + this.container.offsetHeight );

        var dx = FVideo.getEventPosition( $e, this.container );
        this.lastMouseX = dx;
        var vol = dx / this.wrapper.offsetWidth;
        this.video._updateVolume( vol );
    },

    handleMouseUp: function( $e ) {
        // do the update
        var vol = this.lastMouseX / this.wrapper.offsetWidth;
        this.video._updateVolume( vol );

        // remove listener
        $( this.container ).unbind('mousemove');
        $( document ).unbind('mouseup');
    }
});