
/**
 * Proxy which controls a Flash video object.
 */
var FlashVideoProxy = function( $controller, $container, $flashObject ) {
    this.controller = $controller;
    this.container = $container;
    this.video = $flashObject;
    this.addModelListeners();
};

FlashVideoProxy.prototype = {

    setVideo:function( $el ) {
        this.video = $el;
    },

    // TODO: Refactor into FVideo
    addVideoSource: function( $path ) {

    },

    load: function( $url ) {
        if( $url ) this.video._load( $url );
        else this.video._load();
    },

    play: function( $url ) {
        console.log('this:' + this );
        console.log('this.video: ' + this.video );
        if( $url ) this.video._play( $url );
        else this.video._play();
    },

    pause: function() {
        console.log('this:' + this );
        console.log('this.video: ' + this.video );
        this.video._pause();
    },

    stop: function() {
        this.video._stop();
    },

    seek: function( $time ) {
        this.video._seek( $time );
    },

    setWidth: function( $value ) {
        this.video.width = typeof $value == 'string' ? $value : $value + "px";
    },

    setHeight: function( $value ) {
        this.video.height = typeof $value == 'string' ? $value : $value + "px";
    },

    getVolume: function() { return this.video._getVolume(); },
    setVolume: function( $volume ) {
        this.video._setVolume( $volume );
    },

    setTime: function( $time ) {
        this.video._setTime( $time );
    },

    getTime: function() {
        
    },

    isPlaying: function() {
        return this._proxy._isPlaying();
    },

    addModelListeners: function() {
        var self = this;
        $(this.container).bind(FVideoModel.EVENT_RESIZE, function(){ self.resize(); });
        $(this.container).bind(FVideoModel.EVENT_VOLUME_UPDATE, function(){ self.video._setVolume( self.controller.model.getVolume() ); });
    },

    resize: function() {
        this.setWidth(this.controller.model.getWidth());
        this.setHeight(this.controller.model.getHeight());
    }
};