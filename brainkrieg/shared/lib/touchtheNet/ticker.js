Ticker = function(tickerId, animSpeed)
{
	var self = this;
	var containerId = tickerId;
	var nextMessageCallback = null;
	
	var container = null;
	var element1 = null;
	var element2 = null;
	var elementWidth = 50;
	var speed = animSpeed;
	
	var anim = null;
	
	var isOpen = false;

	self.init = function(callback)
	{
		nextMessageCallback = callback;
		
		container = document.getElementById(containerId);
		container.removeChildren();
		elementWidth = parseInt(container.style.width) + "px";
		container.style.width = parseInt(container.style.width)*2 + "px";
		
		element1 = container.appendChild(document.createElement("div"));
		element1.style.width = elementWidth;
		element1.style.styleFloat = "left";
		element1.style.overflow = "hidden";
		element1.style.whiteSpace = "nowrap";

		element2 = container.appendChild(document.createElement("div"));
		element2.style.width = elementWidth;
		element2.style.styleFloat = "left";
		element2.style.overflow = "hidden";
		element2.style.whiteSpace = "nowrap";
		
		element1.appendChild(nextMessageCallback());
		element2.appendChild(nextMessageCallback());

		container.style.left = "0px";
		
		anim = container.createAnimation();
		
		anim.accelerationProfile = anim.sine;
		anim.speed = speed;
		anim.addAnimation("left", "0px", "-"+elementWidth);
		anim.onfinish = nextMessage;
	}
	
	self.start = function()
	{
		if (container && element1 && element2)
		{
			isOpen = true;
			
			nextMessage();
			
		}
	}
	
	self.stop = function()
	{
		isOpen = false;
	}
	
	self.reset = function()
	{
		var first = container.children[0];
		var second = container.children[1];
		
		first.removeChildren().appendChild(nextMessageCallback());
		second.removeChildren().appendChild(nextMessageCallback());
		
	}
	
	var nextMessage = function()
	{
		var first = container.removeChild(container.firstChild);
		first.removeChildren();
		first.appendChild(nextMessageCallback());
		
		container.appendChild(first);
		
		container.style.left = "0px";
		
		window.setTimeout(function()
		{
			if (isOpen) anim.run();
		}, 10000);
	}
	
}