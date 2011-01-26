//= require <utils/Class>
//= require <utils/function_util>
//= require <utils/dom_util>
//= require <utils/function_util>
//= require <utils/environment_util>
//= require <controls/FControls>
//= require <video/core/FVideoConfiguration>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoSources>
//= require <video/proxy/HTMLProxy>
//= require <video/proxy/FlashProxy>

//  CONTROLS: Be sure to omit any controls you don't plan on using.
//= require <controls/PlayPauseButton>
//= require <controls/StopButton>
//= require <controls/ProgressBar>
//= require <controls/TimeDisplay>
//= require <controls/VolumeControl>
//= require <controls/FullscreenButton>

var FVideo = Class.create({

    VERSION: '<%= FVIDEO_VERSION %>',

    initialize: function( $element, $options, $sources, $controlsClasses, $readyCallback ) {
        
        if (typeof $element === 'string' ) {
            this.container = $( $element ).get(0);
        } else {
            this.container = $element;
        }

        this.options = $options || new FVideoConfiguration();
        this.sources = $sources || new FVideoSources();
        this.controlsClasses = $controlsClasses ? $controlsClasses : FVideo.defaultControls;
        this.readyCallback = $readyCallback;

        this.model = false;
        this.proxy = false;
        this.controls = false;

        this._isVideoReady = false;
        this._isVideoEmbedded = false;
        this._videoElement = false;
        this._useHTMLVideo = true;
        this._initialized = false;
        this._isReady = false;
        this._lastState = '';
        
        this._init();
    },
    
    //////////////////////////////////////////////////////////////////////////////////
    // Public API
    //////////////////////////////////////////////////////////////////////////////////

    // actions

    load: function() {
        this.proxy.load();
    },

    play: function( $url ) {
        if( $url ) {
            this.proxy.play( $url );
        }
        else {
            if( this.model.getPlaying() ) {
                this.proxy.pause();
            }
            else {
                this.proxy.play();
            }
        }
    },

    pause: function() {
        this.proxy.pause();
    },

    stop: function() {
        this.proxy.stop();
    },

    seek: function( $time ) {
        this.proxy.seek( parseFloat( $time ));
    },


    // adjustments

    setSize: function( $width, $height ) {
        this.model.setSize( $width, $height );
    },
    
    getWidth: function() { return this.model.getWidth(); },
    setWidth: function( $width ) {
        this.model.setWidth( $width );
    },

    getHeight: function() { return this.model.getHeight(); },
    setHeight: function( $height ) {
        this.model.setHeight( $height );
    },

    getTime: function() { return this.proxy.getTime(); },

    getVolume: function() { return this.model.getVolume(); },
    setVolume: function( $vol ) {
        this.model.setVolume( $vol );
    },

    getFullscreen: function() { return this.model.getFullscreen(); },
    setFullscreen: function( $value ) {
        this.model.setFullscreen( $value );
    },


    // utility

    addVideoSource: function( $path, $type ) {
        this.proxy.addVideoSource( $path, $type );
    },

    /**
     * Forces the FVideo instance to remove any HTML5 <video> tags, and replace
     * with the Flash fallback SWF. This method is typically internally called
     * when the <video> tag encounters an error.
     */
    fallback: function() {
        this.player.innerHTML = '';
        this._createSourceAnchors( this.player );
    },

    destroy: function() {
        if( this.player ) {
            if( this.player.parentNode ) {
                this.player.parentNode.removeChild( this.player );
            }
        }
    },

    setVideo: function( $video ) {
        this._videoElement = $( "#"+ $video.id ).get(0);
        if( this._videoElement ){ this._isVideoEmbedded = true; }
    },


    //////////////////////////////////////////////////////////////////////////////////
    // Methods called from the video player to update state
    //////////////////////////////////////////////////////////////////////////////////

    _videoReady: function() {
        this._isVideoReady = true;
        this._checkReady();
    },

    // called immediately when under html5, by flash when it has initialized if not
    _startupVideo: function() {

        if( this._isReady ) return;
        this._isReady = true;

        // create proxy object
        this.proxy = this._createVideoProxy();

        // create source tags
        var dl = this.sources.videos.length;
        for( var i = 0; i<dl; i++ ) {
            var source = this.sources.videos[ i ];
            this.addVideoSource( source.file, source.type );
        }

        // sync relevant values from the player onto the model.
        // by setting these on the model we also dispatch events which update the UI to its default state.
        // it also allows us to update the starting volume on the flash when it is ready.
        this.setVolume( this.options.videoOptions.volume );
        this.setSize( this.options.width, this.options.height );

        this._createControls();

        // init player to the ready state.
        this._updatePlayerState(FVideoModel.STATE_READY);

        // fire ready callback.
        this.readyCallback( this );

        // fire DOM event
        $(this.container).trigger(FVideo.EVENT_PLAYER_READY);
    },

    _updatePlayheadTime: function( $time ){
        this.model.setTime( $time );
    },

    _updateDuration: function( $duration ) {
        this.model.setDuration( $duration );
    },

    _updateIsPlaying: function( $value ) {
        this.model.setPlaying( $value );
    },

    _updatePlayerState: function( $state ) {
        this.model.setPlayerState( $state );
    },

    _updateVolume: function( $volume ) {
        this.model.setVolume( $volume );
    },

    _updateLoadProgress: function( $bytesLoaded, $bytesTotal ) {
        this.model.setBytesTotal( $bytesTotal );
        this.model.setBytesLoaded( $bytesLoaded );
    },


    //////////////////////////////////////////////////////////////////////////////////
    // Private API
    //////////////////////////////////////////////////////////////////////////////////

    _init: function() {

        // create container for the player
        this.player = DOMUtil.createElement( 'div', {className:'player'}, this.container );

        // create a uniquely named player container for the video. used for flash fallback
        this.playerId = parseInt( Math.random() * 100000, 10 );
        FVideo.instances[this.playerId] = this;

        // create page elements
        this._useHTMLVideo = this._canBrowserPlayVideo();
        this._videoElement = this._createVideo();

        // brainzzzzz
        this.model = new FVideoModel( this.container );

        // listen for model events
        this._addModelListeners();

        // if we're using html5 video, we're ready to move on.
        if( this._useHTMLVideo ) { this._videoReady(); }
        // otherwise, we wait for flash to call _videoReady and we adjust our size while we wait.
        else { this.setSize( this.options.width, this.options.height ); }
    },

    _checkReady: function() {
        if( this._isVideoReady && this._isVideoEmbedded ) {
            this._startupVideo();
        }
    },

    _canBrowserPlayVideo: function() {
        var vid = document.createElement('video');
        var canPlay = vid.play;
        return canPlay !== undefined;
//        return false;
    },

    _createVideo: function() {
        if( this._useHTMLVideo ) { return this._createHTMLVideoObject(); }
        else { return this._createFlashVideoObject(); }
    },

    _createHTMLVideoObject: function() {
        var video = document.createElement('video');
        FVideo.applyAttributes( video, this.options.videoOptions );
        this._createSourceAnchors( video );
        this.player.appendChild( video );
        this._isVideoEmbedded = true;
        return video;
    },

    _createSourceAnchors: function( $el ) {
        // write anchor fallback tags
        var dl = this.sources.videos.length;
        for( var i = 0; i < dl; i++ ) {
            var source = this.sources.videos[ i ];
            var anchor = document.createElement('a');
            anchor.href = source.file;
            anchor.setAttribute('data-type', source.type);
            anchor.innerHTML = source.label;
            $el.appendChild( anchor );
        }
    },

    _createFlashVideoObject: function() {

        var replaceID = 'player-wrapper-' + this.playerId;
        var flashID = "fdl-player-" + this.playerId;

        // create empty div for swfobject to replace
        DOMUtil.createElement( 'div', { id:replaceID }, this.player );

        // map the default video file as the source for flash.
        this.options.flashOptions.attributes.id = flashID;
        this.options.flashOptions.variables.playerId = this.playerId;
        this.options.flashOptions.variables.src = this.sources.flashVideo;
        this.options.flashOptions.variables.autoplay = this.options.videoOptions.autoplay;

        // embed the SWF
        var self = this;
        swfobject.embedSWF( this.options.flashOptions.swf,
                            replaceID,
                            this.options.width,
                            this.options.height,
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

    _createControls: function() {
        if( this.controlsClasses ) {
            if( this.controlsClasses.length > 0 ) {
                this.controlsContainer = DOMUtil.createElement( 'div', { className:'fdl-controls' }, this.container );
                this.controlsContainer.onmousedown = function(){return false;};
                this.controlsContainer.onselectstart = function(){return false;};
                this.controls = new FControls(this.model, this, this.controlsContainer, this.controlsClasses);
            }
        }
    },

    _findFlashPlayer: function(flashID) {
        var self = this;
        self.flashFinderInterval = setInterval(function() {
            var flash_element = $('#' + flashID);
            if(flash_element.length > 0) {
                self.setVideo( flash_element.get(0) );
                self._checkReady();
                clearInterval(self.flashFinderInterval);
            }
        }, 10);
    },

    _createVideoProxy: function() {
        if( this._useHTMLVideo ) { return new HTMLVideoProxy( this.model, this, this._videoElement ); }
        else { return new FlashVideoProxy( this.model, this, this._videoElement ); }
    },

    _enterFullscreen: function() {
        $(this.container).addClass('fdl-fullscreen');
    },
    
    _exitFullscreen: function() {
        $(this.container).removeClass('fdl-fullscreen');
    },

    _addModelListeners: function() {
        $(this.model.dispatcher).bind(FVideoModel.EVENT_RESIZE, this._handleResize.context(this) );
        $(this.model.dispatcher).bind(FVideoModel.EVENT_PLAYER_STATE_CHANGE, this._handleStateChange.context(this) );
        $(this.model.dispatcher).bind(FVideoModel.EVENT_TOGGLE_FULLSCREEN, this._handleFullscreen.context(this) );
    },

    // applies the current state as a css class to the video container
    _handleStateChange: function() {
        $(this.container).removeClass(this._lastState);
        this._lastState = this.model.getPlayerState();
        $(this.container).addClass(this._lastState);
    },

    _handleResize: function() {
        var wv = this.model.getWidth();
        var hv = this.model.getHeight();
        var wStr = typeof wv == 'string' ? wv : wv + "px";
        var hStr = typeof hv == 'string' ? hv : hv + "px";
        this.container.style.width = wStr;
        this.container.style.height = hStr;
    },

    _handleFullscreen: function() {
        if( this.model.getFullscreen() ) {
            this._enterFullscreen();
        }
        else {
            this._exitFullscreen();
        }
    }
});

// events
FVideo.EVENT_PLAYER_READY = "FVideo:PlayerReady";

// this value allows default controls to be specified for all video instances created.
// when constructing a new instance and no controls are passed into the constructor, the player will check
// for this variable and use these if defined.
FVideo.defaultControls = null;

// class variable for storing all created FVideo instances on the page.
FVideo.instances = {};

/**
 * Searches the DOM and creates and activates all video players on the page.
 * @param $callback
 */
FVideo.activateAll = function( $callback ) {
    
    $('.fdl-video').each( function() {

        var video = $('video', this).get(0);
        video.pause();
        video.src = '';
        if( EnvironmentUtil.firefox_3 ) {
                this.load();        // initiate new load, required in FF 3.x as noted at http://blog.pearce.org.nz/2010/11/how-to-stop-video-or-audio-element.html
        }


        var sourceList = new FVideoSources();
        var sources = $('source', video ).each(function() {
            sourceList.addVideo( this.src, this.type, this.getAttribute('data-label'), this.getAttribute('data-flash-default') || false );
        });

        var videoOptions = {};
        var flashSwf;
        var callback;
        if( video.width ){ videoOptions.width = video.width; }
        if( video.height ){ videoOptions.height = video.height; }
        if( video.getAttribute('data-flash-swf')){ flashSwf = video.getAttribute('data-flash-swf'); }
        if( video.getAttribute('data-controls')){ videoOptions.controls = video.getAttribute('data-controls'); }
        if( video.getAttribute('data-volume')){ videoOptions.volume = video.getAttribute('data-volume'); }
        if( video.getAttribute('data-autoplay')){ videoOptions.autoplay = video.getAttribute('data-autoplay'); }
        if( video.getAttribute('data-preload')){ videoOptions.preload = video.getAttribute('data-preload'); }
        if( video.getAttribute('data-loop')){ videoOptions.loop = video.getAttribute('data-loop'); }
        if( video.getAttribute('data-poster')){ videoOptions.poster = video.getAttribute('data-poster'); }
        if( video.getAttribute('data-src')){ videoOptions.src = video.getAttribute('data-src'); }


        // TODO: add attribute for comma-separated class list for the controls.
        var controls = video.getAttribute('data-controls-list');
        if( controls !== undefined && controls !== null ) {
            controls = controls.replace(' ','');
            var classList = controls.split(',');
        }

        // create options for video
        var options = new FVideoConfiguration( video.width, video.height, videoOptions, flashSwf );

        // clear out container contents
        this.innerHTML = '';

        // create new FVideo obj
        var fVideo = new FVideo( this, options, sourceList, classList, $callback );
    });
};


/**
 * Applies a hash of name/value pairs as attributes on an HTMLElement.
 * @param $elem The HTMLElement to apply attributes to
 * @param $attr An object populated with name/value pairs to map as attributes onto the HTMLElement
 */
FVideo.applyAttributes = function( $elem, $attr ) {
    for( var it in $attr ) {
        it = it.toLowerCase();
        if( it == 'width' || it == 'height' ){
            $elem[it] = parseInt( $attr[it], 10 ); 
        }
//        else if( it.match(/poster/i) != null && FUserEnvironment.iOS && FUserEnvironment.iOS_3 ) {
            // ignore the 'poster' attribute on iOS
//            alert('ignoring poster!');
//        }
        // make sure we only map values that aren't false
        else if( $attr[it] && typeof $attr[it] === 'string' ) {
            if( $attr[it].toLowerCase() !== 'false' ) {
                $elem[it] = $attr[it];
            }
        }
        else if( $attr[it]) {
            $elem[it] = $attr[it];
        } 
    }
};


//    At time of writing (May 20, 2010), the iPad has a bug that prevents it from noticing anything but the first video source
//    listed. Sadly, this means you will need to list your MP4 file first, followed by the free video formats. Sigh.
//
//    http://diveintohtml5.org/video.html
//
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