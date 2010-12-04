var FVideoConfiguration = function ( $width, $height, $videoOptions, $swf, $variables, $parameters, $attributes ){

    this.width = $width;
    this.height = $height;
    $swf = $swf || FVideoConfiguration.DEFAULT_SWF;
    $variables = $variables || {};

    // "constants"
    this.DEFAULT_VIDEO_OPTIONS =        {   audio: false,
                                            autoplay: false,
                                            controls: false,
                                            width:$width,
                                            height:$height,
                                            loop: false,
                                            preload: false,
                                            src: false,
                                            poster: false
                                            };
    this.DEFAULT_FLASH_ATTRIBUTES =     {   bgcolor:"#000" };
    this.DEFAULT_FLASH_PARAMS =         {   scale:"noscale",
                                            allowScriptAccess:"always",
                                            quality:"best",
                                            wmode:"opaque",
                                            allowFullScreen:"true"
                                            };
    this.flashOptions =         {   expressInstall:"expressinstall.swf",
                                            version:"10",
                                            swf: $swf,
                                            variables: $variables,
                                            params: FVideo.mergeOptions( this.DEFAULT_FLASH_PARAMS, $parameters ),
                                            attributes: FVideo.mergeOptions( this.DEFAULT_FLASH_ATTRIBUTES, $attributes )
                                            };
    
    this.videoOptions = FVideo.mergeOptions( this.DEFAULT_VIDEO_OPTIONS, $videoOptions );
};

FVideoConfiguration.DEFAULT_SWF = 'proxy-player.swf';