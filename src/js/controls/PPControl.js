//= require <utils/Class>
//= require <utils/dom_util>

/**
 * Base class for creating all media element controls.
 */
var PPControl = Class.create({

  initialize: function($model, $controller, $container) {
    this.model = $model;
    this.controller = $controller;
    this.container = $container;
    this.element = undefined;
  },

  /**
   * @return Boolean Returns true if the current platform is supported. The control will not be created if it is not supported.
   * By default, iPhone and Android devices don't get controls.
   */
  canSupportPlatform: function() {
    return ( EnvironmentUtil.iPhone || EnvironmentUtil.android ) ? false : true;
  },

  /**
   * @return Boolean  Returns a string representing whether this control is flexible in size or fixed.
   */
  resizeType: function() {
    return PPControl.TYPE_FIXED;
  },

  /**
   * Builds the elements for this control. Only called if canSupportPlatform() returns true.
   */
  build: function() {
    //  create the main element for this control, with a class identifying how the control resizes
    this.element = DOMUtil.createElement('div', { className:this.resizeType() }, this.container);
  },

  setListeners: function() {
    // adds listeners to the model, controls, or whatever else on the page
  },

  update: function() {
    // called when updates occur in order to refresh the controls visual state.
  },

  destroy: function() {
    // called to clean up the control for garbage collection
    if( this.element && this.element.parentNode ) {
      this.element.parentNode.removeChild(this.element);
    }
    delete this.element;
    delete this.controller;
    delete this.container;
  }
});

PPControl.TYPE_FLEXIBLE = 'pp-flexible';
PPControl.TYPE_FIXED = 'pp-fixed';