function FUserEnvironment() {}
FUserEnvironment.iPhone = ( navigator.userAgent.match(/iPhone/i) !== null );
FUserEnvironment.iPod = ( navigator.userAgent.match(/iPod/i) !== null );
FUserEnvironment.iPad = ( navigator.userAgent.match(/iPad/i) !== null );
FUserEnvironment.iOS = ( FUserEnvironment.iPhone || FUserEnvironment.iPod || FUserEnvironment.iPad );
FUserEnvironment.iOS_3 = ( FUserEnvironment.iOS && ( navigator.userAgent.match(/OS 3/i) !== null ));
FUserEnvironment.iOS_4 = ( FUserEnvironment.iOS && ( navigator.userAgent.match(/OS 4/i) !== null ));
FUserEnvironment.chrome = ( navigator.userAgent.match(/Chrome/i) !== null );
FUserEnvironment.safari = ( navigator.userAgent.match(/Safari/i) !== null );
FUserEnvironment.android = ( navigator.userAgent.match(/Android/i) !== null );
FUserEnvironment.android_2_1 = ( navigator.userAgent.match(/Android 2.1/i) !== null );
FUserEnvironment.andriod_2_2 = ( navigator.userAgent.match(/Android 2.2/i) !== null );
FUserEnvironment.ie = ( navigator.userAgent.match(/MSIE/i) !== null );
FUserEnvironment.ie6 = ( navigator.userAgent.match(/MSIE 6/i) !== null );
FUserEnvironment.ie7 = ( navigator.userAgent.match(/MSIE 8/i) !== null );
FUserEnvironment.firefox = ( navigator.userAgent.match(/Firefox/i) !== null );
//alert('is OS 3? ' + FUserEnvironment.iOS_3 );
//alert('is OS 4? ' + FUserEnvironment.iOS_4 );