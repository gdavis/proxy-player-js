
package com.factorylabs.orange.core.collections
{
	import flash.utils.Dictionary;
	
	/**
	 * Provides the basic methods to create Map objects.
	 *
	 * <hr />
	 * <p><a target="_top" href="http://github.com/factorylabs/orange-actionscript/MIT-LICENSE.txt">MIT LICENSE</a></p>
	 * <p>Copyright (c) 2004-2010 <a target="_top" href="http://www.factorylabs.com/">Factory Design Labs</a></p>
 	 * 
 	 * <p>Permission is hereby granted to use, modify, and distribute this file 
 	 * in accordance with the terms of the license agreement accompanying it.</p>
	 *
	 * @author		Grant Davis
	 * @version		1.0.0 :: May 9, 2008
	 */
	public interface IMap
	{
		/**
		 * Retrieve length of key/value pairs in map.
		 * @return uint of number of key/value pairs.
		 */
		function get length() :uint;
		
		/**
		 * Retrieve all keys in map.
		 * @return Array of keys.
		 */
		function get keys() :Array;
		
		/**
		 * Retrieve all values in map.
		 * @return Array of values.
		 */
		function get values() :Array;
		
		/**
		 * Retrieve an object referenced by it's key.
		 * @param $key * reference or value of datatype held as key in map.
		 * @return * value of key.
		 */
		function get( $key :* ) :*;
		
		/**
		 * Retrieve the property of this Map for enumeration.
		 * @return	The Dictionary iterator.
		 */
		function get iterator() :Dictionary;
		
		/**
		 * Add an object referenced by it's key.
		 * @param $key		Reference or value of datatype held as key in map
		 * @param $value	The value to be retrieved by it's key.
		 * @param $force	Override for creating duplicate keys.
		 * @throws	com.factorylabs.orange.core.collections.MapError When a duplicate key is already in the Map.
		 */
		function add( $key :*, $value :*, $force :Boolean = false ) :void
		
		/**
		 * Remove an item and it's key out of the map.
		 * @param $key * reference or value of datatype held as key in map.
		 * @return * the value held by the key.
		 */
		function remove( $key :* ) :*;
		
		/**
		 * Extend the current map by adding another to it.
		 * @param $map Dictionary or Map to be added to the map.
		 */
		function extend( $map :* ) :IMap;
		
		/**
		 * @private
		 * Merge the current map with another overwriting any old values if they exist.
		 * @param $map Dictionary or Map to be added to the map.
		 */
//		function merge( $map :* ) :IMap;
		
		/**
		 * Test for a key in the map.
		 * @param $key * reference or value of datatype held as key in map.
		 * @return Boolean to determine if key exists.
		 */
		function hasKey( $key :* ) :Boolean;
		
		/**
		 * Test for a value in the map.
		 * @param $value * reference or value of datatype held in map.
		 * @return Boolean to determine if value exists.
		 */
		function hasValue( $value :* ) :Boolean;
		
		/**
		 * Find a value in the dictionary based on custom conditional logic.
		 * @param $func	Function that return boolean based on key:*, value:* params.
		 * @return value in dictionary.
		 */
		function find( $func :Function ) :*;
		
		/**
		 * Execute a function on each key and value in the dictionary
		 * @param $func	Function that returns void based on key:*, value:* params.
		 * @return value in dictionary.
		 */
		function each( $func :Function ) :void;
		
		/**
		 * Deletes all keys and values in the map.
		 */
		function clear() :void;
		
		/**
		 * Delete all keys and values in current map.
		 */
		function dispose() :void;
	}
}