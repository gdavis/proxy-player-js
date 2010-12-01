package com.factorylabs.orange.video
{
	import com.factorylabs.orange.core.IDisposable;

	import org.openvideoplayer.events.OvpEvent;
	import org.openvideoplayer.net.OvpConnection;
	import org.openvideoplayer.net.OvpNetStream;
	import org.osflash.signals.Signal;

	import flash.display.DisplayObjectContainer;
	import flash.events.AsyncErrorEvent;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.events.TimerEvent;
	import flash.geom.Rectangle;
	import flash.media.Video;
	import flash.utils.Timer;
	import flash.utils.getTimer;

	/**
	 * FVideo provides a robust class for steaming or loading progressive videos.
	 * 
	 * <p>FVideo incorporates the Open Video Player framework to manage network connections.
 	 * <br/><a href="http://openvideoplayer.sourceforge.net/">Open Video Player (OVP)</a></p>
 	 *
 	 * <hr />
	 * <p><a target="_top" href="http://github.com/factorylabs/orange-actionscript/MIT-LICENSE.txt">MIT LICENSE</a></p>
	 * <p>Copyright (c) 2004-2010 <a target="_top" href="http://www.factorylabs.com/">Factory Design Labs</a></p>
	 * 
	 * <p>Permission is hereby granted to use, modify, and distribute this file 
	 * in accordance with the terms of the license agreement accompanying it.</p>
 	 *
	 * @author		Grant Davis
	 * @version		0.0.1 :: Mar 1, 2010
	 */
	public class FVideo 
		extends Video
			implements IDisposable
	{
		//-----------------------------------------------------------------
		// Variables
		//-----------------------------------------------------------------
		/**
		 * @private
		 */
		protected var _holder					:DisplayObjectContainer;
		/**
		 * @private
		 */
		protected var _connection				:OvpConnection;
		/**
		 * @private
		 */
		protected var _stream					:OvpNetStream;
		/**
		 * @private
		 */
		protected var _host						:String;
		/**
		 * @private
		 */
		protected var _url						:String;
		/**
		 * @private
		 */
		protected var _streaming				:Boolean;
		/**
		 * @private
		 */
		protected var _connectionEstablished	:Boolean;
		/**
		 * @private
		 */
		protected var _playing					:Boolean;
		/**
		 * @private
		 */
		protected var _seeking					:Boolean;
		/**
		 * @private
		 */
		protected var _queuedSeekTime			:Number;
		/**
		 * @private
		 */
		protected var _duration					:Number;
		/**
		 * @private
		 */
		protected var _metadata					:Object;
		/**
		 * @private
		 */
		protected var _volume					:Number;
		/**
		 * @private
		 */
		protected var _state					:String;
		/**
		 * @private
		 */
		protected var _useFastStartBuffer		:Boolean;
		/**
		 * @private
		 */
		protected var _playheadTime				:Number;
		/**
		 * @private
		 */
		protected var _userPaused				:Boolean;
		
		protected var _readyToEnd				:Boolean;
		
		/**
		 * @private
		 * Default value of the number of seconds to buffer before beginning video playback.
		 */
		protected static const DEFAULT_BUFFER_LENGTH : Number = 3;
		
		/**
		 * @private
		 */
		protected var _userSetBandwidth			:uint;
		/**
		 * @private
		 */
		protected var _bufferLength				:Number;
		/**
		 * @private
		 */
		protected var _startTime 				:Number;
		/**
		 * 
		 */
		public static var bandwidth				:Number;
		/**
		 * @private
		 */
		protected var _autoSetBufferTime		:Boolean;
		/**
		 * @private
		 */
		protected var _autoDetectBandwidth		:Boolean;
		/**
		 * @private
		 */
		protected var _checkBandwidth			:Boolean;
		/**
		 * @private
		 */
		protected var _bytesLoaded				:uint;
		/**
		 * @private
		 */
		protected var _bytesTotal				:uint;
		/**
		 * @private
		 */
		protected var _lastByteCount			:uint;
		/**
		 * @private
		 */
		protected var _httpBandwidthTimer		:Timer;
		/**
		 * @private
		 */
		protected var _autoRewind				:Boolean;
		/**
		 * @private
		 */
		protected var _align					:String;
		/**
		 * @private
		 */
		protected var _scaleMode				:String;
		/**
		 * @private
		 * Stores the sized dimensions of the video player set via width and height properties. 
		 */
		protected var _videoArea 				:Rectangle = new Rectangle( 0,0,320,240 );
		/**
		 * @private
		 * Stores the native size of the video loaded. Defaults to 320x240.
		 */
		protected var _nativeDimensions 		:Rectangle = new Rectangle( 0,0,320,240 ); 
		/**
		 * @private
		 * The calculated values of the video's width and height after resize.
		 */
		protected var _videoWidth 				:int;
		/**
		 * @private
		 * The calculated values of the video's width and height after resize.
		 */
		protected var _videoHeight 				:int;
		
		// event signals
		
		/**
		 * @private
		 */
		protected var _stateSignal				:Signal;
		/**
		 * @private
		 */
		protected var _connectSignal			:Signal;
		/**
		 * @private
		 */
		protected var _disconnectSignal			:Signal;
		/**
		 * @private
		 */
		protected var _metadataSignal			:Signal;
		/**
		 * @private
		 */
		protected var _playheadUpdateSignal		:Signal;
		/**
		 * @private
		 */
		protected var _completeSignal			:Signal;
		/**
		 * @private
		 */
		protected var _playingSignal			:Signal;
		/**
		 * @private
		 */
		protected var _pauseSignal				:Signal;
		/**
		 * @private
		 */
		protected var _stopSignal				:Signal;
		/**
		 * @private
		 */
		protected var _seekSignal				:Signal;
		/**
		 * @private
		 */
		protected var _bandwidthSignal			:Signal;
		/**
		 * @private
		 */
		protected var _autoRewindSignal			:Signal;
		/**
		 * @private
		 */
		protected var _loadProgressSignal		:Signal;
	
		//-----------------------------------------------------------------
		// States
		//-----------------------------------------------------------------
		public static const STATE_CONNECTING	:String = "connecting";
		public static const STATE_CONNECTED		:String = "connected";
		public static const STATE_DISCONNECTED	:String = "disconnected";
		public static const STATE_LOADING		:String = "loading";
		public static const STATE_BUFFERING		:String = "buffering";
		public static const STATE_PLAYING		:String = "playing";
		public static const STATE_STOPPED		:String = "stopped";
		public static const STATE_PAUSED		:String = "paused";
		public static const STATE_SEEKING		:String = "seeking";
		
		//-----------------------------------------------------------------
		// Scale Modes
		//-----------------------------------------------------------------
		public static const SCALE_MAINTAIN_ASPECT_RATIO		:String = "maintainAspectRatio";
		public static const SCALE_NONE						:String = "noScale";
		public static const SCALE_EXACT_FIT					:String = "exactFit";
		
		//-----------------------------------------------------------------
		// Align Modes
		//-----------------------------------------------------------------
		public static const ALIGN_CENTER	:String = "center";
		public static const ALIGN_TOP	:String = "top";
		public static const ALIGN_LEFT	:String = "left";
		public static const ALIGN_BOTTOM	:String = "bottom";
		public static const ALIGN_RIGHT	:String = "right";
		public static const ALIGN_TOP_LEFT	:String = "topLeft";
		public static const ALIGN_TOP_RIGHT	:String = "topRight";
		public static const ALIGN_BOTTOM_LEFT	:String = "bottomLeft";
		public static const ALIGN_BOTTOM_RIGHT	:String = "bottomRight";
	
		//-----------------------------------------------------------------
		// Getters/Setters
		//-----------------------------------------------------------------
		public function get connection() :OvpConnection { return _connection; }
		public function get stream() :OvpNetStream { return _stream; }
		public function get url() :String { return _url; }
		public function get host() :String { return _host; }
		public function get playing() :Boolean { return _playing; }
		public function get state() :String { return _state; }
		public function get duration() :Number { return _duration; }
		public function get streaming() :Boolean { return _streaming; }
		public function get time() :Number { return _playheadTime; }
		public function get volume() :Number { return _volume; }
		public function set volume( $volume :Number ) :void
		{
			_volume = $volume;
			if( _stream ) _stream.volume = _volume;
		}
		public function get metadata() :Object { return _metadata; }
		public function get autoDetectBandwidth() :Boolean { return _autoDetectBandwidth; }
		public function set autoDetectBandwidth( $autoDetectBandwidth :Boolean ) :void
		{
			_autoDetectBandwidth = $autoDetectBandwidth;
		}
		public function get autoSetBufferTime() :Boolean { return _autoSetBufferTime; }
		public function set autoSetBufferTime( $autoSetBufferTime :Boolean ) :void
		{
			_autoSetBufferTime = $autoSetBufferTime;
		}
		public function get bandwidth() :uint { return FVideo.bandwidth; }
		public function set bandwidth( $bandwidth :uint ) :void
		{
			_userSetBandwidth = $bandwidth;
			FVideo.bandwidth = $bandwidth;
		}
		public function get maxBufferLength() :Number { return _bufferLength; }
		public function set maxBufferLength( $maxBufferLength :Number ) :void
		{
			_bufferLength = $maxBufferLength;
			if( _stream ) _stream.maxBufferLength = $maxBufferLength;
		}
		public function get useFastStartBuffer() :Boolean { return _useFastStartBuffer; } // RTMP only
		public function set useFastStartBuffer( $useFastStartBuffer :Boolean ) :void
		{
			_useFastStartBuffer = $useFastStartBuffer;
		}
		public function get autoRewind() :Boolean { return _autoRewind; }
		public function set autoRewind( $autoRewind :Boolean ) :void
		{
			_autoRewind = $autoRewind;
		}
		/**
		 * Stores the sting value of the video's align mode. Defaults to <code>ALIGN_CENTER</code>.
		 * @see 	com.factorylabs.components.video.FVideoAlign
		 * @default	ALIGN_CENTER
		 */
		public function get align() : String { return _align; }
		public function set align( v_align : String ) : void
		{
			_align = v_align;
			size();
		}
		/**
		 * Stores the sting value of the video's scale mode. Defaults to <code>FVideoScale.MAINTAIN_ASPECT_RATIO</code>.
		 * @see 	com.factorylabs.components.video.FVideoScale
		 * @default SCALE_MAINTAIN_ASPECT_RATIO
		 */
		public function get scaleMode() : String { return _scaleMode; }
		public function set scaleMode( v_scaleMode : String ) : void
		{
			_scaleMode = v_scaleMode;
			size();
		}
		/**
		 * Indicates the x coordinate of the DisplayObject instance relative to the local coordinates of the parent DisplayObjectContainer.
		 */
		public override function get x() : Number { return _videoArea.x; }
		public override function set x( value : Number ) : void
		{
			super.x = _videoArea.x = value;
			position();
		}
		
		/**
		 * Indicates the y coordinate of the DisplayObject instance relative to the local coordinates of the parent DisplayObjectContainer.
		 */
		public override function get y() : Number { return _videoArea.y; }
		public override function set y( value : Number ) : void
		{
			super.y = _videoArea.y = value;
			position();
		}
		
		/**
		 * Indicates the width of the display object, in pixels.
		 */
		public override function get width() : Number { return _videoArea.width; }
		public override function set width( $width : Number ) : void
		{
			_videoArea.width = $width;
			if ( !_metadata ) _nativeDimensions.width = $width;
			size();
		}
		
		/**
		 * Indicates the height of the display object, in pixels.
		 */
		public override function get height() : Number { return _videoArea.height; }
		public override function set height( $height : Number ) : void
		{
			_videoArea.height = $height;
			if ( !_metadata ) _nativeDimensions.height = $height;
			size();
		}
		/**
		 * Returns the width, in pixels, of the FVideo object.
		 */
		public function get actualWidth() : Number { return super.width; }
		
		/**
		 * Returns the height, in pixels, of the FVideo object. 
		 */
		public function get actualHeight() : Number { return super.height; }
		
		/**
		 * 
		 */
		public function get stateSignal() :Signal { return _stateSignal; }
		/**
		 * 
		 */
		public function get connectSignal() :Signal { return _connectSignal; }
		/**
		 * 
		 */
		public function get disconnectSignal() :Signal { return _disconnectSignal; }
		/**
		 * 
		 */
		public function get metadataSignal() :Signal { return _metadataSignal; }
		/**
		 * 
		 */
		public function get playheadUpdateSignal() :Signal { return _playheadUpdateSignal; }
		/**
		 * 
		 */
		public function get completeSignal() :Signal { return _completeSignal; }
		/**
		 * 
		 */
		public function get playingSignal() :Signal { return _playingSignal; }
		/**
		 * 
		 */
		public function get pauseSignal() :Signal { return _pauseSignal; }
		/**
		 * 
		 */
		public function get stopSignal() :Signal { return _stopSignal; }
		/**
		 * 
		 */
		public function get seekSignal() :Signal { return _seekSignal; }
		/**
		 * 
		 */
		public function get bandwidthSignal() :Signal { return _bandwidthSignal; }
		/**
		 * 
		 */
		public function get autoRewindSignal() :Signal { return _autoRewindSignal; }
		/**
		 * 
		 */
		public function get loadProgressSignal() :Signal { return _loadProgressSignal; }
	
		//-----------------------------------------------------------------
		// Constructor
		//-----------------------------------------------------------------
	
		public function FVideo( $holder :DisplayObjectContainer=null, $initObj :Object=null )
		{
			super();
			_holder = $holder;
			initialize();
			buildSignals();
			buildConnection();
			if( $holder ) $holder.addChild( this );
			if( $initObj ) setProperties( $initObj );
		}
		
		//-----------------------------------------------------------------
		// API
		//-----------------------------------------------------------------
		
		public override function toString() :String 
		{
			return 'com.factorylabs.orange.video.FVideo';
		}
		
		/**
		 * RTMP. Connects to a FMS server.
		 */
		public function connect( $host :String ) :void
		{
			// TODO: reset previous connection listeners etc?
			if ( _streaming ) resetRTMP();
			else if ( _stream ) resetHTTP();
			
			if( _stream ) closeStream();
			if( _host )
			{
				// close and rebuild the a new connection if we were
				// already connected to another host.
				closeConnection();
				buildConnection();
			}
			
			_connectionEstablished = false;
			_checkBandwidth = _autoDetectBandwidth;
			
			if ( $host )
			{
				_host = $host;
				_streaming = true;
				prepareRTMPConnection();
				_connection.connect( $host );
				setState( STATE_CONNECTING );
			}
		}
		
		/**
		 * Progressive. Load but don't play.
		 */
		public function load( $url :String ) :void
		{
			_url = $url;
			if( _stream ) closeStream();
			resetStreamInfo();
			prepareHTTPStream();
			playHTTPStream();
			_stream.seek( 0 );
			_stream.pause();
		}

		public function play( $url :String=null ) :Boolean
		{
			if( $url )
			{
				resetStreamInfo();
				
				_url = $url;
				_playing = true;				
				
				if( _streaming )
				{
					playRTMPStream();
				}
				else
				{
					if( _stream ) closeStream();
					if( !_connection ) buildConnection();
					prepareHTTPStream();
					playHTTPStream();
				}
				return true;
			}
			else if ( _stream )
			{
				// try to resume the stream if it isnt playing. 
				if( !_playing )
				{
					_playing = true;
					_readyToEnd = false;
					_stream.resume();
					// if the video is starting up after completely playing, start from beginning.
					if ( _state == STATE_STOPPED )
					{
						_stream.seek( 0 );
					}
					return true;
				}
			}
			return false;
		}
		
		/**
		 * Pauses the stream at its current position.
		 */
		public function pause() :void
		{
			_playing = false;
			_userPaused = true;
			if( _stream ) pauseStream();
			setState( STATE_PAUSED );
			_pauseSignal.dispatch();
		}
		
		/**
		 * Seeks to a specific position within the stream.
		 */
		public function seek( $seconds :Number ) :void
		{
			// constrain seconds within the length of the video.
			if( $seconds < 0 ) $seconds = 0;
			else if( $seconds >= _duration ) $seconds = _duration;
			// ensure we don't seek past what's loaded when playing a progressive video.
			if ( !_streaming )
			{
				var loadedSeconds : Number = ( _stream.bytesLoaded / _stream.bytesTotal ) * this.duration;
				if( $seconds > loadedSeconds ) $seconds = loadedSeconds;
			}
			
			// if we're already seeking, mark the queued time.
			if ( _seeking )
			{
				_queuedSeekTime = $seconds;
				return;
			}
			// TODO: Test this line thoroughly. Added so the progress handler will correctly set the 
			// player back into a 'playing' state after the video has finished playing, and then a seek was called.
			if( !_userPaused && !_playing ) _playing = true;
			
			_seeking = true;
			_readyToEnd = false;
			_stream.seek( $seconds );
			setState( STATE_SEEKING );
			_seekSignal.dispatch( $seconds );
		}

		/**
		 * Stops the stream and resets the playhead to 0.
		 */
		public function stop() :void
		{
			_playing = false;
			_userPaused = false;
			_seeking = false;
			if( _stream )
			{
				_stream.pause();
				_stream.seek( 0 );
			}
			setState( STATE_STOPPED );
			_stopSignal.dispatch();
		}

		/**
		 * Closes both the NetConnection and NetStream.
		 * Resets the player for either a new RTMP or Progressive connection.
		 */
		public function close() :void
		{
			resetStreamInfo();
			if( _stream ) 
			{
				resetHTTP();
				closeStream();
			}
			if( _connection )
			{
				resetRTMP();
				closeConnection();
			}
			setState( STATE_DISCONNECTED );
			_disconnectSignal.dispatch();
		}

		
		public function dispose() :void
		{
			_stateSignal.removeAll();
			_connectSignal.removeAll();
			_disconnectSignal.removeAll();
			_metadataSignal.removeAll();
			_playheadUpdateSignal.removeAll();
			_completeSignal.removeAll();
			_playingSignal.removeAll();
			_pauseSignal.removeAll();
			_seekSignal.removeAll();
			_stopSignal.removeAll();
			_bandwidthSignal.removeAll();
			_autoRewindSignal.removeAll();
			_loadProgressSignal.removeAll();
			
			close();
			
			_stream = null;
			_connection = null;
			_stateSignal = null;
			_connectSignal = null;
			_disconnectSignal = null;
			_metadataSignal = null;
			_playheadUpdateSignal = null;
			_completeSignal = null;
			_playingSignal = null;
			_pauseSignal = null;
			_seekSignal = null;
			_stopSignal = null;
			_bandwidthSignal = null;
			_autoRewindSignal = null;
			_loadProgressSignal = null;
			
			trace( '[FVideo].dispose()' );
		}

		//-----------------------------------------------------------------
		// Initializations
		//-----------------------------------------------------------------
		
		protected function initialize() :void
		{
			_volume = 1;
			_streaming = false;
			_autoSetBufferTime = true;
			_autoDetectBandwidth = true;
			_useFastStartBuffer = false;
			_connectionEstablished = false;
			_autoRewind = false;
			_bufferLength = DEFAULT_BUFFER_LENGTH;
			_align = ALIGN_CENTER;
			_scaleMode = SCALE_MAINTAIN_ASPECT_RATIO;
		}
		
		protected function buildSignals() :void
		{
			_stateSignal 				= new Signal( String );
			_connectSignal 				= new Signal();
			_disconnectSignal 				= new Signal();
			_metadataSignal 			= new Signal( Object );
			_playheadUpdateSignal 		= new Signal( Number );
			_completeSignal 			= new Signal();
			_playingSignal 				= new Signal();
			_pauseSignal 				= new Signal();
			_seekSignal 				= new Signal();
			_stopSignal 				= new Signal();
			_bandwidthSignal			= new Signal( uint );
			_autoRewindSignal			= new Signal();
			_loadProgressSignal			= new Signal( uint, uint );
		}

		
		//-----------------------------------------------------------------
		// Connection
		//-----------------------------------------------------------------
		
		/**
		 * Builds the instance of the OvpConnection object.
		 * 
		 * Override this method to 
		 */
		protected function buildConnection() :void
		{
			_connection = new OvpConnection();
			_connection.addEventListener( OvpEvent.ERROR, handleError );
			_connection.addEventListener( OvpEvent.BANDWIDTH, handleRTMPBandwidth );
			_connection.addEventListener( IOErrorEvent.IO_ERROR, handleIOError );
			_connection.addEventListener( AsyncErrorEvent.ASYNC_ERROR, handleAsyncError );
			_connection.addEventListener( NetStatusEvent.NET_STATUS, handleConnectionNetStatus );
			_connection.addEventListener( SecurityErrorEvent.SECURITY_ERROR, handleSecurityError );
		}
		
		protected function closeConnection() :void
		{
			_connection.removeEventListener( OvpEvent.ERROR, handleError );
			_connection.removeEventListener( OvpEvent.BANDWIDTH, handleRTMPBandwidth );
			_connection.removeEventListener( IOErrorEvent.IO_ERROR, handleIOError );
			_connection.removeEventListener( AsyncErrorEvent.ASYNC_ERROR, handleAsyncError );
			_connection.removeEventListener( NetStatusEvent.NET_STATUS, handleConnectionNetStatus );
			_connection.removeEventListener( SecurityErrorEvent.SECURITY_ERROR, handleSecurityError );
			_connection.close();
			_connection = null;
		}
		
		protected function handleGoodConnect() :void
		{
			trace( '[FVideo].handleGoodConnect()' );
			_connectionEstablished = true;
			buildNetStream();
			setState( STATE_CONNECTED );
			_connectSignal.dispatch();
		}

		protected function handleConnectionNetStatus( $e :NetStatusEvent ) :void
		{
//			trace( '[FVideo].handleConnectionNetStatus() ' + $e.info['code'] );
			switch( $e.info['code'] )
			{
				case 'NetConnection.Connect.Success':
					handleGoodConnect();
					break;
					
				case 'NetConnection.Connect.Closed':
					trace( '[FVideo] onNetConnectionStatus() :: Disconnected unexpectedly!' );
					// TODO: Automatically reconnect?
					_connectionEstablished = false;
					setState( STATE_DISCONNECTED );
					_disconnectSignal.dispatch();
					_connection.reconnect();
					break;
			}
		}
		
		protected function handleSecurityError( $e :SecurityErrorEvent ) :void
		{
			trace( '[FVideo].handleSecurityError() ' + $e.text );
		}
		
		protected function handleIOError( $e :IOErrorEvent ) :void
		{
			trace( '[FVideo].handleIOError() ' + $e.text );
		}
		
		protected function handleError( $e :OvpEvent ) :void
		{
			trace( '[FVideo].handleError() ' );
			inspectObject( $e.data );
		}
		
		protected function handleAsyncError( $e :AsyncErrorEvent ) :void
		{
			trace( '[FVideo].handleAsyncError()' );
		}
		
		//-----------------------------------------------------------------
		// Net Stream
		//-----------------------------------------------------------------
		
		protected function resetStreamInfo() :void
		{
			_duration = 0;
			_playing = false;
			_seeking = false;
			_userPaused = false;
			_metadata = null;
			_playheadTime = 0;
			_queuedSeekTime = NaN;
			_bytesLoaded = 0;
			_bytesTotal = 0;
			_startTime = NaN;
			_readyToEnd = false;
		}

		protected function buildNetStream() :void
		{
			_stream = new OvpNetStream( _connection );
			_stream.createProgressivePauseEvents = true;
			_stream.progressInterval = this.stage ? int(( 1/this.stage.frameRate )*1000) : 33;
			_stream.useFastStartBuffer = ( _streaming ) ? _useFastStartBuffer : false;
			_stream.maxBufferLength = _bufferLength;
			_stream.volume = _volume;
			_stream.addEventListener( OvpEvent.COMPLETE, handlePlaybackComplete );
			_stream.addEventListener( OvpEvent.NETSTREAM_METADATA, handleMetadata );
			_stream.addEventListener( OvpEvent.NETSTREAM_CUEPOINT, handleCuePoint );
			_stream.addEventListener( OvpEvent.PROGRESS, handlePlayheadProgress );
			_stream.addEventListener( NetStatusEvent.NET_STATUS, handleNetStatus );
			this.attachNetStream( _stream );
		}
		
		protected function closeStream() :void
		{
			trace( '[FVideo].closeStream()' );
			_stream.removeEventListener( OvpEvent.COMPLETE, handlePlaybackComplete );
			_stream.removeEventListener( OvpEvent.NETSTREAM_METADATA, handleMetadata );
			_stream.removeEventListener( OvpEvent.NETSTREAM_CUEPOINT, handleCuePoint );
			_stream.removeEventListener( OvpEvent.PROGRESS, handlePlayheadProgress );
			_stream.removeEventListener( NetStatusEvent.NET_STATUS, handleNetStatus );
			try{ _stream.pause(); } catch( $e:* ){};
			try{ _stream.close(); } catch( $e:* ){};
			_stream = null;
		}
		
		protected function playStream() :void
		{
			_stream.play( _url );
			setState( STATE_LOADING );
		}
		
		private function pauseStream() :void
		{
			_stream.pause();
		}
		
		protected function handleCuePoint( $e : OvpEvent ) :void
		{
			trace( '[FVideo].handleCuePoint()' );
			inspectObject( $e.data );
//			_cuePointSignal.dispatch();
		}
		
		protected function handleMetadata( $e : OvpEvent ) :void
		{
			trace( '[FVideo].handleMetadata() ');
			inspectObject( $e.data );
			_metadata = $e.data;
			_duration = _metadata['duration'];
			_nativeDimensions.width = _metadata[ 'width' ];
			_nativeDimensions.height = _metadata[ 'height' ];
			size();
			if( _autoSetBufferTime ) calcBufferTime();
			_metadataSignal.dispatch( _metadata );
		}
		
		protected function handlePlayheadProgress( $e :OvpEvent ) :void
		{
			// handle complete
			// TODO: Test with RTMP and other progressive videos. This was added to the playhead progress
			// handler instead of the built-in Ovp.Complete event due to the fact that the this event was firing
			// well before the stream was actually finished. When I first ran into this, it was off by as much as 1.6 seconds.
			// The complete event now just indicates the stream is about to finish, which tells this block of code
			// to fire off the complete event when the stream's time stops updating. Also, we can't just look to see
			// if the stream time matching the duration, since where the stream actually stops can be before the duration
			// set in the metadata.
			if( _readyToEnd && _playheadTime == _stream.time )
			{
				_playing = false;
				_readyToEnd = false;
				setState( STATE_STOPPED );
				_playheadUpdateSignal.dispatch( _playheadTime );
				if ( _autoRewind ) 
				{
					_stream.seek( 0 );
					_stream.pause();
				}
				// dispatch signals last to avoid causing reference errors on the same loop.
				// TODO: Test!
				_completeSignal.dispatch();
				if ( _autoRewind && _autoRewindSignal ) _autoRewindSignal.dispatch();
				return;
			}
			// handle interruption in playback, usually caused by buffering.
			else if( _playheadTime == _stream.time )
			{
				// TODO: See if we need to migrate code for forcing the complete event.
				
				if( _playing && _stream.isBuffering )
					setState( STATE_BUFFERING );
				
				return;
			}
			
			_playheadTime = _stream.time;
			
			if ( _playing && _state != STATE_PLAYING && _playheadTime < _duration ) 
			{
				setState( STATE_PLAYING );
				_playingSignal.dispatch();
			}
			
			_playheadUpdateSignal.dispatch( _playheadTime );
		}
		
		protected function handlePlaybackComplete( $e : OvpEvent ) :void
		{
//			trace( '[FVideo].handlePlaybackComplete() :: ' + _stream.time + " / " + _duration );
			
			_readyToEnd = true;
			
			/*
			setState( STATE_STOPPED );
			_completeSignal.dispatch();
			if ( _autoRewind ) 
			{
				_stream.seek( 0 );
				_stream.pause();
				_autoRewindSignal.dispatch();
			}
			*/
		}
		
		protected function handleNetStatus( $e :NetStatusEvent ):void
		{
//			trace( '[FVideo].handleNetStatus() :: ' + $e.info[ 'code' ] );
			switch( $e.info[ 'code' ])
			{
				case "NetStream.Seek.Notify":
					// done seeking.
					_seeking = false;
					if ( !isNaN( _queuedSeekTime ))
					{
						seek( _queuedSeekTime );
						_queuedSeekTime = NaN;
					}
					// return to a paused state if we were paused and then told to seek. 
					else if ( _userPaused )
					{
						trace( '[FVideo].handleNetStatus() :: Returning to paused state after seek' );
						setState( STATE_PAUSED );
					}
					break;
					
				case "NetStream.Seek.Failed":
					trace( "[FVideo] onSeekStatus() \n\tSeek failed to complete." );
					break;
					
				case "NetStream.Seek.InvalidTime":
					// seek to the last available keyframe.
					_stream.seek( $e.info['details']);
					break;
			}
		}
		
		//-----------------------------------------------------------------
		// Streaming (RTMP) Logic
		// TODO: this is only here for easy clicking around.
		//-----------------------------------------------------------------
		
		protected function prepareRTMPConnection() :void
		{
			_connection.addEventListener( OvpEvent.STREAM_LENGTH, handleRTMPStreamLength );
		}
		
		protected function resetRTMP() :void
		{
			_connection.removeEventListener( OvpEvent.STREAM_LENGTH, handleRTMPStreamLength );
			_connection.removeEventListener( NetStatusEvent.NET_STATUS, handleRTMPConnectThenPlay );
		}
		
		protected function playRTMPStream() :void
		{
			// request the stream length if we're connected.
			if( _connectionEstablished ) 
			{
				trace( '[FVideo].playRTMPStream(), Connection exists, requesting stream length.' );
				_connection.requestStreamLength( _url );
			}
			// otherwise, wait for the connection to establish then connect.
			else 
			{
				trace( '[FVideo].playRTMPStream(), No connect yet. Waiting for connect...' );
				_connection.addEventListener( NetStatusEvent.NET_STATUS, handleRTMPConnectThenPlay );
			}
		}
		
		protected function handleRTMPConnectThenPlay( $e :NetStatusEvent ) :void
		{
			if ( $e.info['code'] == 'NetConnection.Connect.Success' )
			{
				trace( '[FVideo].handleConnectThenPlay()\n\tConnection established. Loading stream...' );
				_connection.removeEventListener( NetStatusEvent.NET_STATUS, handleRTMPConnectThenPlay );
				_connection.requestStreamLength( _url );
			}
		}
		
		protected function handleRTMPStreamLength( $e :OvpEvent ) :void
		{
			_duration = $e.data['streamLength'];
			if( _checkBandwidth ) 
			{
				trace( '[FVideo].handleRTMPStreamLength() :: Bandwidth not set, detecting...' );
				_connection.detectBandwidth();
			}
			else
			{
				trace( '[FVideo].handleRTMPStreamLength() :: Bandwidth detection not needed. Playing stream.' );
				playStream();
				if ( _userPaused ) pauseStream();
			}
		}
		
		protected function handleRTMPBandwidth( $e :OvpEvent ) :void
		{
			_checkBandwidth = false;
			FVideo.bandwidth = $e.data['bandwidth'];
//			trace( '[FVideo].handleRTMPBandwidth() :: bandwidth: ' + FVideo.bandwidth );
			playStream();
			if ( _userPaused ) pauseStream();
			_bandwidthSignal.dispatch( FVideo.bandwidth );
		}
		
		//-----------------------------------------------------------------
		// Progressive (HTTP) Logic
		//-----------------------------------------------------------------
		
		protected function prepareHTTPStream() :void
		{
			trace( '[FVideo].prepareHTTPStream()' );
			setState( STATE_CONNECTING );
			if( !_httpBandwidthTimer ) 
			{
				_httpBandwidthTimer = new Timer( DEFAULT_BUFFER_LENGTH * 2000 );
				_httpBandwidthTimer.addEventListener( TimerEvent.TIMER, handleHttpBandwidthTimer );
			}
			else _httpBandwidthTimer.reset();
			_connection.connect( null );
			_stream.addEventListener( OvpEvent.STREAM_LENGTH, handleHTTPStreamLength );
			_stream.addEventListener( OvpEvent.PROGRESS, handleHTTPLoadProgress );
		}
		
		protected function playHTTPStream() :void
		{
			_lastByteCount = 0;
			_startTime = getTimer();
			if( _autoDetectBandwidth )_httpBandwidthTimer.start();
			playStream();
		}
		
		protected function resetHTTP() :void
		{
			killHttpTimer();
			_stream.removeEventListener( OvpEvent.STREAM_LENGTH, handleHTTPStreamLength );
			_stream.removeEventListener( OvpEvent.PROGRESS, handleHTTPLoadProgress );
		}
		
		protected function killHttpTimer() :void
		{
			_httpBandwidthTimer.removeEventListener( TimerEvent.TIMER, handleHttpBandwidthTimer );
			_httpBandwidthTimer.stop();	
		}
		
		protected function handleHttpBandwidthTimer( $e :TimerEvent ) :void
		{
			if( _bytesLoaded < _bytesTotal )
			{
				FVideo.bandwidth = getKbps( _bytesLoaded - _lastByteCount, _startTime );
				trace( '[FVideo].handleHttpBandwidthTimer() :: bandwidth is ' + FVideo.bandwidth );
				if( _autoSetBufferTime ) calcBufferTime();
				_lastByteCount = _bytesLoaded;				
				_startTime = getTimer();
				_bandwidthSignal.dispatch( FVideo.bandwidth );
			}
			else killHttpTimer();
		}

		private function handleHTTPLoadProgress( $e :OvpEvent ) :void
		{
			if( _stream )
			{
				_bytesLoaded = _stream.bytesLoaded;
				_bytesTotal = _stream.bytesTotal;
				_loadProgressSignal.dispatch( _bytesLoaded, _bytesTotal );
			}
		}

		protected function handleHTTPStreamLength( $e :OvpEvent ) :void
		{
//			trace( '[FVideo].handleHTTPStreamLength()' );
//			inspectObject( $e.data );
			_duration = $e.data['streamLength']; 
		}
		
		//-----------------------------------------------------------------
		// Buffer Time Calculations
		//-----------------------------------------------------------------
		
		
		private final function calcBufferTime() : void
		{
			if ( _metadata == null ) return;
			
			var videorate : Number = !isNaN( _metadata[ "videodatarate" ] ) ? _metadata[ "videodatarate" ] : 0;
			var audiorate : Number = !isNaN( _metadata[ "audiodatarate" ] ) ? _metadata[ "audiodatarate" ] : 0;
			var datarate : Number = videorate + audiorate;
			var bandwidth : Number = FVideo.bandwidth;
			
			// we can't proceed if the metadata doesn't have the data rates or we don't have a bandwidth reading. 
			if ( datarate == 0 || isNaN( bandwidth )) 
			{
				if ( datarate == 0 ) trace( "[FVideo].calcBufferTime() :: The video loaded does not contain datarate metadata information. Optimal buffer time cannot be calculated." );
				if ( isNaN( bandwidth )) trace( "[FVideo].calcBufferTime() :: The user bandwidth has not been set. Optimal buffer time cannot be calculated. Either use FVideo.autoDetectBandwidth or manually set it using the FVideo.bandwidth property." );
//				if ( _httpBandwidthTimer && datarate == 0 ) killHttpTimer();
				return;
			}
			
			// determine % value of download rate to video data rate.
			var downloadRatio : Number = bandwidth / datarate;
			
//			trace( '[FVideo].calcBufferTime() :: downloadRatio is ' + downloadRatio );
			
			// if our download ratio is less than sufficient (less than 200% of the total data rate)
			// then weneed to adjust the bufferTime to a number that will work for the download speed.
			if ( downloadRatio < 2 && bandwidth > 0 ) 
			{
				// determine the optimal buffer value based on their download speed.
				var optimalBuffer : Number = Math.ceil(_duration - _duration / (datarate / bandwidth));

				// limit how small the buffer can be. 
				if ( optimalBuffer < 0.5 ) optimalBuffer = 0.5;
				// make sure we don't set a buffer time longer than the video's duration. that's bad.
				else if ( optimalBuffer > _duration ) optimalBuffer = Math.floor( _duration );
				
				// since we don't have enough bandwidth to meet the video's needs to play back in 'real-time'
				// we can't use fast start. Otherwise we'll have a quick startup and almost immediate re-buffering.
				if( _streaming && _stream.useFastStartBuffer ) _stream.useFastStartBuffer = false;
				
				// set the new time on the net stream.
				if( _stream.bufferTime != optimalBuffer )
				{
					_stream.bufferTime = optimalBuffer; 
					_stream.maxBufferLength = optimalBuffer * 2;
				}
				
				trace( '[FVideo].calcBufferTime() :: Optimal buffer is: ' + optimalBuffer );
			}
			else
			{
//				trace( '[FVideo].calcBufferTime() :: Using default buffer length: ' + _bufferLength );
				
				// otherwise go ahead and use fast start since our connection speed is fast 
				// enough to keep the buffer filled as the video plays.
				 if ( _useFastStartBuffer && _streaming ) _stream.useFastStartBuffer = true;
				 
				// use either stored buffer length or the default.
				_stream.bufferTime = _stream.maxBufferLength = _bufferLength;
			}
		}
		
		//-----------------------------------------------------------------
		// Sizing
		//-----------------------------------------------------------------
		
		/**
		 * @private
		 * Scales and then positions the video player based on scaleMode and align properties. 
		 */
		protected function size() : void
		{
			scale();
			position();			
		}
		
		private final function scale() : void
		{
			switch( _scaleMode )
			{
				case SCALE_EXACT_FIT:
					_videoWidth = super.width = _videoArea.width;
					_videoHeight = super.height = _videoArea.height;
					break;
				
				case SCALE_NONE:
					_videoWidth = super.width = _nativeDimensions.width;
					_videoHeight = super.height = _nativeDimensions.height;
					break;
				
				case SCALE_MAINTAIN_ASPECT_RATIO:
					var newWidth : Number = ( _nativeDimensions.width * _videoArea.height / _nativeDimensions.height);
					var newHeight : Number = ( _nativeDimensions.height * _videoArea.width / _nativeDimensions.width);
					if (newHeight < _videoArea.height ) 
					{
						_videoWidth = super.width = _videoArea.width;
						_videoHeight = super.height = newHeight;
					} 
					else if (newWidth < _videoArea.width) 
					{
						_videoWidth = super.width = newWidth;
						_videoHeight = super.height = _videoArea.height;
					} 
					else 
					{
						_videoWidth = super.width = _videoArea.width;
						_videoHeight = super.height = _videoArea.height;
					}
					break;
				default:
					throw new Error( "Illegal scale mode specified." );
			}
		}
		
		private final function position() : void
		{
			super.x = calcX();
			super.y = calcY();
		}
		
		private final function calcX() : int
		{
			var x:int = 0;
			switch( _align )
			{
				case ALIGN_RIGHT:
				case ALIGN_TOP_RIGHT:
				case ALIGN_BOTTOM_RIGHT:
					x = _videoArea.width - _videoWidth;
					break;
				case ALIGN_TOP:
				case ALIGN_CENTER:
				case ALIGN_BOTTOM:
					x = _videoArea.width / 2 - _videoWidth / 2;
					break;
			}
			return x + _videoArea.x;
		}
		
		private final function calcY() : int
		{
			var y : int = 0;
			switch( _align )
			{
				case ALIGN_BOTTOM:
				case ALIGN_BOTTOM_LEFT:
				case ALIGN_BOTTOM_RIGHT:
					y = _videoArea.height - _videoHeight;
					break;
				case ALIGN_LEFT:
				case ALIGN_RIGHT:
				case ALIGN_CENTER:
					y = _videoArea.height / 2 - _videoHeight / 2;
					break;
			}
			return y + _videoArea.y;
		}
		
		//-----------------------------------------------------------------
		// Helper methods
		//-----------------------------------------------------------------

		/**
		 * @private
		 * Determines the bandwidth being used by the current load. 
		 * @return the Kbps of the current bandwidth.
		 */
		private final function getKbps( $sizeInBytes:Number, $startTime :Number ):int 
		{
			var elapsedTimeMS:Number = getTimer() - $startTime; // time elapsed since start loading swf
			var elapsedTime:Number = elapsedTimeMS/1000; //convert to seconds
			var sizeInBits:Number = $sizeInBytes * 8; // convert Bytes to bits
			var sizeInKBits:Number = sizeInBits/1024; // convert bits to kbits
			var kbps:Number = ( sizeInKBits/elapsedTime );
			return int( kbps ); // return user friendly number
		}

		private final function setState( $state :String ) :void
		{
			if( $state != _state )
			{
//				trace( '[FVideo].setState() :: ' + $state );
				_state = $state;
				_stateSignal.dispatch( _state );
			}
		}
		
		private function inspectObject( $obj : Object ) :void
		{
			for( var prop : String in $obj )
			{
				trace( '\t' + prop + ' = ' + $obj[prop] );
			}
		}

		private final function setProperties( $obj : Object ) :void
		{
			for( var prop : String in $obj )
			{
				if( this.hasOwnProperty( prop )) this[ prop ] = $obj[ prop ];
				else
				{
					throw new Error( "The property " + prop + " was not found on " + this.toString());
				}
			}
		}
	}
}