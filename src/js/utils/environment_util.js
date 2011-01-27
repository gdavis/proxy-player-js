function EnvironmentUtil() {
}
EnvironmentUtil.iPhone = ( navigator.userAgent.match(/iPhone/i) !== null );
EnvironmentUtil.iPod = ( navigator.userAgent.match(/iPod/i) !== null );
EnvironmentUtil.iPad = ( navigator.userAgent.match(/iPad/i) !== null );
EnvironmentUtil.iOS = ( EnvironmentUtil.iPhone || EnvironmentUtil.iPod || EnvironmentUtil.iPad );
EnvironmentUtil.iOS_3 = ( EnvironmentUtil.iOS && ( navigator.userAgent.match(/OS 3/i) !== null ));
EnvironmentUtil.iOS_4 = ( EnvironmentUtil.iOS && ( navigator.userAgent.match(/OS 4/i) !== null ));
EnvironmentUtil.chrome = ( navigator.userAgent.match(/Chrome/i) !== null );
EnvironmentUtil.safari = ( navigator.userAgent.match(/Safari/i) !== null );
EnvironmentUtil.android = ( navigator.userAgent.match(/Android/i) !== null );
EnvironmentUtil.android_2_1 = ( navigator.userAgent.match(/Android 2.1/i) !== null );
EnvironmentUtil.andriod_2_2 = ( navigator.userAgent.match(/Android 2.2/i) !== null );
EnvironmentUtil.ie = ( navigator.userAgent.match(/MSIE/i) !== null );
EnvironmentUtil.ie6 = ( navigator.userAgent.match(/MSIE 6/i) !== null );
EnvironmentUtil.ie7 = ( navigator.userAgent.match(/MSIE 8/i) !== null );
EnvironmentUtil.firefox = ( navigator.userAgent.match(/Firefox/i) !== null );
EnvironmentUtil.firefox_3 = ( navigator.userAgent.match(/Firefox\/3/i) !== null );