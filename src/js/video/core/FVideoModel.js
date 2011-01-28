//= require <utils/Class>

var FVideoModel = Class.create({

  initialize: function($dispatcher) {
    this.dispatcher = $dispatcher;
    this._volume = 1;
    this._time = -1;
    this._duration = -1;
    this._width = 0;
    this._height = 0;
    this._playing = false;
    this._playerState = false;
    this._bytesLoaded = -1;
    this._bytesTotal = -1;
    this._fullscreen = false;
  },

  setSize: function($width, $height) {
    if (this._width == $width && this._height == $height) return;
    this._width = $width;
    this._height = $height;
    dispatch(this.dispatcher, FVideoModel.EVENT_RESIZE);
  },

  getWidth: function() {
    return this._width
  },
  setWidth: function($value) {
    if (this._width === $value) return;
    this._width = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_RESIZE);
  },

  getHeight: function() {
    return this._height
  },
  setHeight: function($value) {
    if (this._height === $value) return;
    this._height = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_RESIZE);
  },

  getVolume: function() {
    return this._volume;
  },
  setVolume: function($value) {
    // normalize value
    $value = parseFloat($value);
    $value = ( $value > 1 ) ? 1 : ( $value < 0 ) ? 0 : $value;
    if (this._volume == $value) return;
    this._volume = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_VOLUME_UPDATE);
  },

  getTime: function() {
    return this._time;
  },
  setTime: function($value) {
    if (this._time == $value) return;
    this._time = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_TIME_UPDATE);
  },

  getDuration: function() {
    return this._duration;
  },
  setDuration: function($value) {
    if (this._duration == $value) return;
    this._duration = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_TIME_UPDATE);
  },

  getPlaying: function() {
    return this._playing;
  },
  setPlaying: function($value) {
    if (this._playing == $value) return;
    this._playing = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_PLAY_STATE_CHANGE);
  },

  getPlayerState: function() {
    return this._playerState;
  },
  setPlayerState: function($value) {
    if (this._playerState === $value) return;
    this._playerState = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_PLAYER_STATE_CHANGE);
  },

  getBytesLoaded: function() {
    return this._bytesLoaded
  },
  setBytesLoaded: function($value) {
    if (this._bytesLoaded == $value) return;
    this._bytesLoaded = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_LOAD_PROGRESS);
  },

  getBytesTotal: function() {
    return this._bytesTotal
  },
  setBytesTotal: function($value) {
    if (this._bytesTotal == $value) return;
    this._bytesTotal = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_LOAD_PROGRESS);
  },

  getFullscreen: function() {
    return this._fullscreen
  },
  setFullscreen: function($value) {
    if (this._fullscreen == $value) return;
    this._fullscreen = $value;
    dispatch(this.dispatcher, FVideoModel.EVENT_TOGGLE_FULLSCREEN);
  }
});

// events
FVideoModel.EVENT_RESIZE = "FVideoModelEvent.Resize";
FVideoModel.EVENT_METADATA = "FVideoModelEvent.Metadata";
FVideoModel.EVENT_TIME_UPDATE = "FVideoModelEvent.TimeUpdate";
FVideoModel.EVENT_LOAD_PROGRESS = "FVideoModelEvent.LoadProgress";
FVideoModel.EVENT_VOLUME_UPDATE = "FVideoModelEvent.VolumeUpdate";
FVideoModel.EVENT_PLAY_STATE_CHANGE = "FVideoModelEvent.PlayStateChange";
FVideoModel.EVENT_PLAYER_STATE_CHANGE = "FVideoModelEvent.PlayerStateChange";
FVideoModel.EVENT_TOGGLE_FULLSCREEN = "FVideoModelEvent.ToggleFullscreen";

// states
FVideoModel.STATE_READY = "ready";
FVideoModel.STATE_LOADING = "loading";
FVideoModel.STATE_BUFFERING = "buffering";
FVideoModel.STATE_PLAYING = "playing";
FVideoModel.STATE_PAUSED = "paused";
FVideoModel.STATE_STOPPED = "stopped";
FVideoModel.STATE_SEEKING = "seeking";
FVideoModel.STATE_ERROR = "error";