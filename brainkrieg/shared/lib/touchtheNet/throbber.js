/* Update throbber animation frame by switching CSS background-position */

var Throbber = function(imgURL, frames, frameRate)
{
	var self = this;
	self.element = null;
	self.src = imgURL;
	var maxFrames = frames;
	var frameDelay = 1000 / frameRate; // Convert rate in frames/sec to ms between frames
	var currentFrame = 0;
	var animTimer = null;
	
	self.init = function(element, bindToAjaxGlobal)
	{
		self.element = element.css(
			{width: "16px", height: "16px", background: "url(" + self.src + ") no-repeat top left", visibility: "hidden"}
		);
		if (bindToAjaxGlobal)
		{
			self.element
				.bind("ajaxSend", function() { self.show(); })
				.bind("ajaxComplete", function() { self.hide(); });
		}

		currentFrame = 0;
	}

	self.update = function()
	{
		self.element.css({backgroundPosition: "0px -" + (currentFrame*16) + "px"});
		currentFrame++;
		if (currentFrame >= maxFrames) currentFrame = 0;
	}

	/* Enable/disable throbber */

	self.show = function()
	{
		// Asked to enable - if not already enabled, reset animation frame count and set timer to update frame 

		if (animTimer == null)
		{
			self.element.css({visibility: "visible"});
			currentFrame = 0;
			animTimer = window.setInterval(self.update, frameDelay);
		}
	}
	
	self.hide = function()
	{
		// Asked to disable - if not already off, hide it and disable frame update timer 
		
		if (animTimer) window.clearInterval(animTimer);
		animTimer = null;
		self.element.css({visibility: "hidden"});
	}
}
