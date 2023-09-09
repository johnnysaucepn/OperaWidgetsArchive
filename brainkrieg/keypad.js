

function NumberPad()
{
	var self = this;
	self.container = null;
	var buttonMap = {};
	
	var enabled = false;
	var visible = false;
	var paused = false;
	
	self.onNumberPressed = null;
	self.onClearPressed = null;
	
	var button0, button1, button2, button3, button4, button5, button6, button7, button8, button9, buttonC = null;
		
	// TODO: add u/d/l/r handlers
	
	function numberPressed(value)
	{
		if (enabled && visible && !paused)
		{
			if (self.onNumberPressed)
				self.onNumberPressed(value);
		}
	}
	
	function clearPressed()
	{
		if (enabled && visible)
		{
			if (self.onClearPressed)
				self.onClearPressed();
		}
		return true;
	}
	
	function keyPressed(evt)
	{
		var pressed = buttonMap[evt.which];
		if (pressed)
		{
			pressed.click();
			//evt.preventDefault();
		}
		return true;
		
	}
	
	self.show = function(bool)
	{
		visible = bool;
		redraw();
	}
	
	self.enable = function(bool)
	{
		enabled = bool;
		redraw();
	}
	
	self.pause = function(bool)
	{
		paused = bool;
		redraw();
	}	
		
	var redraw = function()
	{
		if (visible && !paused)
			self.container.show(); 
		else
			self.container.hide();
		
		if (enabled)
			self.container.find("button").removeAttr("disabled")
		else
			self.container.find("button").attr("disabled", "disabled");
	}	
			
	
	function makeButton(title, action)
	{
		var label = $(document.createElement("span")).text(title);
		var button = $(document.createElement("button")).append(label)
			//.attr("type", "button")
			.attr("disabled", "disabled")
			.addClass("button")
			.click(action);
		return button;
	}	
	
	self.init = function(container)
	{
		self.container = container;
		self.container.empty();
		
		button0 = makeButton("0", function () { numberPressed(0); return true; });
		button1 = makeButton("1", function () { numberPressed(1); return true; });
		button2 = makeButton("2", function () { numberPressed(2); return true; });
		button3 = makeButton("3", function () { numberPressed(3); return true; });
		button4 = makeButton("4", function () { numberPressed(4); return true; });
		button5 = makeButton("5", function () { numberPressed(5); return true; });
		button6 = makeButton("6", function () { numberPressed(6); return true; });
		button7 = makeButton("7", function () { numberPressed(7); return true; });
		button8 = makeButton("8", function () { numberPressed(8); return true; });
		button9 = makeButton("9", function () { numberPressed(9); return true; });
		buttonC = makeButton("C", clearPressed);
		
		// lookup tables to map keypress codes to buttons
		buttonMap = { 48: button0, 49: button1, 50: button2, 51: button3, 52: button4, 53: button5,
			54: button6, 55: button7, 56: button8, 57: button9, 8: buttonC, 46: buttonC };
		
		// 
		if (mediaConfig.handheld)
		{
			button0.addClass("spaceleft");
			self.container.append(button1).append(button2).append(button3);
			self.container.append(button4).append(button5).append(button6);
			self.container.append(button7).append(button8).append(button9);
			self.container.append(button0).append(buttonC);
		}
		else
		{
			buttonC.addClass("double");
			self.container.append(button7).append(button8).append(button9);
			self.container.append(button4).append(button5).append(button6);
			self.container.append(button1).append(button2).append(button3);
			self.container.append(button0).append(buttonC);
		}
	
		$(document.body).bind("keypress", keyPressed);
	}
}


function CustomPad()
{
	var self = this;
	self.container = null;
	var buttonMap = {};
	var buttonCount = 0;
	
	var enabled = false;
	var visible = false;
	var paused = false;
	
	self.onNumberPressed = null;
	
	var buttons = [];
		
	// TODO: add u/d/l/r handlers
	
	function numberPressed(value)
	{
		if (enabled && visible && value <= buttonCount && !buttons[value - 1].attr("disabled"))
		{
			if (self.onNumberPressed)
				self.onNumberPressed(value);
		}
	}
	
	function keyPressed(evt)
	{
		var pressed = buttonMap[evt.which];
		if (pressed)
		{
			pressed.click();
			//evt.preventDefault();
		}
		return true;
		
	}
	
	self.show = function(bool)
	{
		visible = bool;
		redraw();
	}
	
	self.enable = function(bool)
	{
		enabled = bool;
		redraw();
	}
	
	self.pause = function(bool)
	{
		paused = bool;
		redraw();
	}	
		
	var redraw = function()
	{
		if (visible && !paused)
			self.container.show(); 
		else
			self.container.hide();
			
		if (enabled)
			self.container.find("button").removeAttr("disabled")
		else
			self.container.find("button").attr("disabled", "disabled");
	}		
			
	
	function makeButton(value)
	{
		var alt = String(value);
		var action = function (evt) { numberPressed(value); };
	
		var button = $(document.createElement("button"))
			//.attr("type", "button")
			.attr("disabled", "disabled")
			.addClass("button")
			.click(action);
		
		var label = $(document.createElement("img"))
			.attr("src", "img/blank.png")
			.attr("alt", alt)
			.appendTo(button);
			
		return button;
	}
	
	self.useButtons = function(customList)
	{
		if (customList && customList.length > 0)
		{
			buttonCount = customList.length;
			
			for (var i=0; i<buttons.length; i++)
			{
				if (i<buttonCount)
					buttons[i].show().find("img:first").attr("src", customList[i]);
				else
					buttons[i].hide();
			}
		}
	}
	
	self.disableButton = function(number)
	{
		var i = number - 1;
		if (i<buttonCount)
			buttons[i].attr("disabled", "disabled");
	}	
	
	self.init = function(container)
	{
		self.container = container;
		self.container.empty();
		
		for (var i=1; i<10; i++)
		{
			var button = makeButton(i);
			buttons.push(button);
			buttonMap[i+48] = button;
			self.container.append(button);
		}
				
		$(document.body).bind("keypress", keyPressed);
	}
}


