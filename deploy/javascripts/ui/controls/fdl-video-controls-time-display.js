var FTimeDisplay = Class.create({
    initialize: function( $container, $video ) {
        this.container = $container;
        this.video = $video;
        this.currentTime = false;
        this.totalTime = false;
        this.build();
        this.addModelListeners();
        this.updateTime();
    },

    build: function() {
        var self = this;
        this.currentTime = DOMUtil.createElement('span', { className:"fdl-current-time"}, this.container );
        this.separator = DOMUtil.createElement('span', { className:"fdl-time-separator"}, this.container );
        this.totalTime = DOMUtil.createElement('span', { className:"fdl-total-time"}, this.container );
    },

    addModelListeners: function() {
        var self = this;
        $( this.video.container ).bind(FVideoModel.EVENT_TIME_UPDATE, function( $e ){ self.handlePlayheadUpdate( $e ); });
    },

    updateTime: function() {
        this.currentTime.innerHTML = this.formatTime( this.video.model.getTime() );
        this.totalTime.innerHTML = this.formatTime( this.video.model.getDuration() );
    },

    formatTime: function( $time ) {
        var secs = parseInt(( $time % 60 ));
        var mins = parseInt(( $time / 60  ) % 60);
        var hours = parseInt( mins / 60 );
        return this.formattedDigit( hours ) + ':' + this.formattedDigit( mins ) + ':' + this.formattedDigit( secs );
    },

    formattedDigit: function( $value ) {
        return ( $value < 10 ) ? '0' + $value : $value;
    },

    handlePlayheadUpdate: function( $e ) {
        this.updateTime();
    }
});