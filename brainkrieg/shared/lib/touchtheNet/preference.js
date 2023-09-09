/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/*
	Wrapper for widget.(get|set)PreferenceForKey. Detects whether running as a widget.
	Transparently handles datatype conversion, setting default values, and calling functions when the value changes.
	Handles current Opera-style return of "" on non-existent key, or undefined for W3C Widgets 1.0.
	
	string key - widget preference key for storage.
	object value - default value if none set. Can be any data type.
	string type - can be 'string' (default), 'int', 'float', 'bool', 'date', 'stringarray'. Datatype for type conversion.
	string arrayDelimiter - array delimiter for 'stringarray' type, defaults to comma.
*/

Preference = function(key, value, type, arrayDelimiter)
{
	var self = this;
	var prefKey = key;
	var dataType = type;
	var defaultValue = value;
	var prefValue = defaultValue;
	var delimiter = arrayDelimiter || ",";
	
	/* Load from widget store */
	
	self.load = function()
	{
		var savedValue = "";
		
		// If running as a widget, load the pref, otherwise just use the default 
		
		if (typeof widget != "undefined")
		{
			savedValue = widget.preferenceForKey(prefKey);
		}
		
		// If key didn't exist, use default 
		
		if (!savedValue || savedValue == "")
		{
			savedValue = defaultValue;
		}
		else
		{
			// Convert pref value from string to datatype 
			
			switch (dataType)
			{
				case "int":
					savedValue = parseInt(savedValue); break;
				case "float":
					savedValue = parseFloat(savedValue); break;
				case "bool":
					savedValue = (savedValue == "true" ? true : false); break;
				case "date":
					savedValue = new Date(savedValue); break;
				case "stringarray":
					savedValue = savedValue.split(delimiter); break;
			}
		}
		
		// Save it 
		
		self.set(savedValue);
	}
	
	/* Retrieve the current value of the pref */
	
	self.get = function()
	{
		return prefValue;
	}
	
	/* Set a new value, converting and calling change handlers as necessary */
	
	self.set = function(newValue)
	{
		prefValue = newValue;
		var strValue = newValue;
		
		// Do the datatype conversion, so we can save as a string 
		
		switch (dataType)
		{
			case "int":
			case "float":
				strValue = "" + newValue; break;
			case "bool":
				strValue = (newValue ? "true" : "false"); break;
			case "date":
				strValue = newValue.getTime().toString(); break;
			case "stringarray":
				strValue = newValue.join(delimiter); break;
		}
		
		// Safety check - only save if running as a widget 
			
		if (typeof widget != "undefined")
		{
			widget.setPreferenceForKey(strValue, prefKey);
		}
		
		// Call change handler 
		
		self.onChange();
	}
	
	/* Overridable by specific instances */
	self.onChange = function() {}

}