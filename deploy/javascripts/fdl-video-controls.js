var FVideoControls = Class.create({
    initialize: function( $fVideoInstance ) {
        this.fVideo = $fVideoInstance;
        this.container = false;
        this.bigPlayButton = false;
        this.controlsBar = false;
        this.playButton = false;
        this.stopButton = false;
        this.progressBar = false;
        this.timeDisplay = false;
        this.volumeDisplay = false;
        this.fullscreenButton = false;
        this.buildControls();
        this.setupInteractionHandlers();
        this.addModelListeners();
        this.position();
    },

    buildControls: function() {

        // build main containers.
        this.container = DOMUtil.createElement( 'div', { className:'fdl-controls' }, this.fVideo.wrapper );
        this.bigPlayButton = DOMUtil.createElement( 'div', { className:'fdl-big-play-button' }, this.container );
        this.controlsBar = DOMUtil.createElement( 'div', { className:'fdl-controls-bar' }, this.container );

        // create controls
        this.playButton = DOMUtil.createElement('div',{ className:'fdl-play-pause' }, this.controlsBar );
        this.stopButton = DOMUtil.createElement('div',{ className:'fdl-stop' }, this.controlsBar );

        this.progressBar = DOMUtil.createElement('div',{ className:'fdl-progress-bar' }, this.controlsBar );
        new FProgressBar( this.progressBar, this.fVideo );

        this.timeDisplay = DOMUtil.createElement('div',{ className:'fdl-time-display' }, this.controlsBar);
        new FTimeDisplay( this.timeDisplay, this.fVideo );

        this.volumeDisplay = DOMUtil.createElement('div',{ className:'fdl-volume-display' }, this.controlsBar);
        new FVolume( this.volumeDisplay, this.fVideo );

        this.fullscreenButton = DOMUtil.createElement('div',{ className:'fdl-fullscreen' }, this.controlsBar );
        new FFullscreen( this.fullscreenButton, this.fVideo );
    },

    setupInteractionHandlers: function() {
        var self = this;
        $(this.playButton).click(function(){ self.fVideo.play(); });
        $(this.stopButton).click(function(){ self.fVideo.stop(); });

        // prevent dragging
        this.container.onmousedown = function(){return false;};
        this.container.onselectstart = function(){return false;}
    },

    addModelListeners: function() {
        var self = this;
        $(this.fVideo.container).bind(FVideoModel.EVENT_PLAY_STATE_CHANGE, function(){ self.updatePlayButton(); });
        $(this.fVideo.container).bind(FVideoModel.EVENT_RESIZE, function(){ self.position(); });
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
        for( var i=0; i<dl; i++) {
            if(children[i] !== this.progressBar )
                sum += children[i].offsetWidth;
        }
        this.progressBar.style.width = Math.floor( this.container.offsetWidth - sum ) + "px";

        // redispatch a resize event off the top-level container.
        // this allows the progress bar and other controls to update individually.
        $(this.fVideo.container).trigger('resize');
    }
});