package com.factorylabs.html5.video
{	
	import com.factorylabs.orange.core.collections.Map;
	import com.factorylabs.orange.video.FVideo;

	import flash.display.MovieClip;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.external.ExternalInterface;

	/**
	 * Summary.
 	 * 
 	 * <p>Description.</p>
 	 *
 	 * <hr />
	 * <p><a target="_top" href="http://github.com/factorylabs/orange-actionscript/MIT-LICENSE.txt">MIT LICENSE</a></p>
	 * <p>Copyright (c) 2004-2010 <a target="_top" href="http://www.factorylabs.com/">Factory Design Labs</a></p>
	 * 
	 * <p>Permission is hereby granted to use, modify, and distribute this file 
	 * in accordance with the terms of the license agreement accompanying it.</p>
 	 *
	 * @author		Grant Davis
	 * @version		1.0.0 :: Nov 30, 2010
	 */
	public class ProxyPlayer 
		extends MovieClip
	{	
		private var _playerId	:String;
		private var _vars	:Map;
		private var _url	:String;		
		private var _width	:int;
		private var _height	:int;
		private var _volume	:Number;
		private var _player	:FVideo;
		private var _prevBytesLoaded	:int;
		private var _prevBytesTotal	:int;
		
		
		/**
		 * @param $container 	Container for the button.
		 * @param $init			Initialization objects. 
		 */
		public function ProxyPlayer()
		{
			stop();
			mapFlashVars();
			initialize();
		}
		
		override public function toString() :String 
		{
			return 'com.factorylabs.html5.video.ProxyPlayer';
		}
		
		/*
		 * Javascript API
		**************************************************************************************************** */
		
		public function load( $url :String ) :void
		{
			_url = $url || _url;
			_player.load( _url );			
		}
				
		public function playVideo( $url :String=null ) :void
		{
			_url = $url || _url;
			if( $url ) {
				_player.play( _url );
			}
			else {
				
				// check if the url is present, if not, its out first time calling play.
				if( !_player.url ) {
					_player.play( _url );
				}
				// otherwise, the url is loaded and we're likely resuming from pause.
				else {
					_player.play();
				}
			}
		}
		
		public function seek( $time :Number ) :void
		{
			_player.seek( $time );
		}

		public function setVolume( $value :Number ) :void
		{
			_player.volume = $value;
		}
		
		public function getVolume() :Number
		{
			return _player.volume;
		}
		
		public function getIsPlaying() :Boolean
		{
			return _player.playing;
		}

		/*
		 * Internal Methods
		**************************************************************************************************** */
		
		protected function mapFlashVars() :void
		{
			_vars = new Map();
			var flashParams:Object = this.stage.loaderInfo.parameters;
			for(var flashvar:String in flashParams) { _vars.add( flashvar, flashParams[ flashvar ]); }
		}
		
		protected function initialize() :void
		{
			_prevBytesLoaded = 0;
			_prevBytesTotal = 0;
			_playerId = _vars.get('playerId');
			_url = _vars.get('src') ? _vars.get('src') : '';
			_width = int( _vars.get('width')) || this.stage.stageWidth;
			_height = int( _vars.get('height')) || this.stage.stageHeight;
			_volume = Number( _vars.get('volume')) || 1;
			setStageModes();
			createPlayer();
			registerCallbacks();
			addVideoListeners();
			startup();
		}
		
		protected function setStageModes() :void
		{
			this.stage.scaleMode = StageScaleMode.NO_SCALE;
			this.stage.align = StageAlign.TOP_LEFT;
		}
		
		protected function createPlayer() :void
		{
			_player = new FVideo( this, { width:_width, height:_height, volume: _volume });
		}
		
		protected function registerCallbacks() :void
		{
			ExternalInterface.addCallback( '_load', load );
			ExternalInterface.addCallback( '_play', playVideo );
			ExternalInterface.addCallback( '_pause', _player.pause );
			ExternalInterface.addCallback( '_seek', _player.seek );
			ExternalInterface.addCallback( '_stop', _player.stop );
			ExternalInterface.addCallback( '_setVolume', setVolume );
			ExternalInterface.addCallback( '_isPlaying', getIsPlaying );
			ExternalInterface.addCallback( '_getVolume', getVolume );
		}
		
		protected function addVideoListeners() :void
		{
			this.stage.addEventListener( Event.RESIZE, handleResize );
			
			_player.metadataSignal.add( handleMetadata );
			_player.playingSignal.add( handlePlay );
			_player.pauseSignal.add( handleStop );
			_player.stopSignal.add( handleStop );
			_player.stateSignal.add( handleState );
			_player.playheadUpdateSignal.add( handlePlayheadUpdate );
			_player.completeSignal.add( handleComplete );
			_player.loadProgressSignal.add( handleLoadProgress );
			_player.errorSignal.add( handleError );
		}
		
		protected function startup() :void
		{
			// notify the controller that we're ready for commands. 
			updateController( '_videoReady' );
			
			var autoPlay :String = _vars.get('autoplay');
			if( autoPlay && autoPlay.match(/true/i))  {
				_player.play( _url );
			}
		}
		
		private function updateController( $function :String, $args :Array=null ) :void
		{
			var js :XML =	<![CDATA[function( $instanceId, $function, $arguments ){
								if( $arguments ) 
									FVideo.instances[$instanceId][$function].apply( FVideo.instances[$instanceId], $arguments );
								else 
									FVideo.instances[$instanceId][$function].apply( FVideo.instances[$instanceId] );
							}]]>;
			ExternalInterface.call( js, _playerId, $function, $args );
		}
		
		
		private function handleResize( $e :Event ) :void
		{
			_player.width = this.stage.stageWidth;
			_player.height = this.stage.stageHeight;
		}
		
		/*
		 * Internal Video Event Handlers Forwarded to JS Controller
		**************************************************************************************************** */
		
		private function handleMetadata( $metadata :Object ) :void
		{
			updateController('_updateDuration', [ $metadata['duration']]);
		}
		
		private function handleLoadProgress( $bytesLoaded :Number, $bytesTotal :Number ) :void
		{
			if( _prevBytesLoaded != $bytesLoaded || _prevBytesTotal != $bytesTotal )
			{
				_prevBytesLoaded = $bytesLoaded;
				_prevBytesTotal = $bytesTotal;
				updateController('_updateLoadProgress', [ $bytesLoaded, $bytesTotal ]);
			}
		}

		private function handlePlayheadUpdate( $value :Number ) :void
		{
			updateController('_updatePlayheadTime', [$value] );
		}
		
		private function handleComplete() :void
		{
			handleStop();
			updateController('_complete');
		}
		
		private function handlePlay() :void
		{
			updateController( '_updateIsPlaying', [ true ]);
		}
		
		private function handleStop() :void
		{
			updateController( '_updateIsPlaying', [ false ]);
		}
		
		private function handleState( $state :String ) :void
		{
			switch($state){
				case FVideo.STATE_LOADING:
					updateController('_updatePlayerState', [ 'loading' ]);
					break;
				case FVideo.STATE_BUFFERING:
					updateController('_updatePlayerState', [ 'buffering' ]);
					break;
				case FVideo.STATE_PLAYING:
					updateController('_updatePlayerState', [ 'playing' ]);
					break;
				case FVideo.STATE_PAUSED:
					updateController('_updatePlayerState', [ 'paused' ]);
					break;
				case FVideo.STATE_SEEKING:
					updateController('_updatePlayerState', [ 'seeking' ]);
					break;
				case FVideo.STATE_STOPPED:
					updateController('_updatePlayerState', [ 'stopped' ]);
					break;
				default:
					// do nothing.
			}
		}
		
		
		private function handleError( $error :String ) :void
		{
			error( $error );
			updateController('_updatePlayerState', [ 'error' ]);	
			updateController('fallback');
		}
		
		
		/*
		 *  Logging Methods
		**************************************************************************************************** */
		
		private function error( $msg:String ) :void
		{
			var js :XML = <![CDATA[function( $txt ){ if( console ) console.error( $txt ); }]]>;
			ExternalInterface.call( js, $msg );
		}
		
		private function log( $msg:String ) :void
		{
			var js :XML = <![CDATA[function( $txt ){ if( console ) console.log( $txt ); }]]>;
			ExternalInterface.call( js, $msg );
		}
	}
}