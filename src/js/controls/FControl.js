//= require <utils/Class>
//= require <utils/dom_util>

/**
 * Base class for creating all media element controls.
 */
var FControl = Class.create({

    initialize: function($model, $controller, $container ) {
        this.model = $model;
        this.controller = $controller;
        this.container = $container;
        this.element = undefined;
        this.build();
        this.setListeners();
        this.update();
    },

    build: function() {
        //  create the main element for this control
        this.element = DOMUtil.createElement( 'div', { className:"fdl-control" }, this.container );
    },

    setListeners: function() {
        // adds listeners to the model, controls, or whatever else on the page
    },

    update: function() {
        // called when updates occur in order to refresh the controls visual state.
    }
});