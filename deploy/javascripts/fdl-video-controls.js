var FVideoControls = Class.create({
    
    initialize: function( $fVideoInstance ) {
        this.fVideo = $fVideoInstance;

        // for android and iOS, we don't need to use HTML controls.
        if( FUserEnvironment.iOS || FUserEnvironment.android ) {

            // for android, wire up a manual click-to-play handler
            if( FUserEnvironment.android ) {
                $('video',this.fVideo.container).click(function() {
                    this.play();
                });
            }
        }
        // otherwise build controls as normal.
        else {
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
            this.addModelListeners();
            this.updatePlayButton();
            this.position();
        }
    },

    buildControls: function() {
        this.buildContainer();
        this.buildHitArea();
        this.buildVideoPlayButton();
        this.buildControlsBar();
    },

    buildContainer: function() {
        this.container = DOMUtil.createElement( 'div', { className:'fdl-controls' }, this.fVideo.container );
        this.container.onmousedown = function(){return false;};
        this.container.onselectstart = function(){return false;};
    },

    buildHitArea: function() {
        var self = this;
        this.hitArea = DOMUtil.createElement( 'div', {className:'fdl-hit-area' }, this.container );
        $(this.hitArea).click(function() { self.fVideo.play(); });
    },

    buildVideoPlayButton: function() {
        var self = this;
        this.videoPlayButton = DOMUtil.createElement( 'div', { className:'fdl-video-play-button' }, this.container );
        $(this.videoPlayButton).click(function(){ self.fVideo.play(); });
        var img = DOMUtil.createElement('img', { src:"images/video-play-button.png" }, this.videoPlayButton );
        img.onload = function() {
            $(this).css({marginLeft: $(this).width() * -.5 + "px", marginTop: $(this).height() * -.5 + "px"});
        }
    },
    
    buildControlsBar: function() {
        this.controlsBar = DOMUtil.createElement( 'div', { className:'fdl-controls-bar' }, this.container );
        this.buildPlayButton();
        this.buildStopButton();
        this.buildProgressBar();
        this.buildTimeDisplay();
        this.buildVolumeDisplay();
        this.buildFullscreenButton();
    },

    buildPlayButton: function() {
        var self = this;
        this.playButton = DOMUtil.createElement('div',{ className:'fdl-play-pause' }, this.controlsBar );
        $(this.playButton).click(function(){ self.fVideo.play(); });
    },

    buildStopButton: function() {
        var self = this;
        this.stopButton = DOMUtil.createElement('div',{ className:'fdl-stop' }, this.controlsBar );
        $(this.stopButton).click(function(){ self.fVideo.stop(); });
    },

    buildProgressBar: function() {
        this.progressBar = DOMUtil.createElement('div',{ className:'fdl-progress-bar' }, this.controlsBar );
        new FProgressBar( this.progressBar, this.fVideo );
    },

    buildTimeDisplay: function() {
        this.timeDisplay = DOMUtil.createElement('div',{ className:'fdl-time-display' }, this.controlsBar);
        new FTimeDisplay( this.timeDisplay, this.fVideo );
    },

    buildVolumeDisplay: function() {
        this.volumeDisplay = DOMUtil.createElement('div',{ className:'fdl-volume-display' }, this.controlsBar);
        new FVolume( this.volumeDisplay, this.fVideo );
    },

    buildFullscreenButton: function() {
        this.fullscreenButton = DOMUtil.createElement('div',{ className:'fdl-fullscreen' }, this.controlsBar );
        new FFullscreen( this.fullscreenButton, this.fVideo );
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
        var child;
        var dl = children.length;
        var sum = 0;
        for( var i=0; i<dl; i++) {
            child = children[i];
            if(child !== this.progressBar ) {
                sum += child.offsetWidth;
            }
        }
        $(this.progressBar).css({width:Math.floor( this.container.offsetWidth - sum ) + "px" });

        // redispatch a resize event off the top-level container.
        // this allows the progress bar and other controls to update individually.
        $(this.fVideo.container).trigger('resize');
    }
});


var CustomControls = Class.create( FVideoControls, {
    buildVolumeDisplay: function() {
//        console.log('custom volume');
    }
})
