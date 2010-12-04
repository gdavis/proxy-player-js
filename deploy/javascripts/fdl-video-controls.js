var FVideoControls = function( $fVideoInstance ) {
    this.fVideo = $fVideoInstance;
    this.container = FVideo.createElement( 'div', { class:'fdl-controls' }, this.fVideo.container );
    this.bigPlayButton = FVideo.createElement( 'div', { class:'fdl-big-play-button' }, this.container );
    this.controlsBar = FVideo.createElement( 'div', { class:'fdl-controls-bar' }, this.container );
    this.playButton = false;
    this.stopButton = false;
    this.progressBar = false;
    this.volumeButton = false;
    this.fullscreenButton = false;
    this.buildControls();
    this.setupInteractionHandlers();
    this.addModelListeners();
    this.position();
};

FVideoControls.prototype = {

    buildControls: function() {
        this.playButton = FVideo.createElement('div',{ class:'fdl-play-pause' }, this.controlsBar );
        this.stopButton = FVideo.createElement('div',{ class:'fdl-stop' }, this.controlsBar );
        this.progressBar = FVideo.createElement('div',{ class:'fdl-progress-bar' }, this.controlsBar );
        this.volumeButton = FVideo.createElement('div',{ class:'fdl-volume' }, this.controlsBar );
        this.fullscreenButton = FVideo.createElement('div',{ class:'fdl-fullscreen' }, this.controlsBar );
    },

    setupInteractionHandlers: function() {
        var self = this;
        $(this.playButton).click(function(){ self.fVideo.play() });
        $(this.stopButton).click(function(){ self.fVideo.stop() });
    },

    addModelListeners: function() {
        var self = this;
        $(this.fVideo.container).bind(FVideoModel.EVENT_PLAY_STATE_CHANGE, function(){ self.updatePlayButton() });
    },

    updatePlayButton: function() {
        if( this.fVideo.model.getPlaying() ) {
            $(this.playButton).removeClass('paused');
            $(this.playButton).addClass('playing');
        }
        else {
            $(this.playButton).removeClass('playing');
            $(this.playButton).addClass('paused');
        }
    },

    position: function() {
        var children = this.controlsBar.childNodes;
        var dl = children.length;
        var sum = 0;
        for( var i=0; i<dl; i++) sum += children[i].offsetWidth;
        this.progressBar.style.width = this.container.offsetWidth - sum + "px";
    }
};