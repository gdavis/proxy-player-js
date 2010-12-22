function FEnvironment() {}
FEnvironment.iPhone = ( navigator.userAgent.match(/iPhone/i) !== null );
FEnvironment.iPod = ( navigator.userAgent.match(/iPod/i) !== null );
FEnvironment.iPad = ( navigator.userAgent.match(/iPad/i) !== null );
FEnvironment.iOS = ( FEnvironment.iPhone || FEnvironment.iPod || FEnvironment.iPad );
FEnvironment.iOS_3 = ( FEnvironment.iOS && ( navigator.userAgent.match(/OS 3/i) !== null ));
FEnvironment.iOS_4 = ( FEnvironment.iOS && ( navigator.userAgent.match(/OS 4/i) !== null ));
FEnvironment.chrome = ( navigator.userAgent.match(/Chrome/i) !== null );
FEnvironment.safari = ( navigator.userAgent.match(/Safari/i) !== null );
FEnvironment.android = ( navigator.userAgent.match(/Android/i) !== null );
FEnvironment.android_2_1 = ( navigator.userAgent.match(/Android 2.1/i) !== null );
FEnvironment.andriod_2_2 = ( navigator.userAgent.match(/Android 2.2/i) !== null );
FEnvironment.ie = ( navigator.userAgent.match(/MSIE/i) !== null );
FEnvironment.ie6 = ( navigator.userAgent.match(/MSIE 6/i) !== null );
FEnvironment.ie7 = ( navigator.userAgent.match(/MSIE 8/i) !== null );
FEnvironment.firefox = ( navigator.userAgent.match(/Firefox/i) !== null );
FEnvironment.firefox_3 = ( navigator.userAgent.match(/Firefox\/3/i) !== null );