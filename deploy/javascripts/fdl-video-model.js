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
};

// events
FVideoModel.EVENT_RESIZE = "FVideoModelEvent:Resize";
FVideoModel.EVENT_TIME_UPDATE = "FVideoModelEvent:TimeUpdate";
FVideoModel.EVENT_VOLUME_UPDATE = "FVideoModelEvent:VolumeUpdate";
FVideoModel.EVENT_PLAY_STATE_CHANGE = "FVideoModelEvent:PlayStateChange";
FVideoModel.EVENT_PLAYER_STATE_CHANGE = "FVideoModelEvent:PlayerStateChange";

FVideoModel.prototype = {
    
    getWidth: function() { return this._width },
    setWidth: function( $value ) {
        this._width = $value;
        this.video.sendEvent(FVideoModel.EVENT_RESIZE);
    },

    getHeight: function() { return this._height },
    setHeight: function( $value ) {
        this._height = $value;
        this.video.sendEvent(FVideoModel.EVENT_RESIZE);
    },

    getVolume: function() { return this._volume; },
    setVolume: function( $value ) {
        // normalize value
        $value = ( $value > 1 ) ? 1 : ( $value < 0 ) ? 0 : $value;
        this._volume = $value;
        this.video.sendEvent(FVideoModel.EVENT_VOLUME_UPDATE);
    },

    getTime: function() { return this._time; },
    setTime: function( $t ) {
        this._time = $t;
        this.video.sendEvent(FVideoModel.EVENT_TIME_UPDATE);
    },

    getPlaying: function() { return this._playing; },
    setPlaying: function( $playing ) {
        this._playing = $playing;
        this.video.sendEvent(FVideoModel.EVENT_PLAY_STATE_CHANGE);
    },

    getPlayerState: function() { return this._playerState; },
    setPlayerState: function( $state ) {
        this._playerState = $state;
        this.video.sendEvent(FVideoModel.EVENT_PLAYER_STATE_CHANGE);
    }
};