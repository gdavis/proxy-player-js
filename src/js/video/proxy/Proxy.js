//= require <utils/Class>

/**
 * Base class for video proxy objects.
 */
var Proxy = Class.create({
  initialize: function($model, $controller, $video) {
    this.model = $model;
    this.controller = $controller;
    this.video = $video;
    this.setListeners();
  },
  destroy: function() {
    delete this.model;
    delete this.controller;
    delete this.video;
  },
  load: function($url) {
  },
  play: function($url) {
  },
  pause: function() {
  },
  stop: function() {
  },
  seek: function($time) {
  },
  setWidth: function($value) {
  },
  setHeight: function($value) {
  },
  getVolume: function() {
  },
  setVolume: function($volume) {
  },
  setTime: function($time) {
  },
  isPlaying: function() {
  },
  setListeners: function() {
  },
  resize: function() {
  }
});