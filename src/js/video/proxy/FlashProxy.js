//= require <utils/Class>
//= require <video/proxy/Proxy>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>
//= require <video/core/FVideoState>

/**
 * Proxy which controls a Flash video object.
 */
var FlashVideoProxy = Class.create(Proxy, {

  setVideo:function($el) {
    this.video = $el;
  },

  load: function($url) {
    if ($url) this.video._load($url);
    else this.video._load();
  },

  play: function($url) {
    if ($url) this.video._play($url);
    else this.video._play();
  },

  pause: function() {
    this.video._pause();
  },

  stop: function() {
    this.video._stop();
  },

  seek: function($time) {
    this.video._seek($time);
  },

  destroy: function($super) {
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.RESIZE, this.resize.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.VOLUME_UPDATE, this.handleVolume.context(this));
    $super();
  },

  setWidth: function($value) {
    this.video.width = typeof $value == 'string' ? $value : $value + "px";
  },

  setHeight: function($value) {
    this.video.height = typeof $value == 'string' ? $value : $value + "px";
  },

  getVolume: function() {
    return this.video._getVolume();
  },
  setVolume: function($volume) {
    this.video._setVolume($volume);
  },

  setTime: function($time) {
    this.video._setTime($time);
  },

  isPlaying: function() {
    return this.video._isPlaying();
  },

  setListeners: function() {
    EventUtil.bind(this.model.dispatcher, FVideoEvent.RESIZE, this.resize.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.VOLUME_UPDATE, this.handleVolume.context(this));
  },

  handleVolume: function() {
    this.video._setVolume(this.model.getVolume());
  },

  resize: function() {
    this.setWidth(this.model.getWidth());
    this.setHeight(this.model.getHeight());
  }
});