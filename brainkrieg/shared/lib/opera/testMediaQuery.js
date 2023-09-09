/*
* Copyright (c) 2007, Opera Software ASA
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*     * Redistributions of source code must retain the above copyright
*       notice, this list of conditions and the following disclaimer.
*     * Redistributions in binary form must reproduce the above copyright
*       notice, this list of conditions and the following disclaimer in the
*       documentation and/or other materials provided with the distribution.
*     * Neither the name of Opera Software ASA nor the
*       names of its contributors may be used to endorse or promote products
*       derived from this software without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY OPERA SOFTWARE ASA ``AS IS'' AND ANY
* EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
* WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL OPERA SOFTWARE ASA BE LIABLE FOR ANY
* DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
* (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
* LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
* ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
* (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
* SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * Execute a media query to determine what the browser supports
 *
 * <p>This function will attempt to execute a 
 * <a href="http://www.w3.org/TR/css3-mediaqueries/">CSS3 Media Query</a>
 * to determine if the browser supports the given media types or media features.
 * This is essentially the same as specifying a style sheet
 * rule using media queries, only in JavaScript instead.</p>
 * 
 * <p>Example usage:</p>
 * <pre><code>if (testMediaQuery("handheld")) { ... }</code></pre>
 * <p>or</p>
 * <pre><code>if (testMediaQuery("tv and (max-height: 400px)") { ... }</code></pre>
 *
 * @author Benjamin Joffe, benjoffe@opera.com
 * @param str media query to execute
 * @returns true if the browser satisfies the given media query, 
 *      otherwise false. If the browser is not capable of executing
 *      media queries then undefined will be returned.
 */

window.testMediaQuery = function(str)
{
    var self = arguments.callee;
    
    if (self._supported === undefined)
    {
      /* this block is only ever called once and determines
         whether or not the browser is capable of accurately
         executing this function
      */
      self._supported = true;
      if (!self('all') || self('not all'))
      {
        self._supported = false;
      }
    }
    if (self._supported === false)
    {
      // we have determined that the browser does not accurately
      // support media queries
      return undefined;
    }
    
    // begin the actual function
    
    try
    {
      var style = null;
      var div = document.createElement('div');
      var id = ''; // temporary string
      var ret = undefined; // the return value
      
      // we want to give the div a unique id, but we do it in this
      // loop to ensure that there are no (extremely rare) namespace
      // collisions with existing elements
      
      do {
          id = ('x'+Math.random()).replace(/\./,'');
      }
      while ( document.getElementById(id) );
      div.id = id;
      document.documentElement.appendChild(div);    
      
      // analyse what style was actually applied
      
      if (window.getComputedStyle) // standards compliant browsers
      {
        style = document.createElement('style');
        style.textContent = '@media ' + str + ' { #'+id+' { display:none !important; } } ';
        // safari prefers the style be appended to the HEAD of the document
        (document.getElementsByTagName('head')[0] || document.documentElement).appendChild(style);
        ret = ( 'none' == getComputedStyle(div,null).getPropertyValue('display') );
        style.parentNode.removeChild(style);
      }
      else
      {
        if (document.createStyleSheet && div.currentStyle) // IE
        {
          style = document.createStyleSheet();
          style.media = str;
          style.cssText = '#'+id+' { display:none !important; }';
          ret = ( 'none' == div.currentStyle.display );
          style.owningElement.parentNode.removeChild(style.owningElement)
        }
      }
      
      div.parentNode.removeChild(div);
    }
    catch (e)
    {
      ret = undefined;
      self._supported = false;
    }
                          
                          // done
    return ret;
};