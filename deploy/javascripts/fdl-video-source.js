var FVideoSources = function() {
    this.videos = [];
    this.flashVideo = '';
};

var FVideoSource = function( $file, $type, $label ) {
    this.file = $file;
    this.type = $type;
    this.label = $label;
};

FVideoSources.prototype = {

    addVideo: function( $file, $type, $label, $isFlashDefault ) {
        this.videos.push( new FVideoSource( $file, $type, $label ));
        if( $isFlashDefault == 'true' || $isFlashDefault ) {
            this.flashVideo = $file;
        }
    }
};


