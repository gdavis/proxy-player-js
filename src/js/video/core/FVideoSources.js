//= require <utils/Class>

var FVideoSources = Class.create({
  initialize: function() {
    this.videos = [];
    this.flashVideo = '';
  },

  addVideo: function($file, $type, $label, $isFlashDefault) {
    this.videos.push(new FVideoSource($file, $type, $label));
    if ($isFlashDefault == 'true' || $isFlashDefault) {
      this.flashVideo = $file;
    }
  }
});

var FVideoSource = Class.create({
  initialize: function($file, $type, $label) {
    this.file = $file;
    this.type = $type;
    this.label = $label;
  }
});