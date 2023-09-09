/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/*
	A fancy sliding thing, to slide pages within a defined viewport
	
	string sliderID - DOM ID of container to attach to.
	string newExtent - width/height of each 'page', to determine how far to slide
	int newSpeed (optional) - maximum speed of scrolling, default 5.
*/

Slider = function(newExtent, newSpeed, isHoriz)
{
	var self = this;
	var dirHoriz = isHoriz;
	var extent = newExtent;

	var slider = null;
	self.fastSwitch = false;

	if (!newSpeed) newSpeed = 5;
	if (dirHoriz == null) dirHoriz = true;

	var slideAnim = null;

	// On DOM load, create an Opera Animation to change the horizontal position of the slider.
	// Use the 'sine' profile, to speed up then slow down.
	// Create only one per slider, so we can stop it and change it if the users clicks buttons quickly.
	
	self.init = function(elem)
	{
		slider = elem;
		
		/*slideAnim = slider.createAnimation();

		if (dirHoriz)
			slideAnim.addAnimation("left", slider.style.left, slider.style.left);
		else
			slideAnim.addAnimation("top", slider.style.top, slider.style.top);

		slideAnim.accelerationProfile = slideAnim.sine;
		slideAnim.speed = newSpeed;*/
		
		self.switchPage(0, true);
	}
	
	self.switchPage = function(newPage, fast)
	{
		// Where are we scrolling to? 
		
		var endPoint = "-" + (newPage * extent) + "px";
		
		// Stop the animation if already running 
		
		//slideAnim.stop();
		slider.stop();
		
		// If doing instant transitions, go straight there - otherwise change the Animation and run it 
		
		if (dirHoriz)
		{
		
			slider.animate({left: endPoint}, (fast ? 0 : 500));
			/*if (fast)
			{
				slider.style.left = endPoint;
			}
			else
			{
				slideAnim.removeAnimation("left");
				slideAnim.addAnimation("left", slider.style.left, endPoint);
				slideAnim.run();
			}*/
		}
		else
		{
			slider.animate({top: endPoint}, (fast ? 0 : 500));
			/*if (fast)
			{
				slider.style.top = endPoint;
			}
			else
			{
				slideAnim.removeAnimation("top");
				slideAnim.addAnimation("top", slider.style.top, endPoint);
				slideAnim.run();
			}*/
		}

	}
	
	/* Utility to attach action to slider page buttons */
	
	self.addButtons = function(switchButtons)
	{
		// For each button... 

		for (var i=0; i<switchButtons.length; i++)
		{
			// ...add a click action... 

			switchButtons[i].addEventListener("click", function(evt)
			{	
				// ...find out the number of the tab, and switch to that page 
				// this involves counting because of JS scoping issues 

				for (var j=0; j<switchButtons.length; j++)
				{
					if (switchButtons[j] === evt.target)
					{
						// Switch page, using fast transitions if specified by the drawer manager 

						self.switchPage(j, self.fastSwitch);
					}
				}
			}, false);
		}
			
	}
	
}
