//= require <controls/PPControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/PPVideoModel>
//= require <video/core/PPVideoEvent>

var PPTimeDisplay = Class.create(PPControl, {

  initialize: function($super, $model, $controller, $container) {
    this.currentTime = false;
    this.totalTime = false;
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'pp-time-display');
    this.currentTime = DOMUtil.createElement('span', { className:"pp-current-time"}, this.element);
    this.separator = DOMUtil.createElement('span', { className:"pp-time-separator"}, this.element);
    this.totalTime = DOMUtil.createElement('span', { className:"pp-total-time"}, this.element);
  },

  setListeners: function() {
    EventUtil.bind(this.model.dispatcher, PPVideoEvent.TIME_UPDATE, this.update.context(this));
  },

  update: function() {
    this.currentTime.innerHTML = this.formatTime(this.model.getTime());
    this.totalTime.innerHTML = this.formatTime(this.model.getDuration());
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.model.dispatcher, PPVideoEvent.TIME_UPDATE, this.update.context(this));
    $super();
  },

  formatTime: function($time) {
    var secs = parseInt(( $time % 60 ));
    var mins = parseInt(( $time / 60  ) % 60);
    var hours = parseInt(mins / 60);
    return this.formattedDigit(hours) + ':' + this.formattedDigit(mins) + ':' + this.formattedDigit(secs);
  },

  formattedDigit: function($value) {
    return ( $value < 10 ) ? '0' + $value : $value;
  }
});