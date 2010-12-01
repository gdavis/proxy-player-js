/**
 * Proxy which controlls an HTML video object.
 */
var HTMLVideoProxy = function( $controller, $container, $video ) {
    this.controller = $controller;
    this.container = $container;
    this.video = $video;
    this.init();
};

HTMLVideoProxy.prototype = {

    init: function() {
        this.addVideoListeners( this.video );
        this.addModelListeners();
    },

    addVideoSource: function( $path, $type ) {
        var source = document.createElement('source');
        source.src = $path;
        source.type = $type;
        $( this.video).append(source);
    },

    play: function( $url ) {
        if( $url !== undefined ) {
//            console.log('setting new src: ' + $url );
            this.video.src = $url;
        }
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
        this.video.volume = parseInt( $volume );
    },

    getTime: function() {
        return this.video.currentTime;
    },

    isPlaying: function() {
        return !this.video.paused;
    },

    addVideoListeners: function( $video ) {
        var self = this;
        $video.addEventListener('error',function( $e ){ self.handleError( $e ) },false);
        $video.addEventListener('progress',function( $e ){ self.handleProgress( $e ) },false);
        $video.addEventListener('play',function( $e ){ self.handlePlay( $e ) },false);
        $video.addEventListener('pause',function( $e ){ self.handlePause( $e ) },false);
        $video.addEventListener('seeking',function( $e ){ self.handleSeek( $e ) },false);
        $video.addEventListener('ended',function( $e ){ self.handleEnd( $e ) },false);
        $video.addEventListener('volumechange',function( $e ){ self.handleVolume( $e ) },false);
        $video.addEventListener('timeupdate',function( $e ){ self.handleTimeUpdate( $e ) },false);
    },

    addModelListeners: function() {
        var self = this;
        $(this.container).bind(FVideoModel.EVENT_RESIZE, function(){ self.resize(); });
        $(this.container).bind(FVideoModel.EVENT_VOLUME_UPDATE, function(){ self.video.volume = self.controller.model.getVolume(); });
    },

    resize: function() {
        this.video.width = this.controller.model.getWidth();
        this.video.height = this.controller.model.getHeight();
    },

    handleError: function( $e ) {
        console.log( 'error event' );
        console.log( $e );
    },

    handleTimeUpdate: function( $e ) {
//        console.log( this.video.currentTime );
        this.controller.setTime( this.video.currentTime );
    },

    handleProgress: function( $e ) {
        console.log( 'progress event' );
        console.log( $e );
    },

    handlePlay: function( $e ) {
        console.log( 'play event' );
        console.log( $e );
    },

    handlePause: function( $e ) {
        console.log( 'pause event' );
        console.log( $e );
    },

    handleSeek: function( $e ) {
        console.log( 'seek event' );
        console.log( $e );
    },

    handleEnd: function( $e ) {
        console.log( 'end event' );
        console.log( $e );
    },

    handleVolume: function( $e ) {
        console.log( 'volume event' );
        console.log( $e );
    }
};
