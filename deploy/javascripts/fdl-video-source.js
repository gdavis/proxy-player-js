var FVideoSources = function() {
    this.videos = [];
};

var FVideoSource = function( $file, $type, $label ) {
    this.file = $file;
    this.type = $type;
    this.label = $label;
};

FVideoSources.prototype = {

    addVideo: function( $file, $type, $label ) {
        this.videos.push( new FVideoSource( $file, $type, $label ));
    }
};


