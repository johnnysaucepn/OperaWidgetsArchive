function CountdownTimer()
{
	var self = this;
	self.remaining = 0;
	self.action = null;
	self.tickRate = 100;
	self.running = false;
	var lastUpdated = 0;
	var ticker = null;
	
	self.set = function(secs, action, period)
	{
		self.remaining = secs * 1000;
		self.action = action;
		if (period) self.tickRate = period;
	}
	
	function update()
	{
		var now = new Date().getTime();
		self.remaining -= (now - self.lastUpdated);
		self.lastUpdated = now;
	}
	
	function tick()
	{
		update();
		if (self.remaining <= 0)
		{
			self.remaining = 0;
			self.stop();
			if (self.action) self.action();
		}
		self.onTick();

	}
	
	self.clear = function()
	{
		self.remaining = 0;
		self.action = null;
	}
	
	self.start = function()
	{
		self.lastUpdated = new Date().getTime();
		if (ticker) window.clearInterval(ticker);
		ticker = window.setInterval(tick, self.tickRate);
		self.running = true;
		self.onStart();
	}	
	
	self.stop = function()
	{	
		update();
		if (ticker)
			window.clearInterval(ticker);
		
		ticker = null;
		self.running = false;
		self.onStop();
	}
	
	self.onTick = function() {}
	self.onStart = function() {}
	self.onStop = function() {}

}

function ContinuousTimer()
{
	var self = this;
	self.tickRate = 1000;
	self.running = false;
	var lastUpdated = 0;
	var ticker = null;
	
	self.set = function(period)
	{
		self.tickRate = period;
	}
	
	function update()
	{
		self.lastUpdated = new Date().getTime();
	}
	
	function tick()
	{
		update();
		self.onTick();
	}
		
	self.start = function()
	{
		update();
		if (ticker) window.clearInterval(ticker);
		ticker = window.setInterval(tick, self.tickRate);
		self.running = true;
		self.onStart();
	}
		
	self.stop = function()
	{	
		update();
		if (ticker)
			window.clearInterval(ticker);
		
		ticker = null;
		self.running = false;
		self.onStop();
	}
	
	self.onTick = function() {}
	self.onStart = function() {}
	self.onStop = function() {}

}