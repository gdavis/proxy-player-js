
package com.factorylabs.orange.core
{
	/**
	 * ICloneable is an interface for items that can be cloned.
	 *
	 * <hr />
	 * <p><a target="_top" href="http://github.com/factorylabs/orange-actionscript/MIT-LICENSE.txt">MIT LICENSE</a></p>
	 * <p>Copyright (c) 2004-2010 <a target="_top" href="http://www.factorylabs.com/">Factory Design Labs</a></p>
 	 * 
 	 * <p>Permission is hereby granted to use, modify, and distribute this file 
 	 * in accordance with the terms of the license agreement accompanying it.</p>
	 *
	 * @author		Sean Dougherty
 	 * @version		1.0.0 :: May 27, 2008
	 */
	public interface ICloneable 
	{
		/**
		 * Prepares an object to be cloned.
		 */
		function clone() :*;
	}
}