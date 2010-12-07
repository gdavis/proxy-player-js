
/**
 * Proxy which controls a Flash video object.
 */
var FlashVideoProxy = function( $controller, $container, $flashObject ) {
    this.controller = $controller;
    this.container = $container;
    this.video = $flashObject;
    this.init();
};

FlashVideoProxy.prototype = {

    init: function() {
        this.addVideoListeners( this.video );
        this.addModelListeners();
    },

    // TODO: Refactor into FVideo
    addVideoSource: function( $path ) {

    },

    load: function( $url ) {
        if( $url ) this.video.load( $url );
        else this.video.load();
    },

    play: function( $url ) {
        if( $url ) this.video.play( $url );
        else this.video.play();
    },

    pause: function() {
        this.video.pause();
    },

    stop: function() {
        this.video.stop();
    },

    seek: function( $time ) {
        this.video.seek( $time );
    },

    setWidth: function( $value ) {
        this.video.width = typeof $value == 'string' ? $value : $value + "px";
    },

    setHeight: function( $value ) {
        this.video.height = typeof $value == 'string' ? $value : $value + "px";
    },

    getVolume: function() { return this.video.getVolume(); },
    setVolume: function( $volume ) {
        this.video.setVolume( $volume );
    },

    setTime: function( $time ) {
        this.video.setTime( $time );
    },

    getTime: function() {
        
    },

    isPlaying: function() {
        return this._proxy.isPlaying();
    },

    addVideoListeners: function( $video ) {
        
    },

    removeVideoListeners: function( $video ) {
    },

    addModelListeners: function() {
        var self = this;
        $(this.container).bind(FVideoModel.EVENT_RESIZE, function(){ self.resize(); });
        $(this.container).bind(FVideoModel.EVENT_VOLUME_UPDATE, function(){ self.video.setVolume( self.controller.model.getVolume() ); });
    },

    resize: function() {
        this.setWidth(this.controller.model.getWidth());
        this.setHeight(this.controller.model.getHeight());
    }
};