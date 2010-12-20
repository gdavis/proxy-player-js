/**
 * Proxy which controlls an HTML video object.
 */
var HTMLVideoProxy = Class.create({
    initialize: function( $model, $controller, $video ) {
        this.model = $model;
        this.controller = $controller;
        this.video = $video;
        this.bufferInterval = false;
        this.setListeners( this.video );
    },

    // TODO: Refactor into FVideo
    addVideoSource: function( $path, $type ) {
        var source = document.createElement('source');
        source.src = $path;
        // don't add the 'type' attribute if we are in andriod.
        if( !FEnvironment.android && $type !== undefined ){ source.type = $type; }
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

    setListeners: function() {
        this.video.addEventListener('metadata',         this.handleMetadata.context(this),      false);
        this.video.addEventListener('loadstart',        this.handleLoadStart.context(this),     false);
        this.video.addEventListener('loadeddata',       this.handleBuffering.context(this),     false);
        this.video.addEventListener('waiting',          this.handleBuffering.context(this),     false);
        this.video.addEventListener('error',            this.handleError.context(this),         false);
        this.video.addEventListener('progress',         this.handleProgress.context(this),      false);
        this.video.addEventListener('play',             this.handlePlay.context(this),          false);
        this.video.addEventListener('playing',          this.handlePlay.context(this),          false);
        this.video.addEventListener('pause',            this.handlePause.context(this),         false);
        this.video.addEventListener('seeking',          this.handleSeek.context(this),          false);
        this.video.addEventListener('seeked',           this.handleSeeked.context(this),          false);
        this.video.addEventListener('ended',            this.handleEnd.context(this),           false);
        this.video.addEventListener('volumechange',     this.handleVolume.context(this),        false);
        this.video.addEventListener('timeupdate',       this.handleTimeUpdate.context(this),    false);
        this.video.addEventListener('durationchange',   this.handleDurationChange.context(this), false);

        $(this.model.dispatcher).bind(FVideoModel.EVENT_RESIZE, this.resize.context(this) );
        $(this.model.dispatcher).bind(FVideoModel.EVENT_VOLUME_UPDATE, function(){ this.setVolume( this.model.getVolume()); }.context(this) );
    },

    resize: function() {
        this.video.width = parseInt( this.model.getWidth() );
        this.video.height = parseInt( this.model.getHeight() );
    },

    startBufferInterval: function() {
        this.bufferInterval = setInterval( this.handleProgress.context(this),10);
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
        if( this.video.currentTime == 0 && this.video.paused ) {
            this.controller._updatePlayerState('stopped');
        }
        else {
            this.controller._updatePlayerState('paused');
        }
    },

    handleSeek: function( $e ) {
        this.controller._updateIsPlaying( false );
        this.controller._updatePlayerState('seeking');
    },

    handleSeeked: function( $e ) {
        // return to previous state after seeking, either playing or paused.
        if( this.video.paused ) {
            this.handlePause();
        }
        else {
            this.handlePlay();
        }
    },

    handleEnd: function( $e ) {
        this.controller._updateIsPlaying( false );
        this.controller._updatePlayerState('stopped');
    },

    handleVolume: function( $e ) {
        this.controller._updateVolume( this.video.volume );
    }
});
