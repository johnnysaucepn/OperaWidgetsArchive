var mediaConfig = new function MediaConfig()
{
	var self = this;
	
	self.handheld = false;
	self.desktop = true;
	self.tv = false;
	self.portrait = false;
	self.landscape = false;
	
	self.init = function()
	{
		self.handheld = testMediaQuery("handheld");
		self.tv = !self.handheld && testMediaQuery("tv");
		self.desktop = !self.handheld && !self.tv;
		if (self.handheld)
		{
			self.portrait = testMediaQuery("handheld and (device-aspect-ratio: 3/4)");
			self.landscape = testMediaQuery("handheld and (device-aspect-ratio: 4/3)");
		}	
			
	}
}