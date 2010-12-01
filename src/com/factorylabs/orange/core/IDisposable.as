
package com.factorylabs.orange.core
{
	/**
	 * Provides an interface with a public <code>dispose()</code> method.
	 * 
	 * <p>This interface allows implementing classes to adhere to the standard
	 * <code>dispose()</code> method which is called when preparing an object for garbage collection.</p>
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
	public interface IDisposable
	{
		/**
		 * Prepares this object for garbage collection.
		 * 
		 * <p>This can include removing listeners, references to other objects,
		 * invoking any other process to facilitate in garbage collection, etc.</p>
		 */
		function dispose():void;
	}
}