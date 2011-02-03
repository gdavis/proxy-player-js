# Proxy Player JS

## Usage Notes

### iOS 3

There are several known bugs using HTML5 video with iOS3. Under iOS3, the player will ignore custom controls and force using the system's controls. This is due to the following issues under iOS3:

• After injecting the video tag via javascript you can’t put anything on top of the video. This renders controls that display on top of the player useless.
• The video tag will capture all click and touch events for elements on top of video object. For example, if you were to get around the previous issue and get your controls to render on top of your video, the controls won't receive any events.

So when viewing the player under iOS3, it is expected behavior to only see the default browser controls.