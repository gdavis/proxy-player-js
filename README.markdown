# Proxy Player JS
Proxy Player JS is an HTML5 video with Flash fallback solution that enables video playback on all major platforms and mobile devices. What sets the Proxy Player apart is how the controls are handled. Controls are built using HTML and CSS, and made functional through Javascript. Proxy Player provides a simple API to interact with the controls, and "proxies" the commands to the video object, whether it is a Flash movie or a `<video>` element. The goal of this project is to build your controls once, and Proxy Player decides what platform you are on and how to render the video.

The `<video>` element is used as the primary playback technology for Proxy Player and uses a custom Flash video player as a fallback for browsers that do not support HTML5. Proxy Player aims to be a solution to not only save the developer time in developing controls, but also in handling the many bugs and gotchas that appear across all the different platforms when dealing with HTML5 video. Based on the MVC design pattern, it is also meant to be flexible enough to extend and provide custom controls, or listen to player events from outside of the player altogether to have other page elements respond to those events. 

Suggestions, contributions, and feedback is welcome!
	
## The Guts 
Proxy Player is made up of many different Javascript based "classes" that are all concatenated into a minified JS file for easy deployment. Proxy Player makes use of the Prototype javascript framework's class and inheritance structure. For more information, visit: http://www.prototypejs.org/learn/class-inheritance. ProxyPlayer makes use of this OOP-based approach to provide a more formal architecture for inheriting, extending, overriding functionality.

The main classes in ProxyPlayer.js:

**PPVideo.js**
Acts as the "controller" for the MVC pattern. Provides the base API for interacting with the video. The main API actions (such as play, pause, stop) are forwarded to the Proxy object created to control the video player.

**PPVideoModel.js**
Acts as the "model" for the video player. 

**PPControls.js**
Manages all controls added to the player. Responsible for building, placing, and resizing controls.

**PPControl.js**
Base class for all UI controls. Provides a set of methods to override to build controls.

**PPProxy.js**
Base class for the HTMLProxy and FlashProxy classes. Provides a set of methods that interact with the "view"; either the HTML5 video tag or Flash Player object.

**PPHTMLProxy.js**
Proxy subclass that interacts with the HTML5 `<video>` tag.

**PPFlashProxy.js**
Proxy subclass that interacts with the Flash Player object via ExternalInterface.

**PPVideoEvent.js**
Contains all events dispatched by the container element of the FVideo instance.

**PPVideoState.js**
Contains all possible states the FVideo player can enter. These values are also applied as a CSS class to the container of the FVideo class for styling controls and updating UI elements.

**PPVideoConfiguration.js**
Contains all the settings for configuring the video object. This object stores the width, height, volume, autoplay, poster, flash embedding options, etc. You only need to override what you want to use or change, as FVideoConfiguration comes with a set of default options to quickly get you up and running. 

**PPVideoSources.js**
This object contains an API for adding and maintaining source elements that are to be used for the player. This object is needed upon instantiation of the Proxy Player to know what video formats are available. Items added to this object are translated into `<source>` elements. You also specify the default format for Flash using this object's API.

## Usage
Proxy Player JS is aimed for ease of use for developers more than casual web users looking to put content on their blog. Proxy Player allows developers to extend, modify, and develop their own custom controls to suit the needs of their player. We want developers to be able to build and style one UI for their video, and deliver that UI to all platforms that support HTML5 video and Flash. 

### Getting Started
To get started, you'll have to create the configuration object for the player. Below is a basic example of a common setup for an FVideoConfiguration:

	var config = new PPVideoConfiguration( 636, 264, { poster:"media/poster.png", autoplay:true, volume:0 }, "proxy-player.swf" );	

Next, we'll need to prepare the source videos that will be served to the FVideo instance. The FVideoSources object should include all different formats for the video, including a single source that is specified as the Flash default video. At least one source needs to be identified as the Flash default, or it will not know what format to use. 

	var sources = new PPVideoSources();
	sources.addVideo( 'http://video-js.zencoder.com/oceans-clip.mp4', 'video/mp4', 'Link Label', true );
	sources.addVideo( 'http://video-js.zencoder.com/oceans-clip.ogv', 'video/ogg', 'Link Label' );
	
Finally, construct the FVideo instance by passing the container element ID, the configuration, sources, controls, overlays, and finally a handler for the 'ready' state.

	var video = new PPVideo( '#video1', config, sources, [PPPlayPauseButton,PPStopButton,PPProgressBar], [PPStartVideoButton], function() {
	                // ready handler
	            });

### Building Custom Controls
The power of Proxy Player comes in its flexibility to easily add, modify, and create platform-specific controls that all seamlessly integrate with either an HTML5 Video Element or Flash Player. This allows you to use the Proxy Player as a starting point to developing your custom, branded player without all the headaches and lost time that comes inherently with modern video solutions.

All the controls in Proxy Player inherit from a base FControl class. This class provides the API foundation that the Proxy Player needs to intelligently build controls per-platform, when needed. Here is the basic API structure of FControl:

	initialize: function($model, $controller, $container) {
	  // part of the prototype class structure, this method should typically only be overridden to define instance properties. the parameters should never be changed.
	},

	canSupportPlatform: function() {
	  // returns true or false depending on if this control is supported on this platform.
	  // VolumeControl, for example, is not needed on iOS or Android devices because all volume is handled by the UI, and cannot be manually set by javascript
	},

	resizeType: function() {
	  // returns either PPControl.TYPE_FIXED for PPControl.TYPE_FLEXIBLE to determine how the element gets resized.
	  // PPProgressBar, for example, uses a resize type of PPControl.TYPE_FLEXIBLE to fill the area between other control elements.
	},

	build: function() {
	  // creates the main element for this control, with a class identifying how the control resizes by calling its own resizeType() method.
	},

	setListeners: function() {
	  // adds listeners to the model, controls, or whatever else on the page
	},

	update: function() {
	  // called when updates occur in order to refresh the controls visual state.
	},

	destroy: function() {
	  // called when an FVideo instance is destroyed, and cleans up all references for garabge collection
	}

Lets take a look at how the most basic subclass of PPControl, the PPPlayPauseButton, overrides parent methods to make the magic happen.

	var PPPlayPauseButton = Class.create(PPControl, {

	  build: function($super) {
	    $super();
	    DOMUtil.addClass(this.element, 'pp-play-pause');
	  },

	  setListeners: function() {
	    EventUtil.bind(this.element, 'click', this.handleClick.context(this));
	  },

	  destroy: function( $super ) {
	    EventUtil.unbind(this.element, 'click', this.handleClick.context(this));
	    $super();
	  },

	  handleClick: function() {
	    if (this.model.getPlaying()) {
	      this.controller.pause();
	    }
	    else {
	      this.controller.play();
	    }
	  }
	});

With the build method, we first call super so the superclass can perform its normal build routine which creates an HTML div element with the 'pp-control' class added to it. From here, we just want to add our own 'pp-play-pause' class so we can write CSS to respond to the video states to draw the correct play or pause icon.

In the setListeners method, we only need to bind a click event handler to our FControl's element. In our handler method, we lookup the current play status from the model and determine the correct method to call on the controller, either play or pause.
	
In the destroy method, we unbind the event handlers we added in setListeners, and call the super method to allow the superclass to do its memory cleanup as well. Thats all there is to it!

For more information on using object inheritance in Javascript, read up on it here: http://www.prototypejs.org/learn/class-inheritance

### Working with CSS
Proxy Player relies on the current state of the video player to visually update the HTML/CSS UI of the player. Each state the Proxy Player enters is added as a class to the HTML container object the Proxy Player was initialized with. This allows you to use common CSS to respond to the player's state and make changes without having to write any code. To get a grip on this, we'll take a look at how the StartVideoButton's CSS works. The StartVideoButton sits on top of the main video player stage and usually shows a big play button that hides while the video is playing. This control is made up of a container layer that is the size of the entire video, and a button element that acts as the visual cue, centered within the container layer. 

	.pp-video .pp-controls .pp-start-video .button {
	  display: none;
	}

First, we define that we don't want the center button to appear by default. In the next definition, we limit its appearance to only a few specific states: 

	.ready .pp-controls .fdpp-l-start-video .button,
	.loading .pp-controls .pp-start-video .button,
	.paused .pp-controls .pp-start-video .button,
	.stopped .pp-controls .pp-start-video .button,
	.buffering .pp-controls .pp-start-video .button {
	  display: block;
	}
	
By using a combination of state classes and CSS, it is easy to update the UI of the player with simple CSS. Of course, you could go crazy with Javascript to do more, but this is a great way to get started.


### Generating a minified version of Proxy Player
Proxy Player uses Sprockets to pull all the javascript files for the project together into a single file that is then minified using Google's Closure Compiler. The result is one, clean javascript file you can easily move into your projects and begin using. As a developer, editing the source of Proxy Player 


## Platform Notes

### iOS General
It is not possible to adjust volume on iOS devices, as specified in Apple's Mobile Safari documentation. The volume read off the video element will always return 1. 
See: http://developer.apple.com/library/safari/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Using_HTML5_Audio_Video.pdf

### iOS 3

There are several known bugs using HTML5 video with iOS3. Under iOS3, the player will ignore custom controls and force using the system's controls. This is due to the following issues under iOS3:

* After injecting the video tag via javascript you can’t put anything on top of the video. This renders controls that display on top of the player useless.
* The video tag will capture all click and touch events for elements on top of video object. For example, if you were to get around the previous issue and get your controls to render on top of your video, the controls won't receive any events.

So when viewing the player under iOS3, it is expected behavior to only see the default browser controls.

## Future Improvements
* Update the demo styling
* Update the Flash video to use a more modern video core, such as OSMF.
* Update the rake tasks to give better error reporting and not freak out when dependencies are not available. 
* Remove dependency for swfobject