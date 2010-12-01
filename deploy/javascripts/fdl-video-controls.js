var FVideoControls = function( $fVideoInstance ) {
    this.fVideo = $fVideoInstance;
    this.playButton = $('.play-pause', this.fVideo.container );
    console.log('play button = ' + this.playButton );
    this.stopButton = $('.stop', this.fVideo.container );
    this.progressBar = $('.progress-bar', this.fVideo.container );
    this.volumeButton = $('.volume', this.fVideo.container );
    this.setupButtons();
};

FVideoControls.prototype = {
    setupButtons: function() {
        var self = this;
        this.playButton.click(function(){ console.log('cliiiick'); self.fVideo.play() });
        this.stopButton.click(function(){ console.log('stop'); self.fVideo.stop() });
    }
};