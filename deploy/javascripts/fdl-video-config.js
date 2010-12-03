var FVideoConfiguration = function ( $width, $height, $videoOptions, $swf, $variables, $parameters, $attributes ){

    this.width = $width;
    this.height = $height;

    // "constants"
    this.DEFAULT_VIDEO_OPTIONS =        {   audio: false,
                                            autoplay: true,
                                            controls: false,
                                            width:$width,
                                            height:$height,
                                            loop: false,
                                            preload: true,
                                            src: false,
                                            poster: false
                                            };
    this.DEFAULT_FLASH_ATTRIBUTES =     {   bgcolor:"#666" };
    this.DEFAULT_FLASH_PARAMS =         {   scale:"noscale",
                                            allowScriptAccess:"always",
                                            quality:"best",
                                            wmode:"opaque",
                                            allowFullScreen:"true"
                                            };
    this.flashOptions =         {   expressInstall:"/media/swfs/expressinstall.swf",
                                            version:"10",
                                            swf: $swf,
                                            variables: $variables,
                                            params: FVideo.mergeOptions( this.DEFAULT_FLASH_PARAMS, $parameters ),
                                            attributes: FVideo.mergeOptions( this.DEFAULT_FLASH_ATTRIBUTES, $attributes )
                                            };
    
    this.videoOptions = FVideo.mergeOptions( this.DEFAULT_VIDEO_OPTIONS, $videoOptions );
};
