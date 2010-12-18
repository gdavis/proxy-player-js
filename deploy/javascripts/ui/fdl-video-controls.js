/*
// method 1:
var controls = new FControls( fVideoInstance, [ PlayPauseButton, StopButton, ProgressBar, VolumeControl, FullscreenButton ]);

// method 2:
var controls = new FControls( fVideoInstance );
controls.addControl( PlayPauseButton );
controls.addControl( StopButton );
...
controls.position();


// method 3:
<video data-controls="PlayPauseButton,StopButton,ProgressBar,VolumeControl,FullscreenButton"></video>
*/

var FControls = Class.create({
    initialize: function( $model, $controller, $container ) {
        this.model = $model;
        this.controller = $controller;
        this.container = $container;
        this.controls = [];
        if( arguments[3] !== undefined ) {
            var controls = arguments[3];
            var dl = controls.length;
            for(var i=0; i<dl;i++) {
                this.addControl(controls[i]);
            }
        }
        this.setListeners();
        this.position();
    },

    addControl: function( $controlClass ) {
        if(typeof $controlClass === 'string') {
            this.controls.push(new window[$controlClass](this.model, this.controller, this.container));
        }
        else if( typeof $controlClass === 'function' ) {
            this.controls.push(new $controlClass(this.model, this.controller, this.container));
        }
        else if( typeof $controlClass === 'object') {
            if( $controlClass.tagName !== undefined ) { // check for a node
                this.container.appendChild($controlClass);
                $($controlClass).addClass('fdl-control'); // make sure it has the proper class
                this.controls.push($controlClass);
            }
        }
    },

    setListeners: function() {
        $(this.model.dispatcher).bind(FVideoModel.EVENT_RESIZE, this.position.context(this) );
    },

    position: function() {
        var dl = this.controls.length,
            flexibles = [],
            sum = 0,
            i;
        for(i=0; i<dl;i++) {
            var control = this.controls[i];
            var el = ( control.tagName !== undefined ) ? control : control.element;
            if( $(el).hasClass('fdl-control-flexible')) {
                flexibles.push(el);
            }
            // ignore absolutely positioned elements
            else if( !$(el).hasClass('fdl-control-absolute')) {
                sum += el.offsetWidth;
            }
        }
        dl = flexibles.length;
        var wv = ( this.model.getWidth() - sum ) / dl;
        for(i=0; i<dl;i++) {
            var flexi = flexibles[i];
            $(flexi).width(wv);
        }
    }
});






/*
var FVideoControls = Class.create({
    
    initialize: function( $fVideoInstance ) {
        this.fVideo = $fVideoInstance;

        // for android and iOS, we don't need to use HTML controls.
        if( FEnvironment.iOS || FEnvironment.android ) {

            // for android, wire up a manual click-to-play handler
            if( FEnvironment.android ) {
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
*/