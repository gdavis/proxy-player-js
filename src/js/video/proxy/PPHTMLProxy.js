//= require <utils/Class>
//= require <video/proxy/PPProxy>
//= require <video/core/PPVideoModel>
//= require <video/core/PPVideoEvent>
//= require <video/core/PPVideoState>

/**
 * PPProxy which controlls an HTML video object.
 */
var HTMLVideoProxy = Class.create(PPProxy, {
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
      { type:PPVideoEvent.RESIZE,          handler:this.resize.context(this) },
      { type:PPVideoEvent.VOLUME_UPDATE,   handler:this._updateVolume.context(this) }
    ];
    $super($model, $controller, $video);

    // sync with model.
    this.setVolume(this.model.getVolume());
    this.resize();
  },


  destroy: function($super) {
    var obj, i, dl = this.videoEvents.length;

    // add video listeners
    for (i = 0; i < dl; i++) {
      obj = this.videoEvents[i];
      EventUtil.unbind(this.video, obj.type, obj.handler);
    }

    // add model listeners
    dl = this.modelEvents.length;
    for (i = 0; i < dl; i++) {
      obj = this.modelEvents[i];
      EventUtil.unbind(this.model.dispatcher, obj.type, obj.handler);
    }

    delete this.videoEvents;
    delete this.modelEvents;
    clearInterval(this.bufferInterval);

    $super();
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
    if( this.video.currentTime > 0 ) {
      this.video.currentTime = 0;
    }
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
    return this.video.volume;
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
      EventUtil.bind(this.video, obj.type, obj.handler);
    }

    // add model listeners
    dl = this.modelEvents.length;
    for (i = 0; i < dl; i++) {
      obj = this.modelEvents[i];
      EventUtil.bind(this.model.dispatcher, obj.type, obj.handler);
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
    this.controller._updatePlayerState(PPVideoState.ERROR);
    var video = $e.target;
    if( video.networkState === 4 ) {
      this.controller.fallback();
    }
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
    this.controller._updatePlayerState(PPVideoState.LOADING);
  },

  handleBuffering: function($e) {
    this.controller._updatePlayerState(PPVideoState.BUFFERING);
  },

  handlePlay: function($e) {
    if( !this.bufferInterval ) {
      this.startBufferInterval();
    }
    this.controller._updateIsPlaying(true);
    this.controller._updatePlayerState(PPVideoState.PLAYING);
  },

  handlePause: function($e) {
    this.controller._updateIsPlaying(false);
    if (this.video.currentTime == 0 && this.video.paused) {
      this.controller._updatePlayerState(PPVideoState.STOPPED);
    }
    else {
      this.controller._updatePlayerState(PPVideoState.PAUSED);
    }
  },

  handleSeek: function($e) {
    this.controller._updateIsPlaying(false);
    this.controller._updatePlayerState(PPVideoState.SEEKING);
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
    this.controller._updatePlayerState(PPVideoState.STOPPED);
    this.controller._complete();
  },

  handleVolume: function($e) {
    this.controller._updateVolume(this.video.volume);
  }
});
