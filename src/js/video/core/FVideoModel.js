//= require <utils/Class>
//= require <FVideoEvent>

var FVideoModel = Class.create({

  initialize: function($dispatcher) {
    this.dispatcher = $dispatcher;
    this._volume = 1;
    this._time = 0;
    this._duration = 0;
    this._width = 0;
    this._height = 0;
    this._playing = false;
    this._playerState = false;
    this._bytesLoaded = 0;
    this._bytesTotal = 0;
    this._fullscreen = false;
  },

  setSize: function($width, $height) {
    if (this._width == $width && this._height == $height) return;
    this._width = $width;
    this._height = $height;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.RESIZE);
  },

  getWidth: function() { return this._width; },
  setWidth: function($value) {
    if (this._width === $value) return;
    this._width = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.RESIZE);
  },

  getHeight: function() { return this._height; },
  setHeight: function($value) {
    if (this._height === $value) return;
    this._height = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.RESIZE);
  },

  getVolume: function() { return this._volume; },
  setVolume: function($value) {
    // normalize value
    $value = parseFloat($value);
    $value = ( $value > 1 ) ? 1 : ( $value < 0 ) ? 0 : $value;
    if (this._volume == $value) return;
    this._volume = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.VOLUME_UPDATE);
  },

  getTime: function() { return this._time; },
  setTime: function($value) {
    if (this._time == $value) return;
    this._time = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.TIME_UPDATE);
  },

  getDuration: function() { return this._duration; },
  setDuration: function($value) {
    if (this._duration == $value) return;
    this._duration = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.TIME_UPDATE);
  },

  getPlaying: function() { return this._playing; },
  setPlaying: function($value) {
    if (this._playing == $value) return;
    this._playing = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.PLAY_STATE_CHANGE);
  },

  getPlayerState: function() { return this._playerState; },
  setPlayerState: function($value) {
    if (this._playerState === $value) return;
    this._playerState = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.STATE_CHANGE);
  },

  getBytesLoaded: function() { return this._bytesLoaded; },
  setBytesLoaded: function($value) {
    if (this._bytesLoaded == $value) return;
    this._bytesLoaded = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.LOAD_PROGRESS);
  },

  getBytesTotal: function() { return this._bytesTotal; },
  setBytesTotal: function($value) {
    if (this._bytesTotal == $value) return;
    this._bytesTotal = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.LOAD_PROGRESS);
  },

  getFullscreen: function() { return this._fullscreen; },
  setFullscreen: function($value) {
    if (this._fullscreen == $value) return;
    this._fullscreen = $value;
    EventUtil.dispatch(this.dispatcher, FVideoEvent.TOGGLE_FULLSCREEN);
  }
});