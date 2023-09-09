/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/*
	Create a drawer object.
	
	string drawerName - a unique name. Used as a storage key in DrawerManager and in widget preferences.
	string drawerID - the ID of the drawer container element.
	string buttonID - the ID of the toolbar button to open/close this drawer, and to indicate status.
*/
	
Drawer = function(drawerName)
{
	var self = this;
	
	self.name = drawerName;

	// Can't associate with DOM elements yet 

	var element = null;
	var buttonElement = null;
	var closeButton = null;
	
	// Transition animation - only one per drawer 
	
	var transition = null;
	self.manager = null;

	/* DOM has been loaded - look up elements and attach button event handlers */
	
	self.init = function(elem, buttonElem)
	{
		// Drawer should be hidden by default 
		
		element = elem;
		element.css({opacity: 0.0});
			
		buttonElement = buttonElem;

		// When clicked, ask my drawer manager to open or close me 
		
		buttonElement.click(function(evt)
		{
			if (!evt.target.disabled)
			{
				self.manager.toggleActive(self);
			}
		});
				
		// append a quick-close button to the bottom of each drawer 
		
		closeButton = $(document.createElement("div")).appendChild(document.createElement("button"));
		element.append(closeButton);
		closeButton.addClass("closedrawer");
		closeButton.click(function() { self.manager.closeActive(); });
	}

	/* General-purpose start/end methods to pass to the Animation object */
	
	var openStart = function() { element.show(); }
	var openFinish = function() { }
	var closeStart = function() { }
	var closeFinish = function() { element.hide(); }
	
	/* Close this drawer */
	
	self.close = function(fast)
	{
		// If asked to close without animation, do it 
	
		element.stop();
		
		closeStart();
		element.animate({opacity: 0.0}, (fast ? 0 : 500), null, closeFinish);
		
		// Highlight the connected toolbar button 
		
		buttonElement.removeClass("selected");
	}

	self.open = function(fast)
	{
		// De-highlight the connected toolbar button 
		
		element.top();
		
		buttonElement.addClass("selected");
		openStart();
		
		// If asked to open without animation, do it 
		
		element.animate({opacity: 1.0}, (fast ? 0 : 500), null, openFinish);
		
	}
	
	/* Overridable by specific instances */
	self.redraw = function() { }

}

/*
	Create a supervisor object to maintain state between Drawer objects.
	
	string prefsPrefix - unique prefix for saving settings with widget.setPreferenceForKey(). Allows multiple DrawerManagers.
	string defaultDrawerName - the name of the drawer to open by default, or 'none'.
*/

DrawerManager = function(prefsPrefix, defaultDrawerName)
{
	var self = this;
	
	// Store reference to currently-open drawer 
	
	var activeDrawer = null;
	
	// Maintain lookup table of all registered Drawer objects 
	
	var drawers = {};

	// If not supplied, default to no drawer. Load last-used drawer. 

	if (!defaultDrawerName) defaultDrawerName = "none";
	var savedDrawer = new Preference(prefsPrefix + "_active", defaultDrawerName);
	savedDrawer.load();
	
	self.fastSwitch = false;
	
	/* When DOM loaded, this will be called */
	
	self.init = function()
	{
		// Call each registered drawer's init() method too 
		
		/*for (thisDrawer in drawers)
		{
			drawers[thisDrawer].init();
		}*/
		
		// If a drawer was left open last time, open it now 
			
		if (savedDrawer.get() != "none")
		{
			self.openActive(drawers[savedDrawer.get()], true);
		}
	}
	
	/* Register a new drawer with the manager */
	
	self.addDrawer = function(newDrawer)
	{
		drawers[newDrawer.name] = newDrawer;
		newDrawer.manager = self;
		
		return newDrawer; // for chaining function calls
	}
	
	/* Retrieve a drawer from the registry by name */
	
	self.getDrawerByName = function(drawerName)
	{
		return drawers[drawerName];
	}
	
	/* Redraw all the drawers */
	
	self.redrawAll = function()
	{
		for (currentDrawer in drawers)
		{
			drawers[currentDrawer].redraw();
		}
	}
	
	/* Open a drawer if its not already, otherwise close it. If a different drawer is open, close it first. */
		
	self.toggleActive = function(selectedDrawer, fast)
	{
		if (activeDrawer)
		{
			if (activeDrawer === selectedDrawer)
			{
				self.closeActive(fast);
			}
			else
			{
				self.closeActive(fast);
				self.openActive(selectedDrawer, fast);
			}
		}
		else
		{
			self.openActive(selectedDrawer, fast);
		}

	}
	
	/* Close the current open drawer, no matter what it is */
	
	self.closeActive = function(fast)
	{
		self.beforeClose();
		if (activeDrawer)
		{
			activeDrawer.close(fast || self.fastSwitch);
			activeDrawer = null;
			savedDrawer.set("none");
		}
		self.afterClose();
	}
	
	/* Open a drawer, checking to see if it's one of mine first */
	
	self.openActive = function(selectedDrawer, fast)
	{
		self.beforeOpen();
		if (selectedDrawer && selectedDrawer.manager === self)
		{
			activeDrawer = selectedDrawer;
			activeDrawer.open(fast || self.fastSwitch);
			savedDrawer.set(activeDrawer.name);
		}
		self.afterOpen();
	}
	
	/* Test to see if testedDrawer is the one currently open */
	
	self.isActive = function(testedDrawer)
	{
		return (activeDrawer && activeDrawer === testedDrawer)
	}	
		
	/* Individual instances can override these methods to modify behaviour */
	
	self.beforeClose = function() {}
	self.afterClose = function() {}
	self.beforeOpen = function() {}
	self.afterOpen = function() {}
	
}
