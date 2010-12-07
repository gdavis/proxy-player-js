
package com.factorylabs.orange.core.collections
{
	import com.factorylabs.orange.core.ICloneable;
	import com.factorylabs.orange.core.IDisposable;

	import flash.utils.Dictionary;

	/**
	 * Maps provide access to stored values through a specific key.
	 * 
	 * <p>Keys are used as unique identifers to store values. Only one key may exist in each map.</p>
	 *
	 * <hr />
	 * <p><a target="_top" href="http://github.com/factorylabs/orange-actionscript/MIT-LICENSE.txt">MIT LICENSE</a></p>
	 * <p>Copyright (c) 2004-2010 <a target="_top" href="http://www.factorylabs.com/">Factory Design Labs</a></p>
 	 * 
 	 * <p>Permission is hereby granted to use, modify, and distribute this file 
 	 * in accordance with the terms of the license agreement accompanying it.</p>
	 *
	 * @author		Gabe Varela
	 * @author		Grant Davis
	 * @version		1.0.0 :: May 9, 2008
	 */
	public class Map
		implements IMap, IDisposable, ICloneable
	{	
		private var _dict :Dictionary;

		/**
		 * @inheritDoc
		 */
		public function get iterator() :Dictionary
		{
			return _dict;
		}
		
		/**
		 * @inheritDoc
		 */
		public function get length() :uint
		{
			var count :uint = 0;
			for( var key :* in _dict )
			{ 
				key;
				count++; 
			}
			return count;
		}
		
		/**
		 * @inheritDoc
		 */
		public function get keys() :Array
		{
			var _keys :Array = [];
			for( var key :* in _dict ) { _keys.push( key ); }
			return _keys;
		}
		
		/**
		 * @inheritDoc
		 */
		public function get values() :Array
		{
			var _values :Array = [];
			for each( var val :* in _dict ) { _values.push( val ); }
			return _values;
		}
		
		/**
		 * @inheritDoc
		 */
		public function get( $key :* ) :*
		{
			return _dict[ $key ];
		}
	
		/**
		 * Constructor for the Map.
		 * @param weakKeys Boolean whether or not to use a weak reference on the keys.
		 */		
		public function Map( $weakKeys :Boolean = false )
		{
			_dict = new Dictionary( $weakKeys );
		}
		
		public function toString() :String 
		{
			return 'com.factorylabs.orange.core.collections.Map';
		}

		/**
		 * @inheritDoc
		 */
		public function add( $key :*, $value :*, $force :Boolean = false ) :void
		{
			if( hasKey( $key ) && !$force ) 
				throw new MapError( 'key already in map [' + $key + ']' );
			_dict[ $key ] = $value;
		}
		
		/**
		 * @inheritDoc
		 */
		public function remove( $key :* ) :*
		{
			var val :* = _dict[ $key ];
			delete _dict[ $key ];
			return val;
		}
		
		/**
		 * @inheritDoc
		 */
		public function extend( $map :* ) :IMap
		{
			var _iterator :* = $map;
			if( $map is Map )  _iterator = Map( $map ).iterator; 
			for( var key :* in _iterator ){ add( key, _iterator[ key ] ); }
			return this;
		}
		
		/**
		 * @inheritDoc
		public function merge(map:*):IMap
		{
			var _iterator:* = shallowCopy(map);
			if (map is Map)  _iterator = Map(map).iterator; 
			// update values for keys
			for(var key:* in _iterator)
			{ 
				_dict[key] = _iterator[key]; 
				delete _iterator[key];
			}
			extend(_iterator);
			return this;
		}
		 */
		
		/**
		 * @inheritDoc
		 */
		public function hasKey( $key :* ) :Boolean
		{
			for( var _key :* in _dict )
			{
				if( _key == $key )
					return true;
			}
			return false;
		}
		
		/**
		 * @inheritDoc
		 */
		public function hasValue( $value :* ) :Boolean
		{
			for each( var item :* in _dict )
			{
				if( item == $value )
					return true;
			}
			return false;
		}
		
		/**
		 * @inheritDoc
		 */
		public function find( $func :Function ) :*
		{
			for( var key :* in _dict )
			{
				if( $func( key, _dict[ key ] ) )
					return _dict[ key ];
			}
			return null;
		}
		
		/**
		 * @inheritDoc
		 */
		public function each( $func :Function ) :void
		{
			for( var key :* in _dict )
			{
				$func( key, _dict[ key ] );
			}
		}
		
		/**
		 * @inheritDoc
		 */
		public function clear() :void
		{
			for( var key :* in _dict ){ delete _dict[ key ]; }
		}
		
		/**
		 * @inheritDoc
		 */
		public function dispose() :void
		{
			clear();
		}
		
		/**
		 * @return a copy of this Map.
		 */
		public function clone() :*
		{
			var map :Map = new Map();
			for(var key :* in IMap( this ).iterator) IMap( map ).add( key, IMap( this ).get( key ) );
			return map;
		}
	}
}

class MapError
	extends Error
{
	public function MapError( $msg :String )
	{
		super( $msg );
	}
}

