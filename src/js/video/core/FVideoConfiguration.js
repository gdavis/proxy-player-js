// require <utils/class>

var FVideoConfiguration = Class.create({
  initialize: function ($width, $height, $videoOptions, $swf, $variables, $parameters, $attributes) {
    $swf = $swf || FVideoConfiguration.DEFAULT_SWF;
    $variables = $variables || {};
    this.width = $width || 320;
    this.height = $height || 240;
    this.flashOptions = { expressInstall:"expressinstall.swf",
      version:"10",
      swf: $swf,
      variables: $variables,
      params: FVideoConfiguration.mergeOptions(FVideoConfiguration.DEFAULT_FLASH_PARAMS, $parameters),
      attributes: FVideoConfiguration.mergeOptions(FVideoConfiguration.DEFAULT_FLASH_ATTRIBUTES, $attributes)
    };
    this.videoOptions = FVideoConfiguration.mergeOptions(FVideoConfiguration.DEFAULT_VIDEO_OPTIONS, $videoOptions);
    this.videoOptions.width = this.width;
    this.videoOptions.height = this.height;
  }
});

// defaults
FVideoConfiguration.DEFAULT_SWF = 'proxy-player.swf';
FVideoConfiguration.DEFAULT_FLASH_ATTRIBUTES = { bgcolor:"#000" };
FVideoConfiguration.DEFAULT_VIDEO_OPTIONS = {
  audio: false,
  autoplay: false,
  autobuffer: false,
  controls: false,
  loop: false,
  preload: false,
  src: false,
  poster: false,
  volume: 1
};
FVideoConfiguration.DEFAULT_FLASH_PARAMS = {
  scale:"noscale",
  allowScriptAccess:"always",
  quality:"best",
  wmode:"transparent",
  allowFullScreen:"true"
};

/**
 * Creates and returns a new object from two sets of objects by combining and overwriting values from the modified object.
 * @param $original
 * @param $modified
 */
FVideoConfiguration.mergeOptions = function($original, $modified) {
  if ($modified === undefined) {
    return $original;
  }
  var obj = {};
  var it;
  // map original values.
  for (it in $original) {
    obj[it] = $original[it];
  }
  // loop through all the modified options and overwrite the original value.
  for (it in $modified) {
    // recurse through child objects
    if (typeof $modified[it] === 'object') {
      obj[it] = FVideoConfiguration.mergeOptions($original[it], $modified[it]);
    } else {
      obj[it] = $modified[it];
    }
  }
  return obj;
};