# Proxy Player JS
Proxy Player JS is an HTML5 video with Flash fallback solution that enables video playback on all major platforms and mobile devices. Why are we making another HTML5 video solution when there are other great libraries like VideoJS, MediaElement, and VideoForEverybody? Proxy Player JS allows an HTML/Javascript based controls to interact with both the <video> element and Flash plug-in to control video. In the other video libraries listed here, a Flash (or even Silverlight for MediaElement) player is used for playback when HTML5 video is not available, and that Flash player and its controls are all within embedded within the SWF. 
	
As an advertising agency, branding and custom UIs for our video players are paramount to an immersive, professional experience. Other video solutions demanded twice as much development time to create custom styled controls written in HTML/Javascript to interact with the HTML5 video, and a different set of controls written in Actionscript for controlling the Flash Player SWF.

Proxy Player aims to be a solution to not only save the developer time in developing controls, but also in handling the many bugs and gotchas that appear across all the different platforms. Based on the MVC design pattern, it is also meant to be flexible enough to extend and provide custom controls, or listen to player events from outside of the player altogether to have other page elements respond to those events. 
	
## The Guts 
Proxy Player is made up of many different Javascript based "classes" that are all concatenated into a minified JS file for easy deployment. Proxy Player makes use of the Prototype javascript framework's class and inheritance structure. For more information, visit: http://www.prototypejs.org/learn/class-inheritance. ProxyPlayer makes use of this OOP-based approach to provide a more formal architecture for inheriting, extending, overriding functionality.

The main classes in ProxyPlayer.js:

*FVideo.js*
Acts as the "controller" for the MVC pattern. Provides the base API for interacting with the video. The main API actions (such as play, pause, stop) are forwarded to the Proxy object created to control the video player.

*FVideoModel.js*
Acts as the "model" for the video player. 

*FControls.js*
Manages all controls added to the player. Responsible for building, placing, and resizing controls.

*FControl.js*
Base class for all UI controls. Provides a set of methods to override to build controls.

*Proxy.js*
Base class for the HTMLProxy and FlashProxy classes. Provides a set of methods that interact with the "view"; either the HTML5 video tag or Flash Player object.

*HTMLProxy.js*
Proxy subclass that interacts with the HTML5 <video> tag.

*FlashProxy.js*
Proxy subclass that interacts with the Flash Player object via ExternalInterface.

## Usage

## Platform Notes

### iOS 3

There are several known bugs using HTML5 video with iOS3. Under iOS3, the player will ignore custom controls and force using the system's controls. This is due to the following issues under iOS3:

* After injecting the video tag via javascript you can’t put anything on top of the video. This renders controls that display on top of the player useless.
* The video tag will capture all click and touch events for elements on top of video object. For example, if you were to get around the previous issue and get your controls to render on top of your video, the controls won't receive any events.

So when viewing the player under iOS3, it is expected behavior to only see the default browser controls.