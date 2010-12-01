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
var FVideo = function( $element, $swfPlayerPath, $videoOptions, $flashOptions, $readyCallback ) {

    this.EVENT_PLAYER_READY = "FVideo:PlayerReady";

    // "constants"
    this.DEFAULT_VIDEO_OPTIONS =        {   audio: false,
                                            autoplay: true,
                                            controls: false,
                                            width:"320px",
                                            height:"240px",
                                            loop: false,
                                            preload: true,
                                            src: false,
                                            poster: false
                                            };
    this.DEFAULT_FLASH_SWF =            "/media/swfs/fdl-player.swf";
    this.DEFAULT_FLASH_ATTRIBUTES =     {   bgcolor:"#666" };
    this.DEFAULT_FLASH_PARAMS =         {   scale:"noscale",
                                            allowScriptAccess:"always",
                                            quality:"best",
                                            wmode:"opaque",
                                            allowFullScreen:"true"
                                            };
    this.DEFAULT_FLASH_OPTONS =         {   expressInstall:"/media/swfs/expressinstall.swf",
                                            version:"10",
                                            width: "320px",
                                            height: "240px",
                                            variables: {},
                                            params: this.DEFAULT_FLASH_PARAMS,
                                            attributes: this.DEFAULT_FLASH_ATTRIBUTES
                                            };

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

    // setup video options
    this._videoOptions = FVideo.mergeOptions( this.DEFAULT_VIDEO_OPTIONS, $videoOptions );

    // setup flash options
    this._flashSWF = $swfPlayerPath || this.DEFAULT_FLASH_SWF;
    this._flashOptions = FVideo.mergeOptions( this.DEFAULT_FLASH_OPTONS, $flashOptions );
    if( this._videoOptions.src !== undefined ) this._flashOptions.variables.src = this._videoOptions.src;
    this._flashOptions.variables.playerId = this.playerId;

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
        this._proxy.seek( $time );
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
    setTime: function( $newTime ) {
        this.model.setTime( $newTime );
    },

    getVolume: function() { return this.model.getVolume(); },
    setVolume: function( $vol ) {
        this.model.setVolume( $vol );
    },

    setIsPlaying: function( $value ) {
        console.log('js: setIsPlaying ' + $value );
        this.model.setPlaying( $value );
    },

    /**
     * Dispatches DOM events
     * @param $type
     */
    sendEvent: function($type, $params ) {
        $(this.container).trigger($type);
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

    _ready: function() {
        // create the proxy object once our video is ready to receive commands
        this._proxy = this._createVideoProxy();

        // sync relevant values from the player onto the model.
        // by setting these on the model we also dispatch events which update the UI to its default state.
        this.model.setVolume( this._proxy.getVolume() );
        this.model.setWidth( this._videoOptions.width );
        this.model.setHeight( this._videoOptions.height );

        // fire ready callback.
        this.readyCallback();

        // fire DOM event
        this.sendEvent(this.EVENT_PLAYER_READY);
    },

    _canBrowserPlayVideo: function() {
        var vid = document.createElement('video');
        var canPlay = vid.play;
        delete vid;
//        return canPlay;
        return false;
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
        FVideo.applyAttributes( video, this._videoOptions );
        $( this.player ).append( video );
        return video;
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
        swfobject.embedSWF( this._flashSWF,
                            "fdl-player-" + this.playerId,
                            this._videoOptions.width,
                            this._videoOptions.height,
                            this._flashOptions.version,
                            this._flashOptions.expressInstall,
                            this._flashOptions.variables,
                            this._flashOptions.params,
                            this._flashOptions.attributes,
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