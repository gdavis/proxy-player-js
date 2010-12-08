var FProgressBar = function( $container, $video ) {
    this.container = $container;
    this.video = $video;
    this.downloadBar = false;
    this.progressBar = false;
    this.build();
    this.addModelListeners();
};

FProgressBar.prototype = {

    build: function() {
        var self = this;

        $( this.container ).mousedown(function( $e ){ self.handleMouseDown( $e ); });
        $( this.video.container ).bind('resize',function( $e ){ self.handleLoadProgress( $e ); self.handlePlayheadUpdate( $e ); });

        // create download bar
        this.downloadBar = FVideo.createElement('div', { className:"fdl-load-progress"}, this.container );

        // create play progress bar
        this.progressBar = FVideo.createElement('div', { className:"fdl-play-progress"}, this.container );

        // create a handle
        this.handle = FVideo.createElement('div', { className:"fdl-handle"}, this.container );
    },

    addModelListeners: function() {
        var self = this;
        $( this.video.container ).bind(FVideoModel.EVENT_LOAD_PROGRESS, function( $e ){ self.handleLoadProgress( $e ); });
        $( this.video.container ).bind(FVideoModel.EVENT_TIME_UPDATE, function( $e ){ self.handlePlayheadUpdate( $e ); });
    },

    handleMouseDown: function( $e ) {
        var self = this;
        $( this.container ).mousemove(function( $e ){ self.handleMouseMove( $e ); });
        $( document ).mouseup(function( $e ){ self.handleMouseUp( $e ); });
    },

    handleMouseMove: function( $e ) {
        // loop through the children of the contols container, add up the width
        // and subtract from the clientX value to get the relative method.
        var dx = FVideo.getEventPosition( $e, this.container );
        this.handle.style.left = dx + "px";
        var clickedTime = (dx / parseInt( this.container.offsetWidth )) * this.video.model.getDuration();
        this.video.seek( clickedTime );
    },

    handleMouseUp: function( $e ) {
        // do the update
        this.handleMouseMove( $e );
        
        // remove listener
        $( this.container ).unbind('mousemove');
        $( document ).unbind('mouseup');
    },

    handleLoadProgress: function( $e ) {
        var dw = ( this.video.model.getBytesLoaded() / this.video.model.getBytesTotal() ) * this.container.offsetWidth;
        this.downloadBar.setAttribute('style','width:' + dw + "px" );
    },

    handlePlayheadUpdate: function( $e ) {
        var dw = ( this.video.model.getTime() / this.video.model.getDuration() ) * this.container.offsetWidth;
        this.progressBar.setAttribute('style','width:' + dw + "px" );
    }
};