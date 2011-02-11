//= require <controls/FControl>
//= require <utils/dom_util>
//= require <utils/event_util>
//= require <utils/function_util>
//= require <video/core/FVideoModel>
//= require <video/core/FVideoEvent>

var TimeDisplay = Class.create(FControl, {

  initialize: function($super, $model, $controller, $container) {
    this.currentTime = false;
    this.totalTime = false;
    $super($model, $controller, $container);
  },

  build: function($super) {
    $super();
    DOMUtil.addClass( this.element, 'fdl-time-display');
    this.currentTime = DOMUtil.createElement('span', { className:"fdl-current-time"}, this.element);
    this.separator = DOMUtil.createElement('span', { className:"fdl-time-separator"}, this.element);
    this.totalTime = DOMUtil.createElement('span', { className:"fdl-total-time"}, this.element);
  },

  setListeners: function() {
    EventUtil.bind(this.model.dispatcher, FVideoEvent.TIME_UPDATE, this.update.context(this));
  },

  update: function() {
    this.currentTime.innerHTML = this.formatTime(this.model.getTime());
    this.totalTime.innerHTML = this.formatTime(this.model.getDuration());
  },

  destroy: function( $super ) {
    EventUtil.unbind(this.model.dispatcher, FVideoEvent.TIME_UPDATE, this.update.context(this));
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