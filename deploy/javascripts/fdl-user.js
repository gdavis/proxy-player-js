function FUserPlatform() {}
FUserPlatform.iPhone = ( navigator.userAgent.match(/iPhone/i) !== null );
FUserPlatform.iPod = ( navigator.userAgent.match(/iPod/i) !== null );
FUserPlatform.iPad = ( navigator.userAgent.match(/iPad/i) !== null );
FUserPlatform.iOS = ( FUserPlatform.iPhone || FUserPlatform.iPod || FUserPlatform.iPad );
FUserPlatform.chrome = ( navigator.userAgent.match(/Chrome/i) !== null );
FUserPlatform.safari = ( navigator.userAgent.match(/Safari/i) !== null );
FUserPlatform.android = ( navigator.userAgent.match(/Android/i) !== null );
FUserPlatform.android_2_1 = ( navigator.userAgent.match(/Android 2.1/i) !== null );
FUserPlatform.andriod_2_2 = ( navigator.userAgent.match(/Android 2.2/i) !== null );
FUserPlatform.ie = ( navigator.userAgent.match(/MSIE/i) !== null );
FUserPlatform.ie6 = ( navigator.userAgent.match(/MSIE 6/i) !== null );
FUserPlatform.ie7 = ( navigator.userAgent.match(/MSIE 8/i) !== null );
FUserPlatform.firefox = ( navigator.userAgent.match(/Firefox/i) !== null );