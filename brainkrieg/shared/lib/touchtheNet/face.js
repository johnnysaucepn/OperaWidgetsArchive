/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/*
	Create a widget face.
	
	string faceID - the ID of the DOM container element to attach to.
*/

Face = function(faceName)
{
	var self = this;
	self.name = faceName;
	self.manager = null;
	var element = null;
	var transition = null;
	
	// Event handlers to be overridden
	self.onInit = null;
	self.onBeforeOpen = null;
	self.onAfterOpen = null;
	self.onBeforeClose = null;
	self.onAfterClose = null;
	self.onRedraw = null;
	
	/* When DOM is loaded, find the container element */
	
	self.init = function(elem)
	{
		element = elem;
		element.hide();
		element.css({opacity: 0.0});
				
		if (self.onInit) self.onInit();
	}
	
	var openStart = function()
	{
		if (self.onBeforeOpen) self.onBeforeOpen();
		element.css({opacity: 0.0});
		element.show();
	}
	var openFinish = function()
	{
		if (self.onAfterOpen) self.onAfterOpen();
		element.css({opacity: 1.0});
		element.show();
	}
	var closeStart = function()
	{
		if (self.onBeforeClose) self.onBeforeClose();
		element.css({opacity: 1.0});
		element.show();
	}
	var closeFinish = function()
	{
		element.css({opacity: 1.0});
		element.hide();
		if (self.onAfterClose) self.onAfterClose();
	}
	
		
	self.close = function(fast)
	{
		//fast = true;
		if (element)
		{
			element.stop();
			closeStart();				
			// Remove the current opacity animation and create a new one - allows switching in mid-transition. Run it. 
			element.animate({opacity: 0.0}, fast ? 0 : 500, null, closeFinish);
		}
	}

	self.open = function(fast)
	{
		//fast = true;
		if (element)
		{
			element.stop();
			
			openStart();
			// Remove the current opacity animation and create a new one - allows switching in mid-transition. Run it. 

			element.animate({opacity: 1.0}, fast ? 0 : 500, null, openFinish);
		}
	}

	self.redraw = function()
	{
		if (self.onRedraw) self.onRedraw();
	}

}

FaceManager = function(prefsPrefix)
{
	var self = this;
	
	// Store reference to currently-open face
	
	var activeFace = null;
	
	// Maintain lookup table of all registered Face objects 
	
	var faces = {};
	
	// Load user setting determining whether to use transition animations 
	
	self.fastSwitch = new Preference(prefsPrefix + "_fast", false, "bool");
	self.fastSwitch.load();
	
	/* When DOM loaded, this will be called */
	
	self.init = function()
	{
		// Call each registered face's init() method too 
		
		/*for (thisFace in faces)
		{
			faces[thisFace].init();
		}*/
		
		// If a face was left open last time, open it now 

	}
	
	/* Register a new face with the manager */
	
	self.addFace = function(newFace)
	{
		faces[newFace.name] = newFace;
		newFace.manager = self;
		
		return newFace; // for chaining function calls
	}
	
	/* Retrieve a face from the registry by name */
	
	self.getFaceByName = function(faceName)
	{
		return faces[faceName];
	}
	
	/* Redraw all the faces */
	
	self.redrawAll = function()
	{
		for (currentFace in faces)
		{
			currentFace.redraw();
		}
	}
	
	/* Switch to a face, checking to see if it's one of mine first */
	
	self.switchTo = function(selectedFace, fast)
	{
		if (activeFace) activeFace.close(fast || self.fastSwitch.get());
	
		self.onBeforeSwitch();
		if (selectedFace && selectedFace.manager === self)
		{
			activeFace = selectedFace;
			activeFace.open(fast || self.fastSwitch.get());
		}
		self.onAfterSwitch();
	}
	
	/* Test to see if testedface is the one currently open */
	
	self.isActive = function(testedFace)
	{
		return (activeFace && activeFace === testedFace)
	}	
		
	/* Individual instances can override these methods to modify behaviour */
	
	self.onBeforeSwitch = function() {}
	self.onAfterSwitch = function() {}
	
}

Panel = function()
{
	var self = this;
	var element = null;
	var currentlyOpen = false;
	var maxHeight = "50px;"
	
	var anim = null;

	self.init = function(elem, height)
	{
		element = elem;
		element.css({height: "0px"});
		if (height != null)
		{
			maxHeight = height + "px";
		}
		
	}
	
	self.isOpen = function()
	{
		return currentlyOpen;
	}

	var closeStart = function(evt)
	{
		element.stop();
		element.css({height: maxHeight});
		currentlyOpen = false;
	}
	
	var closeFinish = function(evt)
	{
		element.css({height: "0px"});
		element.hide();
	}

	
	self.close = function(fast)
	{
		if (element)
		{
			closeStart();
			element.animate({height: "0px"}, fast ? 0 : 500, null, closeFinish);			
		}
	}
	
	var openStart = function(evt)
	{
		element.stop();

		element.css({height: "0px"});
		element.show();
	}
	
	var openFinish = function(evt)
	{
		element.css({height: maxHeight});
		currentlyOpen = true;
	}

	self.open = function(fast)
	{
		if (element)
		{
			openStart();
			element.animate({height: maxHeight}, fast ? 0 : 500, null, openFinish);			
		}
	}
	
	self.toggle = function(fast)
	{
		if (currentlyOpen)
			self.close(fast);
		else
			self.open(fast);
	}
				

	self.redraw = function() { }

	
}