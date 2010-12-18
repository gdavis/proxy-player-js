/**
 * Proxy which controlls an HTML video object.
 */
var HTMLVideoProxy = Class.create({
    initialize: function( $controller, $container, $video ) {
        this.controller = $controller;
        this.container = $container;
        this.video = $video;
        this.bufferInterval = false;
        this.init();
    },

    init: function() {
        this.addVideoListeners( this.video );
        this.addModelListeners();
    },

    // TODO: Refactor into FVideo
    addVideoSource: function( $path, $type ) {
        var source = document.createElement('source');
        source.src = $path;
        // don't add the 'type' attribute if we are in andriod.
        if( !FUserEnvironment.android && $type !== undefined ){ source.type = $type; }
        $( this.video).append(source);
    },

    load: function( $url ) {
        if( $url !== undefined ) this.video.src = $url;
        this.video.load();
    },

    play: function( $url ) {
        if( $url !== undefined ) this.video.src = $url;
        this.video.play();
    },

    pause: function() {
        this.video.pause();
    },

    stop: function() {
        this.video.pause();
        this.video.currentTime = 0;
    },

    seek: function( $time ) {
        this.video.currentTime = $time;
    },

    setWidth: function( $value ) {
        this.video.width = parseInt( $value );
    },

    setHeight: function( $value ) {
        this.video.height = parseInt( $value );
    },

    getVolume: function() { return this.video.volume },
    setVolume: function( $volume ) {
        this.video.volume = parseFloat( $volume );
    },

    getTime: function() {
        return this.video.currentTime;
    },

    isPlaying: function() {
        return !this.video.paused;
    },

    addVideoListeners: function( $video ) {
        var self = this;
        $video.addEventListener('metadata',function( $e ){ self.handleMetadata( $e ); },false);
        $video.addEventListener('loadstart',function( $e ){ self.handleLoadStart( $e ); },false);
        $video.addEventListener('loadeddata',function( $e ){ self.handleBuffering( $e ); },false);
        $video.addEventListener('waiting',function( $e ){ self.handleBuffering( $e ); },false);
        $video.addEventListener('error',function( $e ){ self.handleError( $e ); },false);
        $video.addEventListener('progress',function( $e ){ self.handleProgress( $e ); },false);
        $video.addEventListener('play',function( $e ){ self.handlePlay( $e ); },false);
        $video.addEventListener('pause',function( $e ){ self.handlePause( $e ); },false);
        $video.addEventListener('seeking',function( $e ){ self.handleSeek( $e ); },false);
        $video.addEventListener('ended',function( $e ){ self.handleEnd( $e ); },false);
        $video.addEventListener('volumechange',function( $e ){ self.handleVolume( $e ); },false);
        $video.addEventListener('timeupdate',function( $e ){ self.handleTimeUpdate( $e ); },false);
        $video.addEventListener('durationchange',function( $e ){ self.handleDurationChange( $e ); },false);
    },

    addModelListeners: function() {
        var self = this;
        $(this.container).bind(FVideoModel.EVENT_RESIZE, function(){ self.resize(); });
        $(this.container).bind(FVideoModel.EVENT_VOLUME_UPDATE, function(){ self.setVolume( self.controller.model.getVolume() ); });
    },

    resize: function() {
        this.video.width = parseInt( this.controller.model.getWidth());
        this.video.height = parseInt( this.controller.model.getHeight());
    },


    startBufferInterval: function() {
        var self = this;
        this.bufferInterval = setInterval(function() { self.handleProgress(); },10);
    },

    handleDurationChange: function( $e ) {
        this.controller._updateDuration( this.video.duration );
    },

    handleMetadata: function( $e ) {
    },

    handleError: function( $e ) {
        this.controller._updatePlayerState('error');
        // TODO: Add this back with certain error states
//        this.controller.fallback();
    },

    handleTimeUpdate: function( $e ) {
        this.controller._updatePlayheadTime( this.video.currentTime );
    },

    handleProgress: function( $e ) {
        // modern browsers that are up to spec
        if( this.video.buffered ) {
            if( this.video.buffered.length > 0 ) {
                this.controller._updateLoadProgress( this.video.buffered.end(0), this.video.duration );
                if (this.video.buffered.end(0) == this.video.duration) {
                  clearInterval(this.bufferInterval);
                }
            }
        }
        // check for FF versions that support the loaded/total event values
        else if( $e ) {
            if( $e.loaded && $e.total ) {
                this.controller._updateLoadProgress( $e.loaded, $e.total );
            }
        }
    },

    handleLoadStart: function( $e ) {
        this.controller._updatePlayerState('loading');
    },

    handleBuffering: function( $e ) {
        this.controller._updatePlayerState('buffering');
    },

    handlePlay: function( $e ) {
        this.startBufferInterval();
        this.controller._updateIsPlaying( true );
        this.controller._updatePlayerState('playing');
    },

    handlePause: function( $e ) {
        this.controller._updateIsPlaying( false );
        this.controller._updatePlayerState('paused');
    },

    handleSeek: function( $e ) {
        this.controller._updatePlayerState('seeking');
    },

    handleEnd: function( $e ) {
        this.controller._updateIsPlaying( false );
        this.controller._updatePlayerState('stopped');
    },

    handleVolume: function( $e ) {
        this.controller._updateVolume( this.video.volume );
    }
});
