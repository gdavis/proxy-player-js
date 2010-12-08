var FFullscreen = function( $container, $fVideoInstance ) {
    this.container = $container;
    this.fVideo = $fVideoInstance;
    this.viewportWidth = 0;
    this.viewportHeight = 0;
    this.origWidth = this.fVideo.model.getWidth();
    this.origHeight = this.fVideo.model.getHeight();
    this.origPosition = false;
    this.getViewportSize();
    this.setupInteractionHandlers();
    this.addModelListeners();
};

FFullscreen.prototype = {
    setupInteractionHandlers: function() {
        var self = this;
        $(this.container).click(function( $e ){
            self.toggleFullscreen();
        });
    },

    addModelListeners: function() {
        var self = this;
        $( this.fVideo.container ).bind( FVideoModel.EVENT_TOGGLE_FULLSCREEN, function(){
            if( self.fVideo.model.getFullscreen())
                self.enterFullscreen();
            else
                self.exitFullscreen();
        });
    },

    toggleFullscreen: function() {
        this.fVideo.model.setFullscreen( !this.fVideo.model.getFullscreen() );
    },

    size: function() {
        this.getViewportSize();
        this.fVideo.setSize( this.viewportWidth, this.viewportHeight );
    },

    enterFullscreen: function() {
        this.size();
        // listen for browser resize
        var self = this;
        $(window).resize(function() {
            self.size();
        });
    },

    exitFullscreen: function() {
        console.log('origWidth: ' + this.origWidth + ", origHeight: " + this.origHeight);
        $(window).unbind('resize');
        this.fVideo.setSize( this.origWidth, this.origHeight );
    },

    getViewportSize: function() {
        // viewport code modified from: http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
        // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
        if (typeof window.innerWidth != 'undefined') {
             this.viewportWidth = window.innerWidth;
             this.viewportHeight = window.innerHeight;
        }
        // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
        else if (typeof document.documentElement != 'undefined'
            && typeof document.documentElement.clientWidth != 'undefined'
                && document.documentElement.clientWidth != 0 ) {
            this.viewportWidth = document.documentElement.clientWidth;
            this.viewportHeight = document.documentElement.clientHeight;
        }
        // older versions of IE
        else {
            this.viewportWidth = document.getElementsByTagName('body')[0].clientWidth;
            this.viewportHeight = document.getElementsByTagName('body')[0].clientHeight;
        }
    }
};
