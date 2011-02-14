//= require <utils/Class>
//= require <utils/function_util>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/environment_util>
//= require <controls/FControls>
//= require <video/core/FVideoConfiguration>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>
//= require <video/core/FVideoState>
//= require <video/core/FVideoSources>
//= require <video/proxy/HTMLProxy>
//= require <video/proxy/FlashProxy>

//  CONTROLS: Be sure to omit any controls you don't plan on using.
//= require <controls/StartVideoButton>
//= require <controls/PlayPauseButton>
//= require <controls/StopButton>
//= require <controls/ProgressBar>
//= require <controls/TimeDisplay>
//= require <controls/VolumeControl>
//= require <controls/FullscreenButton>

var FVideo = Class.create({

  VERSION: '<%= FVIDEO_VERSION %>',

  initialize: function($element, $options, $sources, $controlsClasses, $overlayClasses, $readyCallback) {

    // lookup element if we get a string
    if( typeof $element === 'string') {
      var elemID = ( $element.indexOf('#') > -1 ) ? $element.slice( $element.lastIndexOf('#')+1, $element.length ) : $element;
      this.container = document.getElementById( elemID );
    }
    else this.container = $element;

    // add class to container
    DOMUtil.addClass( this.container, 'fdl-video');

    // class properties
    this.player = DOMUtil.createElement('div', {className:'fdl-player'}, this.container);
    this.options = $options || new FVideoConfiguration();
    this.sources = $sources || new FVideoSources();
    this.controlsClasses = $controlsClasses ? $controlsClasses : FVideo.defaultControls ? FVideo.defaultControls : [];
    this.overlayClasses = $overlayClasses ? $overlayClasses : FVideo.defaultOverlays ? FVideo.defaultOverlays : [];
    this.readyCallback = $readyCallback;
    this.model = false;
    this.proxy = false;
    this.controls = false;
    this._isVideoReady = false;
    this._isVideoEmbedded = false;
    this._videoElement = false;
    this._isReady = false;
    this._lastState = '';

    // force 1 as the volume under iOS.
    if( EnvironmentUtil.iOS ) {
      this.options.videoOptions.volume = 1;
      // force browser controls to show on iOS 3.2. otherwise, the video won't play at all.
      // also force under iPhone, since we'll be using the built-in controls on that platform as well.
      if ( EnvironmentUtil.iOS_3 || EnvironmentUtil.iPhone ) {
        this.options.videoOptions.controls = true;
      }
    }

    // check browser capabilities
    this._useHTMLVideo = FVideo.canBrowserPlayVideo();

    // create a uniquely named player container for the video. used for flash fallback
    this.playerId = parseInt(Math.random() * 100000, 10);
    FVideo.instances[this.playerId] = this;

    // brainzzzzz
    this.model = new FVideoModel(this.container);
    this.model.setSize(this.options.width, this.options.height);
    this.model.setVolume(this.options.videoOptions.volume);

    // listen for model events
    this._addModelListeners();

    // startup
    this._init();
  },

  //////////////////////////////////////////////////////////////////////////////////
  // Public API
  //////////////////////////////////////////////////////////////////////////////////

  // actions

  destroy: function() {
    DOMUtil.removeClass(this.container, this.model.getState());
    this._removeModelListeners();
    this.proxy.destroy();
    if( this.controls ) {
      this.controls.destroy();
      delete this.controls;
      delete this.controlsContainer;
    }
    this.container.innerHTML = '';
    delete this.container;
    delete this.player;
    delete this._videoElement;
    delete this.sources;
    delete this.options;
    delete this.controlsClasses;
    delete this.readyCallback;
    delete this.model;
    delete this.proxy;
    delete this.controls;
  },

  /**
   * Begins downloading of the video. Under HTML5, invokes the load() method on the <video> object. Under Flash, the progressive
   * video file begins downloading. You can pass a url parameter which will set the src of the video object with that URL value.
   *
   * @param url  [Optional] Specifies a URL value to set as the primary source of the video. USAGE NOTE: If you use this in conjunction with <source> tags, you must remove the <source> tags prior to trying to set the URL manually.
   * This can be acheived by called reset() on a FVideo instance that has already been setup with <source> tags.
   */
  load: function() {
    this.proxy.load.apply(this.proxy, arguments);
  },

  /**
   * Starts playback of the video. Under HTML5, invokes the load() method on the <video> object. Under Flash, the progressive
   * video file begins downloading. You can pass a url parameter which will set the src of the video object with that URL value.
   *
   * @param url  [Optional] Specifies a URL value to set as the primary source of the video. USAGE NOTE: If you use this in conjunction with <source> tags, you must remove the <source> tags prior to trying to set the URL manually.
   * This can be acheived by called reset() on a FVideo instance that has already been setup with <source> tags.
   */
  play: function() {
    this.proxy.play.apply(this.proxy, arguments);
  },

  pause: function() {
    this.proxy.pause();
  },

  stop: function() {
    this.proxy.stop();
  },

  seek: function($time) {
    this.proxy.seek(parseFloat($time));
  },

  setNewSources: function( $sources ) {
    this.sources = $sources;
    // rebuild the HTML5 video tag when resetting. some browses (like firefox) behave really buggy when you try to dynamically
    // update the <source> tags and not just set the src attribute.
    if( this._useHTMLVideo ) {
      this.reset();
      this._init();
    }
    // don't rebuild the flash player when possible to prevent memory leaks in browsers such as IE.
    else {
      this.model.reset();
      this.proxy.load(this.sources.flashVideo);
      if( this.options.videoOptions.autoplay ) {
        this.proxy.play();
      }
    }
  },

  /**
   * Returns the player to its initialized state as if it was just constructed. When used,
   * the FVideo.setNewSources() method should be called to reinitialize the player with new source videos.
   */
  reset: function() {
    this.proxy.destroy();
    this._videoElement.parentNode.removeChild(this._videoElement);
    delete this.proxy;
    delete this._videoElement;
    if( this.controls ) {
      this.controls.destroy();
      this.controlsContainer.parentNode.removeChild(this.controlsContainer);
      delete this.controls;
      delete this.controlsContainer;
    }
    this.model.reset();
    this._isReady = false;
    this._isVideoReady = false;
    this._isVideoEmbedded = false;
  },

  /**
   * Forces the FVideo instance to remove any HTML5 <video> tags, and replace
   * with the Flash fallback SWF. This method is typically internally called
   * when the <video> tag encounters an error.
   */
  fallback: function() {
    this.reset();
    this.player.innerHTML = '';
    this._createAnchorTags(this.player);
  },

  setSize: function($width, $height) {
    this.model.setSize($width, $height);
  },

  getTime: function() { return this.model.getTime(); },
  getDuration: function() { return this.model.getDuration(); },

  getWidth: function() { return this.model.getWidth(); },
  setWidth: function($width) {
    this.model.setWidth($width);
  },

  getHeight: function() { return this.model.getHeight(); },
  setHeight: function($height) {
    this.model.setHeight($height);
  },

  getVolume: function() { return this.model.getVolume(); },
  setVolume: function($vol) {
    this.model.setVolume($vol);
  },

  getFullscreen: function() { return this.model.getFullscreen(); },
  setFullscreen: function($value) {
    this.model.setFullscreen($value);
  },
  
  getVideo: function(){ return this._videoElement; },

  //////////////////////////////////////////////////////////////////////////////////
  // Methods called from the video player to update state
  //////////////////////////////////////////////////////////////////////////////////

  _setVideo: function($video) {
    this._videoElement = $video;
    if (this._videoElement) {
      this._isVideoEmbedded = true;
    }
  },

  _videoReady: function() {
    this._isVideoReady = true;
    this._checkReady();
  },

  _checkReady: function() {
    if (this._isVideoReady && this._isVideoEmbedded) {
      this._startupVideo();
    }
  },

  _updatePlayheadTime: function($time) {
    this.model.setTime($time);
  },

  _updateDuration: function($duration) {
    this.model.setDuration($duration);
  },

  _updateIsPlaying: function($value) {
    this.model.setPlaying($value);
  },

  _updatePlayerState: function($state) {
    this.model.setState($state);
  },

  _updateVolume: function($volume) {
    this.model.setVolume($volume);
  },

  _updateLoadProgress: function($bytesLoaded, $bytesTotal) {
    this.model.setBytesTotal($bytesTotal);
    this.model.setBytesLoaded($bytesLoaded);
  },

  _complete: function() {
    EventUtil.dispatch( this.container, FVideoEvent.COMPLETE);
  },

  //////////////////////////////////////////////////////////////////////////////////
  // Private API
  //////////////////////////////////////////////////////////////////////////////////

  _init: function() {
    // create the video element
    this._videoElement = this._createVideo();

    // if we're using html5 video, we're ready to move on.
    if (this._useHTMLVideo) {
      this._videoReady();
    }
    // otherwise, we wait for flash to call _videoReady and we adjust our size while we wait.
    else {
      this.setSize(this.options.width, this.options.height);
    }
  },

  // called immediately when under html5, by flash when it has initialized
  _startupVideo: function() {
    if (this._isReady) return;
    this._isReady = true;

    // create proxy object
    this.proxy = this._createVideoProxy();

    // create ui
    this._createControls();

    // force resize
    this._handleResize();

    // set player to the ready state.
    this._updatePlayerState(FVideoState.READY);

    // fire ready callback.
    this.readyCallback.call(this);

    // fire DOM event
    EventUtil.dispatch( this.container, FVideoEvent.PLAYER_READY);
  },

  _createVideo: function() {
    if (this._useHTMLVideo) {
      return this._createHTMLVideoObject();
    }
    else {
      return this._createFlashVideoObject();
    }
  },

  _createHTMLVideoObject: function() {
    var video = document.createElement('video');
    FVideo.applyAttributes(video, this.options.videoOptions);
    video.width = this.model.getWidth();
    video.height = this.model.getHeight();
    this.sources.videos.sort(this._sortVideos);
    this._createSourceTags(video);
    this._createAnchorTags(video);
    this.player.appendChild(video);
    this._isVideoEmbedded = true;
    return video;
  },

  _createSourceTags: function( $video ) {
    var dl = this.sources.videos.length;
    for ( var i=0; i < dl; i++) {
      var source = this.sources.videos[ i ];
      var tag = this._createSourceTag( source.file, source.type );
      $video.appendChild( tag );
    }
  },

  _createSourceTag: function( $path, $type ) {
    var source = document.createElement('source');
    source.src = $path;
    // don't add the 'type' attribute if we are in andriod.
    if (!EnvironmentUtil.android && $type !== undefined) {
      source.type = $type;
    }
    return source;
  },

  // sorts an array of videos so that .mp4 files are listed first. fixes known issues with iOS 3.2.
  _sortVideos: function( a, b ) {
    var aIsMp4 = a.file.match(/.mp4/i) !== null;
    var bIsMp4 = b.file.match(/.mp4/i) !== null;
    if( aIsMp4 && !bIsMp4 ) { return -1; }
    else if ( bIsMp4 ) { return 1; }
    else return 0;
  },

  _createAnchorTags: function($el) {
    var dl = this.sources.videos.length;
    for (var i = 0; i < dl; i++) {
      var source = this.sources.videos[ i ];
      var anchor = document.createElement('a');
      anchor.href = source.file;
      anchor.setAttribute('data-type', source.type);
      anchor.innerHTML = source.label;
      $el.appendChild(anchor);
    }
  },

  _createFlashVideoObject: function() {
    var replaceID = 'player-wrapper-' + this.playerId;
    var flashID = "fdl-player-" + this.playerId;

    // create empty div for swfobject to replace
    DOMUtil.createElement('div', { id:replaceID }, this.player);

    this.options.flashOptions.attributes.id = flashID;
    this.options.flashOptions.variables.playerId = this.playerId;
    this.options.flashOptions.variables.src = this.sources.flashVideo;
    this.options.flashOptions.variables.autoplay = this.options.videoOptions.autoplay;
    this.options.flashOptions.variables.volume = this.model.getVolume();

    var self = this;
    swfobject.embedSWF(this.options.flashOptions.swf,
      replaceID,
      this.model.getWidth(),
      this.model.getHeight(),
      this.options.flashOptions.version,
      this.options.flashOptions.expressInstall,
      this.options.flashOptions.variables,
      this.options.flashOptions.params,
      this.options.flashOptions.attributes
      );

    // using the swfobject callback in IE causes issues, so we use a interval to lookup our flash element.
    this._findFlashPlayer(flashID);

    // we don't yet have access to the object tag, so it is directly set in the callback method from embedding the SWF
    return null;
  },

  _findFlashPlayer: function(flashID) {
    var self = this;
    self.flashFinderInterval = setInterval(function() {
      var flash_element = document.getElementById( flashID );
      if (flash_element) {
        self._setVideo(flash_element);
        self._checkReady();
        clearInterval(self.flashFinderInterval);
      }
    }, 10);
  },

  _createControls: function() {
    this.controlsContainer = DOMUtil.createElement('div', { className:'fdl-controls' }, this.container);
    this.controls = new FControls(this.model, this, this.controlsContainer, this.controlsClasses, this.overlayClasses );
  },

  _createVideoProxy: function() {
    if (this._useHTMLVideo) {
      return new HTMLVideoProxy(this.model, this, this._videoElement);
    }
    else {
      return new FlashVideoProxy(this.model, this, this._videoElement);
    }
  },

  _addModelListeners: function() {
    EventUtil.bind(this.model.dispatcher, FVideoEvent.RESIZE, this._handleResize.context(this));
    EventUtil.bind(this.model.dispatcher, FVideoEvent.STATE_CHANGE, this._handleState.context(this));
  },

  _removeModelListeners: function() {
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.RESIZE, this._handleResize.context(this));
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.STATE_CHANGE, this._handleState.context(this));
  },

  // applies the current state as a css class to the video container
  _handleState: function() {
    DOMUtil.removeClass(this.container, this._lastState );
    this._lastState = this.model.getState();
    DOMUtil.addClass( this.container, this._lastState );
  },

  _handleResize: function() {
    var wv = this.model.getWidth();
    var hv = this.model.getHeight();
    var wStr = typeof wv == 'string' ? wv : wv + "px";
    var hStr = typeof hv == 'string' ? hv : hv + "px";
    this.container.style.width = wStr;
    this.container.style.height = hStr;
  }
});

// this value allows default controls to be specified for all video instances created.
// when constructing a new instance and no controls are passed into the constructor, the player will check
// for this variable and use these if defined.
FVideo.defaultControls = null;
FVideo.defaultOverlays = null;

// class variable for storing all created FVideo instances on the page.
FVideo.instances = {};

FVideo.canBrowserPlayVideo = function() {
  var vid = document.createElement('video');
  var canPlay = vid.play;
  return canPlay !== undefined;
//  return false;
};

/**
 * Searches the DOM and creates and activates all video players on the page.
 * @param $callback
 */
FVideo.activateAll = function($callback) {

  var videos = document.getElementsByClassName('fdl-video');
  for( var i=0; i<videos.length; i++ ) {
    
    var container = videos[i];
    var videoElement = container.getElementsByTagName('video').item(0);

    if(FVideo.canBrowserPlayVideo()) {
      videoElement.pause();
      videoElement.src = '';
      if (EnvironmentUtil.firefox_3) {
        videoElement.load();        // initiate new load, required in FF 3.x as noted at http://blog.pearce.org.nz/2010/11/how-to-stop-video-or-audio-element.html
      }
    }

    var sourceList = new FVideoSources();
    var sourceElements = container.getElementsByTagName('source');
    for( var j=0; j< sourceElements.length; j++) {
      var sourceElement = sourceElements.item(j);
      sourceList.addVideo( sourceElement.src, sourceElement.type, sourceElement.getAttribute('data-label'), sourceElement.getAttribute('data-flash-default') || false );
    }

    var videoOptions = {};
    var flashSwf;
    if (videoElement.width) {
      videoOptions.width = videoElement.width;
    }
    if (videoElement.height) {
      videoOptions.height = videoElement.height;
    }
    if (videoElement.getAttribute('data-flash-swf')) {
      flashSwf = videoElement.getAttribute('data-flash-swf');
    }
    if (videoElement.getAttribute('data-controls')) {
      videoOptions.controls = videoElement.getAttribute('data-controls');
    }
    if (videoElement.getAttribute('data-volume')) {
      videoOptions.volume = videoElement.getAttribute('data-volume');
    }
    if (videoElement.getAttribute('data-autoplay')) {
      videoOptions.autoplay = videoElement.getAttribute('data-autoplay');
    }
    if (videoElement.getAttribute('data-preload')) {
      videoOptions.preload = videoElement.getAttribute('data-preload');
    }
    if (videoElement.getAttribute('data-loop')) {
      videoOptions.loop = videoElement.getAttribute('data-loop');
    }
    if (videoElement.getAttribute('data-poster')) {
      videoOptions.poster = videoElement.getAttribute('data-poster');
    }
    if (videoElement.getAttribute('data-src')) {
      videoOptions.src = videoElement.getAttribute('data-src');
    }

    // create a list of controls classes from the data-controls-list attribute separated by commas.
    var controls = videoElement.getAttribute('data-controls-list'),
      classList;
    if (controls !== undefined && controls !== null) {
      controls = controls.replace(' ', '');
      classList = controls.split(',');
    }

    // create a list of overlay classes from the data-controls-list attribute separated by commas.
    var overlays = videoElement.getAttribute('data-overlays-list'),
      overlayList;
    if (controls !== undefined && overlays !== null) {
      overlays = overlays.replace(' ', '');
      overlayList = overlays.split(',');
    }

    // create options for video
    var options = new FVideoConfiguration(videoElement.width, videoElement.height, videoOptions, flashSwf);

    // clear out container contents
    container.innerHTML = '';

    // create new FVideo obj
    new FVideo(container, options, sourceList, classList, overlayList, $callback);
  }
};

/**
 * Applies a hash of name/value pairs as attributes on an HTMLElement.
 * @param $elem The HTMLElement to apply attributes to
 * @param $attr An object populated with name/value pairs to map as attributes onto the HTMLElement
 */
FVideo.applyAttributes = function($elem, $attr) {
  for (var it in $attr) {
    it = it.toLowerCase();
    if (it == 'width' || it == 'height') {
      $elem[it] = parseInt($attr[it], 10);
    }
    else if( it.match(/poster/i) != null && EnvironmentUtil.iOS && EnvironmentUtil.iOS_3 ) {
      // ignore the 'poster' attribute on iOS3.x
      // see #3 here: http://camendesign.com/code/video_for_everybody#notes
    }
    // make sure we only map values that aren't false
    else if ($attr[it] && typeof $attr[it] === 'string') {
      if ($attr[it].toLowerCase() !== 'false') {
        $elem[it] = $attr[it];
      }
    }
    else if ($attr[it]) {
      $elem[it] = $attr[it];
    }
  }
};

document.getElementsByClassName = function(cl) {
  var retnode = [];
  var myclass = new RegExp('\\b' + cl + '\\b');
  var elem = this.getElementsByTagName('*');
  for (var i = 0; i < elem.length; i++) {
    var classes = elem[i].className;
    if (myclass.test(classes)) retnode.push(elem[i]);
  }
  return retnode;
};

//    FROM: http://roblaplaca.com/blog/2010/03/30/html5-video-on-the-ipad/
//
//    There’s no auto-play. If you try to play the HTML5 video player purely in JS without any event tied to it, it won’t work. (UPDATE: There is no working video autoplay attribute, however I just wrote a post about a workaround) Apple mentions why in the Safari Reference Library.
//
//    “In Safari on iPhone OS (for all devices, including iPad), where the user may be on a cellular network and be charged per data unit, autobuffering and autoplay are disabled. No data is loaded until the user initiates it. This means the JavaScript play() and load() methods are also inactive until the user initiates playback, unless the play() method is triggered by user action. In other words, a user-initiated Play button works, but an onLoad play event does not.”
//
//    After injecting the video tag via javascript you can’t put anything on top of the video. I tried adjusting the z-index and all sorts of hackery, but for the life of me I couldn’t get my custom controls to sit on top of the player unless the player was on the page first. That was really annoying because I had my HTML5 video class all set up to just inject the player into a container. It was all nice and self contained. Since it had to start on the page by default that caused a big mess and I had to do a lot of re-engineering to get it to work. Yuck!
//
//    If you do put an element on top of video, the video tag will devour any click events that occur… For example, I placed a play button and an image (“poster”) on top of my video. I wanted the button and poster to disappear when you click the play button. However when I clicked play it’s click event didn’t fire, but the movie did play. If I moved the button off of the video and clicked it, it worked fine. I still have to test if I can preventDefault on the video tag’s click event,  but for now I just did a workaround instead. I moved the video to the left until the user clicks play. Once play is clicked the poster gets hidden and moves the movie over and plays. That worked fine.
//
//    The poster attribute only shows up if the movie isn’t loaded. I was hoping it would show up as the default frame for the movie before it played, but instead it just showed the first frame of the movie.

// -------------

//    FROM: http://diveintohtml5.org/video.html
//
//    ISSUES ON IPHONES AND IPADS
//
//    iOS is Apple’s operating system that powers iPhones, iPod Touches, and iPads. iOS 3.2 has a number of issues with HTML5 video.
//
//    iOS will not recognize the video if you include a poster attribute. The poster attribute of the <video> element allows you to display a custom image while the video is loading, or until the user presses “play.” This bug is fixed in iOS 4.0, but it will be some time before users upgrade.
//    If you have multiple <source> elements, iOS will not recognize anything but the first one. Since iOS devices only support H.264+AAC+MP4, this effectively means you must always list your MP4 first. This bug is also fixed in iOS 4.0.
//    ❧
//    
//    ISSUES ON ANDROID DEVICES
//
//    Android is Google’s operating system that powers a number of different phones and handheld devices. Versions of Android before 2.3 had a number of issues with HTML5 video.
//
//    The type attribute on <source> elements confused Android greatly. The only way to get it to recognize a video source is, ironically, to omit the type attribute altogether and ensure that your H.264+AAC+MP4 video file’s name ends with an .mp4 extension. This does not appear to affect any other browser’s ability to detect support for the video; in the absence of a type attribute, other browsers appear to guess based on file extension as well. You can still include the type attribute on your other video sources, since H.264 is the only video format that Android 2.2 supports. (This bug is fixed in Android 2.3.)
//    The controls attribute was not supported. There are no ill effects to including it, but Android will not display any user interface controls for a video. You will need to provide your own user interface controls. At a minimum, you should provide a script that starts playing the video when the user clicks the video. This bug is also fixed in Android 2.3.

// -------------

//    At time of writing (May 20, 2010), the iPad has a bug that prevents it from noticing anything but the first video source
//    listed. Sadly, this means you will need to list your MP4 file first, followed by the free video formats. Sigh.
//
//    http://diveintohtml5.org/video.html
//

// -------------

//
//    From: http://camendesign.com/code/video_for_everybody
//
//    1. Ensure your server is using the correct mime-types. Firefox will not play the Ogg video if the mime-type is wrong. Place these lines in your .htaccess file to send the correct mime-types to browsers
//
//    AddType video/ogg  .ogv
//    AddType video/mp4  .mp4
//    AddType video/webm .webm
//
//    2. Replace "__VIDEO__.MP4" with the path to your video encoded to MP4 (a warning on using H.264) and
//    replace "__VIDEO__.OGV" with the path to your video encoded to Ogg.
//    Optionally you could also include a WebM video.
//
//    3. Replace "__POSTER__.JPG" with the path to an image you want to act as a title screen to the video, it will be shown before the video plays, and as a representative image when the video is unable to play (Also replace �__TITLE__� for the poster image�s alt text). Not all browsers support the poster attribute, it�s advisable to encode the poster image into the first frame of your video.
//
//    DO NOT INCLUDE THE poster ATTRIBUTE (<video poster="�">) FOR iPad / iPhone 3.x SUPPORT. There is a major bug with iPhone OS 3 that means that playback will not work on any HTML5 video tag that uses both the poster attribute and <source> elements. This was fixed in iPhone OS 4.0, but of course for now there will still be a large number of OS 3 users. This bug does not affect use of the poster image in the flashvars parameter, which you should retain
//
//    4. Replace "__FLASH__.SWF" with the path to the Flash video player you are using. I use JW Player (download and place �player.swf� in the right place), but this could be any Flash resource including YouTube. Sample code for using YouTube can be seen on the Video for Everybody YouTube Test Page
//    
//    5. Safari buffers the video automatically even if autobuffer is absent. This has been fixed in WebKit nightlies with a change to the HTML5 spec; the �preload="none"� attribute on the video element prevents autobuffering. A current bug in WebKit causes Safari to perpetually display �loading� until the play button is clicked
//
//    6. The iPhone will not autoplay. This is done to save bandwidth which may cost some users.
//    It is not a bug, it�s a feature
//
//    7. HTML5 video on Android, even the latest version, is badly broken. Resolution support varies from one handset to the next, usually the fallback image doesn�t show and the code requires special adjustments. The Android emulator is completely useless. THERE IS NO WAY TO TEST ON ANDROID WITHOUT A PHYSICAL PHONE. BLAME GOOGLE. I would love to update the code to work better with Android, but until Google fixes their code or sends me a phone, I can�t do that. They�ve had only three years to do it so far
//
//    8. Some web hosts, in trying to save bandwidth, gzip everything by default�including video files! In Firefox and Opera, seeking will not be possible or the video may not play at all if a video file is gzipped. If this is occurring to you please check your server / hosts and disable the gzipping of Ogg and other media files. You can switch off gzipping for video files in your .htaccess file by adding this line:
//
//    SetEnvIfNoCase Request_URI \.(og[gv]|mp4|m4v|webm)$ no-gzip dont-vary
//
//    With thanks to Bas van Bergen for this tip
//
//    9. There are some instances where people will simply not be able to view the video inside the web-page (e.g. Opera Mobile / Mini). It is absolutely essential that you provide download links outside of the video to ensure your message gets through
//
//    10. A current bug in Firefox means that when JavaScript is disabled (NoScript for example) the video controls do not display. For now, right-click on the video for the controls, use autoplay on your videos or rely on users allowing your site in NoScript
//
//    11. The Eolas �Click to Activate� issue affects Flash / QuickTime in Internet Explorer 6 / 7 as the ActiveX controls are not inserted using JavaScript�however Microsoft removed �Click to Activate� in a later update patch. This issue will not affect users who have run Windows Update
//
//    12. A parsing bug in Camino 2.0 / Firefox 3.0 means that the image element inside the video element will �leak� outside of the video element. This is not visible however unless some kind of background image or colour is applied to that image element. You can stop this by either wrapping the video element in another element or modifying the code from �<source � />� to �<source �></source>�. This works, but will not validate as HTML5