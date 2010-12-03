/**
 * FactoryVideo
 *
 * Requirements:
 *  jQuery library (1.4.4):
 *      https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js
 *  SWFObject (2.2)
 *      https://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js
 *
 */

/**
 * Creates an FVideo instance.
 * @param $element
 * @param $swfPlayerPath
 * @param $videoOptions
 * @param $flashOptions
 */

//var FVideo = function( $element, $swfPlayerPath, $videoOptions, $flashOptions, $readyCallback ) {
var FVideo = function( $element, $options, $sources, $readyCallback ) {

    this.EVENT_PLAYER_READY = "FVideo:PlayerReady";

    // lookup the main video container
    if (typeof $element === 'string' ) {
        this.container = $( $element ).get(0);
    } else {
        this.container = $element;
    }

    this.readyCallback = $readyCallback;

    // proxy object used to communicate to either an HTML5 video object or a Flash player.
    this.model = false;
    this._proxy = false;
    this._useHTMLVideo = true;

    // find the player div
    this.player = document.createElement('div');
    this.player.className = "player";
    this.container.appendChild( this.player );

    // create a uniquely named player container for the video. used for flash fallback
    this.playerId = parseInt( Math.random() * 100000 );

    // variable which contains a reference to either the <video> element for an HTML5 environment, or a flash <object> element.
    this._videoElement = false;

    this._options = $options;
    this._sources = $sources;

    /*
    // setup video options
    this._videoOptions = FVideo.mergeOptions( this.DEFAULT_VIDEO_OPTIONS, $videoOptions );

    // setup flash options
    this._flashSWF = $swfPlayerPath || this.DEFAULT_FLASH_SWF;
    this._flashOptions = FVideo.mergeOptions( this.DEFAULT_FLASH_OPTONS, $flashOptions );
    if( this._videoOptions.src !== undefined ) this._flashOptions.variables.src = this._videoOptions.src;
    this._flashOptions.variables.playerId = this.playerId;
    */

    // store this instance
    FVideo.instances[this.playerId] = this;

    // setup player
    this._init();
};

// define object API
FVideo.prototype = {

    //////////////////////////////////////////////////////////////////////////////////
    // Public API
    //////////////////////////////////////////////////////////////////////////////////

    /**
     * Adds a child <source> element to the video tag to specify multiple file types for the player.
     *
     * NOTE: For iPads, be sure you add the mp4 first since the player will break if it is not the first item in the <source> list.
     *
     * @param $path Path to the video file.
     * @param $type The type (MIME type) of the video located at the source path. e.g. 'video/mp4', 'video/ogg'.
     */
    addVideoSource: function( $path, $type ) {
        this._proxy.addVideoSource( $path, $type );
    },

    /**
     * Begins loading media.
     */
    load: function() {
        this._proxy.load();
    },

    /**
     * Begins playback.
     * Takes multiple parameters. Can either specify a single URL by string, or an index value if a list of source elements were supplied.
     */
    play: function( $url ) {
        if( $url ) {
            this._proxy.play( $url );
            console.log('js: playing new video');
        }
        else {
            if( this.model.getPlaying() ) {
                console.log('js: pausing video');
                this._proxy.pause();
            }
            else {
                console.log('js: resuming video');
                this._proxy.play();
            }
        }
    },

    pause: function() {
        this._proxy.pause();
    },

    stop: function() {
        this._proxy.stop();
    },

    seek: function( $time ) {
        this._proxy.seek( parseFloat( $time ));
    },
    
    updateVolume: function( $volume ) {
        this.model.setVolume( $volume );
    },

    getWidth: function() { return this.model.getWidth(); },
    setWidth: function( $width ) {
        this.model.setWidth( $width );
    },

    getHeight: function() { return this.model.getHeight(); },
    setHeight: function( $height ) {
        this.model.setHeight( $height );
    },

    getTime: function() { return this._proxy.getTime(); },

    getVolume: function() { return this.model.getVolume(); },
    setVolume: function( $vol ) {
        this.model.setVolume( $vol );
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

    /**
     * Dispatches DOM events
     * @param $type
     */
    sendEvent: function($type, $params ) {
        $(this.container).trigger($type);
    },

    destroy: function() {
        if( this.player ) {
            if( this.player.parentNode ) {
                console.log('remove me!');
                this.player.parentNode.removeChild( this.player );
            }
        }
    },

    //////////////////////////////////////////////////////////////////////////////////
    // Methods called from Flash
    //////////////////////////////////////////////////////////////////////////////////

    _ready: function() {
        console.log('js: flash is ready');

        // create the proxy object once our video is ready to receive commands
        this._proxy = this._createVideoProxy();

        // create source tags
        var dl = this._sources.videos.length;
        for( var i = 0; i<dl; i++ ) {
            var source = this._sources.videos[ i ];
            this.addVideoSource( source.file, source.type );
        }

        // sync relevant values from the player onto the model.
        // by setting these on the model we also dispatch events which update the UI to its default state.
        this.model.setVolume( this._proxy.getVolume() );
        this.model.setWidth( this._options.width );
        this.model.setHeight( this._options.height );

        // fire ready callback.
        this.readyCallback();

        // fire DOM event
        this.sendEvent(this.EVENT_PLAYER_READY);
    },

    _updatePlayheadTime: function( $time ){
//        console.log('js: _updatePlayheadTime = ' + $time );
        this.model.setTime( $time );
    },

    _updateDuration: function( $duration ) {
        console.log('js: _updateDuration = ' + $duration );
        this.model.setDuration( $duration );
    },

    _updateIsPlaying: function( $value ) {
        console.log('js: _setIsPlaying ' + $value );
        this.model.setPlaying( $value );
    },

    _updatePlayerState: function( $state ) {
        console.log('js: _setPlayerState = ' + $state );
        this.model.setPlayerState( $state );
    },

    _complete: function() {
        console.log('js: complete');
    },

    _updateLoadProgress: function( $bytesLoaded, $bytesTotal ) {
        console.log('js: _updateLoadProgress( ' + $bytesLoaded + ', ' + $bytesTotal + ' )' );
        this.model.setBytesTotal( $bytesTotal );
        this.model.setBytesLoaded( $bytesLoaded );
    },


    //////////////////////////////////////////////////////////////////////////////////
    // Private API
    //////////////////////////////////////////////////////////////////////////////////

    _init: function() {
        this._useHTMLVideo = this._canBrowserPlayVideo();
        this._videoElement = this._createVideo();
        this.model = new FVideoModel( this );
        this._addModelListeners();
        if( this._useHTMLVideo ) this._ready();
    },

    _addModelListeners: function() {
        var self = this;
        $(this.container).bind(FVideoModel.EVENT_RESIZE, function() { self._handleResize(); });
    },

    _canBrowserPlayVideo: function() {
        var vid = document.createElement('video');
        var canPlay = vid.play;
        delete vid;
        return canPlay;
//        return false;
    },

    _createVideo: function() {
        if( this._useHTMLVideo ) return this._createHTMLVideoObject();
        else return this._createFlashVideoObject();
    },

    /**
     * returns a <video> object tag
     */
    _createHTMLVideoObject: function() {
        var video = document.createElement('video');
        FVideo.applyAttributes( video, this._options.videoOptions );
        this._createSourceAnchors( video );
        $( this.player ).append( video );
        return video;
    },

    _createSourceAnchors: function( $el ) {
        // write anchor fallback tags
        var dl = this._sources.videos.length;
        for( var i = 0; i < dl; i++ ) {
            var source = this._sources.videos[ i ];
            var anchor = document.createElement('a');
            anchor.href = source.file;
            anchor.setAttribute('data-type', source.type);
            anchor.innerHTML = source.label;
            $el.appendChild( anchor );
        }
    },

    /**
     * returns a flash <object> tag
     */
    _createFlashVideoObject: function() {

        // create empty div for swfobject to replace
        var div = document.createElement('div');
        div.id = "fdl-player-" + this.playerId;
        $( this.player ).append( div );

        // embed the SWF
        var self = this;
        swfobject.embedSWF( this._options.flashOptions.swf,
                            "fdl-player-" + this.playerId,
                            this._options.width,
                            this._options.height,
                            this._options.flashOptions.version,
                            this._options.flashOptions.expressInstall,
                            this._options.flashOptions.variables,
                            this._options.flashOptions.params,
                            this._options.flashOptions.attributes,
                            function( $e ) { self._videoElement = $e.ref; }
                            );
        // we don't yet have access to the object tag, so it is directly set in the callback method from embedding the SWF
        return null;
    },

    _createVideoProxy: function() {
        if( this._useHTMLVideo ) return new HTMLVideoProxy( this, this.container, this._videoElement );
        else return new FlashVideoProxy( this, this.container, this._videoElement );
    },

    _handleResize: function() {
        var wv = this.model.getWidth();
        var hv = this.model.getHeight();
        var wStr = typeof wv == 'string' ? wv : wv + "px";
        var hStr = typeof hv == 'string' ? hv : hv + "px";
        $( this.container ).css({width:wStr, height:hStr});
    }
};

/**
 * Hash which stores all created instances of FVideo objects.
 * @param $type
 */
FVideo.instances = {};

FVideo.activateAll = function() {

    $('.fdl-video').each( function() {
        var video = $('video', this).get(0);
        var sourceList = new FVideoSources();
        var attrs = video.attributes;
        var sources = $('source', video ).each(function() {
            sourceList.addVideo( this.src, this.type, this.readAttribute('data-label'));
        });

        console.log('loop');
        console.log(video.attributes);

        var videoOptions = {};

        // create options for video
        // $width, $height, $videoOptions, $swf, $variables, $parameters, $attributes ){
//        this._options = new FVideoConfiguration( video.width, video.height, );

        // create new FVideo obj

    });

};


/**
 * Applies a hash of name/value pairs as attributes on an HTMLElement.
 * @param $elem The HTMLElement to apply attributes to
 * @param $attr An object populated with name/value pairs to map as attributes onto the HTMLElement
 */
FVideo.applyAttributes = function( $elem, $attr ) {
    for( var it in $attr ) {
        if( it.toLowerCase() == 'width' || it.toLowerCase() == 'height' ) $elem[it] = parseInt( $attr[it] );
        // make sure we only map values that aren't false
        else if( $attr[it] && typeof $attr[it] === 'string' ) {
            if( $attr[it].toLowerCase() !== 'false' )
                $elem[it] = $attr[it];
        }
        else if( $attr[it]) $elem[it] = $attr[it];
    }
};


/**
 * Creates and returns a new object from two sets of objects by combining and overwriting values from the modified object.
 * @param $original
 * @param $modified
 */
FVideo.mergeOptions = function( $original, $modified ) {
    if( $modified === undefined ) return $original;
    var obj = {};
    var it;
    // map original values.
    for( it in $original ) {
        obj[it] = $original[it];
    }
    // loop through all the modified options and overwrite the original value.
    for( it in $modified ) {
        // recurse through child objects
        if(typeof $modified[it] === 'object' ) {
            obj[it] = FVideo.mergeOptions($original[it], $modified[it])
        } else {
            obj[it] = $modified[it];
        }
    }
    return obj;
};

/*
At time of writing (May 20, 2010), the iPad has a bug that prevents it from noticing anything but the first video source
listed. Sadly, this means you will need to list your MP4 file first, followed by the free video formats. Sigh.

http://diveintohtml5.org/video.html
*/


/*
From: http://camendesign.com/code/video_for_everybody

1. Ensure your server is using the correct mime-types. Firefox will not play the Ogg video if the mime-type is wrong. Place these lines in your .htaccess file to send the correct mime-types to browsers

AddType video/ogg  .ogv
AddType video/mp4  .mp4
AddType video/webm .webm

2. Replace "__VIDEO__.MP4" with the path to your video encoded to MP4 (a warning on using H.264) and
replace "__VIDEO__.OGV" with the path to your video encoded to Ogg.
Optionally you could also include a WebM video.

3. Replace "__POSTER__.JPG" with the path to an image you want to act as a title screen to the video, it will be shown before the video plays, and as a representative image when the video is unable to play (Also replace “__TITLE__” for the poster image’s alt text). Not all browsers support the poster attribute, it’s advisable to encode the poster image into the first frame of your video.

DO NOT INCLUDE THE poster ATTRIBUTE (<video poster="…">) FOR iPad / iPhone 3.x SUPPORT. There is a major bug with iPhone OS 3 that means that playback will not work on any HTML5 video tag that uses both the poster attribute and <source> elements. This was fixed in iPhone OS 4.0, but of course for now there will still be a large number of OS 3 users. This bug does not affect use of the poster image in the flashvars parameter, which you should retain

4. Replace "__FLASH__.SWF" with the path to the Flash video player you are using. I use JW Player (download and place ‘player.swf’ in the right place), but this could be any Flash resource including YouTube. Sample code for using YouTube can be seen on the Video for Everybody YouTube Test Page

5. Safari buffers the video automatically even if autobuffer is absent. This has been fixed in WebKit nightlies with a change to the HTML5 spec; the “preload="none"” attribute on the video element prevents autobuffering. A current bug in WebKit causes Safari to perpetually display “loading” until the play button is clicked

6. The iPhone will not autoplay. This is done to save bandwidth which may cost some users.
It is not a bug, it’s a feature

7. HTML5 video on Android, even the latest version, is badly broken. Resolution support varies from one handset to the next, usually the fallback image doesn’t show and the code requires special adjustments. The Android emulator is completely useless. THERE IS NO WAY TO TEST ON ANDROID WITHOUT A PHYSICAL PHONE. BLAME GOOGLE. I would love to update the code to work better with Android, but until Google fixes their code or sends me a phone, I can’t do that. They’ve had only three years to do it so far

8. Some web hosts, in trying to save bandwidth, gzip everything by default—including video files! In Firefox and Opera, seeking will not be possible or the video may not play at all if a video file is gzipped. If this is occurring to you please check your server / hosts and disable the gzipping of Ogg and other media files. You can switch off gzipping for video files in your .htaccess file by adding this line:

SetEnvIfNoCase Request_URI \.(og[gv]|mp4|m4v|webm)$ no-gzip dont-vary

With thanks to Bas van Bergen for this tip

9. There are some instances where people will simply not be able to view the video inside the web-page (e.g. Opera Mobile / Mini). It is absolutely essential that you provide download links outside of the video to ensure your message gets through

10. A current bug in Firefox means that when JavaScript is disabled (NoScript for example) the video controls do not display. For now, right-click on the video for the controls, use autoplay on your videos or rely on users allowing your site in NoScript

11. The Eolas ‘Click to Activate’ issue affects Flash / QuickTime in Internet Explorer 6 / 7 as the ActiveX controls are not inserted using JavaScript—however Microsoft removed ‘Click to Activate’ in a later update patch. This issue will not affect users who have run Windows Update

12. A parsing bug in Camino 2.0 / Firefox 3.0 means that the image element inside the video element will ‘leak’ outside of the video element. This is not visible however unless some kind of background image or colour is applied to that image element. You can stop this by either wrapping the video element in another element or modifying the code from “<source … />” to “<source …></source>”. This works, but will not validate as HTML5

*/