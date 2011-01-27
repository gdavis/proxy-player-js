//= require <utils/Class>
//= require <video/proxy/Proxy>
//= require <video/core/FVideoModel>

/**
 * Proxy which controls a Flash video object.
 */
var FlashVideoProxy = Class.create( Proxy, {

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
      if( $url ) this.video._play( $url );
      else this.video._play();
  },

  pause: function() {
      this.video._pause();
  },

  stop: function() {
      this.video._stop();
  },

  seek: function( $time ) {
      this.video._seek( $time );
  },

  destroy: function( $super ) {
    $(this.model.dispatcher).unbind(FVideoModel.EVENT_RESIZE, this.resize.context(this) );
    $(this.model.dispatcher).unbind(FVideoModel.EVENT_VOLUME_UPDATE, this.handleVolume.context(this) );
    $super.destroy();
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

  isPlaying: function() {
      return this.video._isPlaying();
  },

  setListeners: function() {
      $(this.model.dispatcher).bind(FVideoModel.EVENT_RESIZE, this.resize.context(this) );
      $(this.model.dispatcher).bind(FVideoModel.EVENT_VOLUME_UPDATE, this.handleVolume.context(this) );
  },

  handleVolume: function() {
      this.video._setVolume( this.model.getVolume() );
  },

  resize: function() {
      this.setWidth(this.model.getWidth());
      this.setHeight(this.model.getHeight());
  }
});