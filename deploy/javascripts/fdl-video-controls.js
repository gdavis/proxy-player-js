var FVideoControls = function( $fVideoInstance ) {
    this.fVideo = $fVideoInstance;
    this.playButton = $('.play-pause', this.fVideo.container );
    this.stopButton = $('.stop', this.fVideo.container );
    this.progressBar = $('.progress-bar', this.fVideo.container );
    this.volumeButton = $('.volume', this.fVideo.container );
    this.setupButtons();
    this.addModelListeners();
};

FVideoControls.prototype = {
    setupButtons: function() {
        var self = this;
        this.playButton.click(function(){ self.fVideo.play() });
        this.stopButton.click(function(){ self.fVideo.stop() });
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
    }
};