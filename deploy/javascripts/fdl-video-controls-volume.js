var FVolume = function( $container, $video, $numBars, $barWidth, $maxBarHeight ) {
    this.container = $container;
    this.video = $video;
    this.wrapper = false;
    this.progressBar = false;
    this.numBars = $numBars || 7;
    this.barWidth = $barWidth || 3;
    this.maxBarHeight = $maxBarHeight || 15;
    this.build();
    this.addModelListeners();
};

FVolume.prototype = {

    build: function() {
        var self = this;
        this.wrapper = FVideo.createElement('div', { className:'fdl-volume-wrapper' }, this.container );
        $(this.wrapper).mousedown(function( $e ){ self.handleMouseDown( $e ); });

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
            else $(child).removeClass('on');
        }
    },

    handleMouseDown: function( $e ) {
        var self = this;
        $( this.wrapper ).mousemove(function( $e ){ self.handleMouseMove( $e ); });
        $( document ).mouseup(function( $e ){ self.handleMouseUp( $e ); });
    },

    handleMouseMove: function( $e ) {
        var vol = $e.layerX / this.wrapper.offsetWidth;
        this.video._updateVolume( vol );
    },

    handleMouseUp: function( $e ) {
        // do the update
        this.handleMouseMove( $e );
        // remove listener
        $( this.wrapper ).unbind('mousemove');
        $( document ).unbind('mouseup');
    }

};