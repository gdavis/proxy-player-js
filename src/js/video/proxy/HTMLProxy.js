//= require <utils/Class>
//= require <video/proxy/Proxy>
//= require <video/core/FVideoModel>

/**
 * Proxy which controlls an HTML video object.
 */
var HTMLVideoProxy = Class.create( Proxy, {
  initialize: function($super, $model, $controller, $video) {
    this.bufferInterval = false;

    this.videoEvents = [
      { type:"metadata",        handler:this.handleMetadata.context(this) },
      { type:"loadstart",       handler:this.handleLoadStart.context(this) },
      { type:"loadeddata",      handler:this.handleBuffering.context(this) },
      { type:"waiting",         handler:this.handleBuffering.context(this) },
      { type:"error",           handler:this.handleError.context(this) },
      { type:"progress",        handler:this.handleProgress.context(this) },
      { type:"play",            handler:this.handlePlay.context(this) },
      { type:"playing",         handler:this.handlePlay.context(this) },
      { type:"pause",           handler:this.handlePause.context(this) },
      { type:"seeking",         handler:this.handleSeek.context(this) },
      { type:"seeked",          handler:this.handleSeeked.context(this) },
      { type:"ended",           handler:this.handleEnd.context(this) },
      { type:"volumechange",    handler:this.handleVolume.context(this) },
      { type:"timeupdate",      handler:this.handleTimeUpdate.context(this) },
      { type:"durationchange",  handler:this.handleDurationChange.context(this) }
    ];

    this.modelEvents = [
      { type:FVideoModel.EVENT_RESIZE,          handler:this.resize.context(this) },
      { type:FVideoModel.EVENT_VOLUME_UPDATE,   handler:this._updateVolume.context(this) }
    ];

    $super($model, $controller, $video);
  },


  destroy: function($super) {
    var obj, i, dl = this.videoEvents.length;

    // add video listeners
    for (i = 0; i < dl; i++) {
      obj = this.videoEvents[i];
      this.video.removeEventListener(obj.type, obj.handler, false);
    }

    // add model listeners
    dl = this.modelEvents.length;
    for (i = 0; i < dl; i++) {
      obj = this.modelEvents[i];
      $(this.model.dispatcher).unbind(obj.type, obj.handler);
    }

    delete this.videoEvents;
    delete this.modelEvents;

    $super();
  },

  // TODO: Refactor into FVideo
  addVideoSource: function($path, $type) {
    var source = document.createElement('source');
    source.src = $path;
    // don't add the 'type' attribute if we are in andriod.
    if (!EnvironmentUtil.android && $type !== undefined) {
      source.type = $type;
    }
    $(this.video).append(source);
  },

  load: function($url) {
    if ($url !== undefined) this.video.src = $url;
    this.video.load();
  },

  play: function($url) {
    if ($url !== undefined) this.video.src = $url;
    this.video.play();
  },

  pause: function() {
    this.video.pause();
  },

  stop: function() {
    this.video.pause();
    this.video.currentTime = 0;
  },

  seek: function($time) {
    this.video.currentTime = $time;
  },

  setWidth: function($value) {
    this.video.width = parseInt($value);
  },

  setHeight: function($value) {
    this.video.height = parseInt($value);
  },

  getVolume: function() {
    return this.video.volume
  },
  setVolume: function($volume) {
    this.video.volume = parseFloat($volume);
  },

  getTime: function() {
    return this.video.currentTime;
  },

  isPlaying: function() {
    return !this.video.paused;
  },

  setListeners: function() {
    var obj, i, dl = this.videoEvents.length;

    // add video listeners
    for (i = 0; i < dl; i++) {
      obj = this.videoEvents[i];
      this.video.addEventListener(obj.type, obj.handler, false);
    }

    // add model listeners
    dl = this.modelEvents.length;
    for (i = 0; i < dl; i++) {
      obj = this.modelEvents[i];
      $(this.model.dispatcher).bind(obj.type, obj.handler);
    }
  },

  _updateVolume: function() {
    this.setVolume(this.model.getVolume());
  },

  resize: function() {
    this.video.width = parseInt(this.model.getWidth());
    this.video.height = parseInt(this.model.getHeight());
  },

  startBufferInterval: function() {
    this.bufferInterval = setInterval(this.handleProgress.context(this), 10);
  },

  handleDurationChange: function($e) {
    this.controller._updateDuration(this.video.duration);
  },

  handleMetadata: function($e) {
  },

  handleError: function($e) {
    this.controller._updatePlayerState(FVideoModel.STATE_ERROR);
    // TODO: Add this back with certain error states
//        this.controller.fallback();
  },

  handleTimeUpdate: function($e) {
    this.controller._updatePlayheadTime(this.video.currentTime);
  },

  handleProgress: function($e) {
    // modern browsers that are up to spec
    if (this.video.buffered) {
      if (this.video.buffered.length > 0) {
        this.controller._updateLoadProgress(this.video.buffered.end(0), this.video.duration);
        if (this.video.buffered.end(0) == this.video.duration) {
          clearInterval(this.bufferInterval);
        }
      }
    }
    // check for FF versions that support the loaded/total event values
    else if ($e) {
      if ($e.loaded && $e.total) {
        this.controller._updateLoadProgress($e.loaded, $e.total);
      }
    }
  },

  handleLoadStart: function($e) {
    this.controller._updatePlayerState(FVideoModel.STATE_LOADING);
  },


  handleBuffering: function($e) {
    this.controller._updatePlayerState(FVideoModel.STATE_BUFFERING);
  },

  handlePlay: function($e) {
    this.startBufferInterval();
    this.controller._updateIsPlaying(true);
    this.controller._updatePlayerState(FVideoModel.STATE_PLAYING);
  },

  handlePause: function($e) {
    this.controller._updateIsPlaying(false);
    if (this.video.currentTime == 0 && this.video.paused) {
      this.controller._updatePlayerState(FVideoModel.STATE_STOPPED);
    }
    else {
      this.controller._updatePlayerState(FVideoModel.STATE_PAUSED);
    }
  },

  handleSeek: function($e) {
    this.controller._updateIsPlaying(false);
    this.controller._updatePlayerState(FVideoModel.STATE_SEEKING);
  },

  handleSeeked: function($e) {
    // return to previous state after seeking, either playing or paused.
    if (this.video.paused) {
      this.handlePause();
    }
    else {
      this.handlePlay();
    }
  },

  handleEnd: function($e) {
    this.controller._updateIsPlaying(false);
    this.controller._updatePlayerState(FVideoModel.STATE_STOPPED);
  },

  handleVolume: function($e) {
    this.controller._updateVolume(this.video.volume);
  }
});
