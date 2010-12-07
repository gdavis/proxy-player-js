var FVideoModel = function( $fVideo ) {
    // properties
    this.video = $fVideo;
    this.isIE = false;
    this.isMoz = false;
    this.isWebkit = false;
    this._volume = 1;
    this._time = 0;
    this._duration = 0;
    this._width = 0;
    this._height = 0;
    this._playing = false;
    this._playerID = false;
    this._playerState = false;
    this._bytesLoaded = 0;
    this._bytesTotal = 0;
};

// events
FVideoModel.EVENT_RESIZE                = "FVideoModelEvent.Resize";
FVideoModel.EVENT_METADATA              = "FVideoModelEvent.Metadata";
FVideoModel.EVENT_TIME_UPDATE           = "FVideoModelEvent.TimeUpdate";
FVideoModel.EVENT_LOAD_PROGRESS         = "FVideoModelEvent.LoadProgress";
FVideoModel.EVENT_VOLUME_UPDATE         = "FVideoModelEvent.VolumeUpdate";
FVideoModel.EVENT_PLAY_STATE_CHANGE     = "FVideoModelEvent.PlayStateChange";
FVideoModel.EVENT_PLAYER_STATE_CHANGE   = "FVideoModelEvent.PlayerStateChange";

// states
FVideoModel.STATE_CONNECTING            = "FVideoModelEvent.Connecting";
FVideoModel.STATE_BUFFERING             = "FVideoModelEvent.Buffering";
FVideoModel.STATE_PLAYING               = "FVideoModelEvent.Playing";
FVideoModel.STATE_STOPPED               = "FVideoModelEvent.Stopped";
FVideoModel.STATE_PAUSED                = "FVideoModelEvent.Paused";
FVideoModel.STATE_SEEKING               = "FVideoModelEvent.Seeking";

FVideoModel.prototype = {

    getWidth: function() { return this._width },
    setWidth: function( $value ) {
        if( this._width === $value ) return;
        this._width = $value;
        this.video.sendEvent(FVideoModel.EVENT_RESIZE);
    },

    getHeight: function() { return this._height },
    setHeight: function( $value ) {
        if( this._height === $value ) return;
        this._height = $value;
        this.video.sendEvent(FVideoModel.EVENT_RESIZE);
    },

    getVolume: function() { return this._volume; },
    setVolume: function( $value ) {
        // normalize value
        $value = ( $value > 1 ) ? 1 : ( $value < 0 ) ? 0 : $value;
        if( this._volume == $value ) return;
        this._volume = $value;
        this.video.sendEvent(FVideoModel.EVENT_VOLUME_UPDATE);
    },

    getTime: function() { return this._time; },
    setTime: function( $value ) {
        if( this._time == $value ) return;
        this._time = $value;
        this.video.sendEvent(FVideoModel.EVENT_TIME_UPDATE);
    },

    getDuration: function() { return this._duration; },
    setDuration: function( $value ) {
        if( this._duration == $value ) return;
        this._duration = $value;
        this.video.sendEvent(FVideoModel.EVENT_TIME_UPDATE);
    },

    getPlaying: function() { return this._playing; },
    setPlaying: function( $value ) {
        if( this._playing == $value ) return;
        this._playing = $value;
        this.video.sendEvent(FVideoModel.EVENT_PLAY_STATE_CHANGE);
    },

    getPlayerState: function() { return this._playerState; },
    setPlayerState: function( $value ) {
        if( this._playerState === $value ) return;
        this._playerState = $value;
        this.video.sendEvent(FVideoModel.EVENT_PLAYER_STATE_CHANGE);
    },

    getBytesLoaded: function() { return this._bytesLoaded },
    setBytesLoaded: function( $value ) {
        if( this._bytesLoaded == $value ) return;
        this._bytesLoaded = $value;
        this.video.sendEvent(FVideoModel.EVENT_LOAD_PROGRESS);
    },

    getBytesTotal: function() { return this._bytesTotal },
    setBytesTotal: function( $value ) {
        if( this._bytesTotal == $value ) return;
        this._bytesTotal = $value;
        this.video.sendEvent(FVideoModel.EVENT_LOAD_PROGRESS);
    }

};