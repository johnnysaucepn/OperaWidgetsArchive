/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/* Create a pop-up dialog, with warning icon and OK button */

AlertMessage = function(alertID, alertClass, alertImg)
{
	var self = this;
	
	var elementID = alertID;
	var element = null;
	var clickBlocker = null;
	var alertImg = alertImg;
	var alertClass = alertClass;
	var button = null;
	var message = null;

	/* init() doesn't show the window, it only sets up the DOM elements */
		
	self.init = function()
	{
		// Create a click-blocking invisible DIV, to prevent anything other than clicking OK from happening 
		
		clickBlocker = document.createElement("div");
		clickBlocker.className = "clickblocker";

		// Create and append all the DOM elements 

		element = document.createElement("form");
		element.id = elementID;
		element.className = "message";
		
		var box = element.appendChild(document.createElement("div"));
	
		var icon = box.appendChild(document.createElement("img"));
		icon.src = alertImg;
	
		message = box.appendChild(document.createElement("p")).appendChild(document.createTextNode("This is an example error message."));
	
		button = box.appendChild(document.createElement("button"));
		button.appendChild(document.createTextNode("OK"));
		
		box.appendChild(document.createElement("fieldset")).appendChild(button);
		
		// When the button is clicked, hide the dialog 

		button.addEventListener("click", function(evt)
		{
			self.hide();
		}, false);
	}

	/* Remove the click blocker from the document, and then remove the alert message */
	
	self.hide = function()
	{
		if (clickBlocker.parentNode)
		{
			clickBlocker.parentNode.removeChild(clickBlocker);
		}
		if (element.parentNode)
		{
			element.parentNode.removeChild(element);
		}
	}
	
	/* Add the alert message and click blocker to the very start of the document, so they take priority */
	
	self.show = function(newText)
	{
		self.hide();
		message.nodeValue = newText;
		
		document.body.insertBefore(element,document.body.firstChild);
		document.body.insertBefore(clickBlocker,document.body.firstChild);
	}
}
