/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/* Miscellaneous shared functions */

/* HTMLElement method additions */

HTMLElement.prototype.removeChildren = function()
{
	while (this.hasChildNodes()) { this.removeChild(this.firstChild); }
	return this;
}

HTMLElement.prototype.addClassName = function (newClass)
{
	var classArray = this.className.split(" ");
	var found = false;
	for (var i=0; i<classArray.length; i++)
	{
		if (classArray[i] == newClass) found = true;
	}
	if (!found)
	{
		classArray.push(newClass);
		this.className = classArray.join(" ");
	}
}

HTMLElement.prototype.removeClassName = function (oldClass)
{
	var classArray = this.className.split(" ");
	for (var i=0; i<classArray.length; i++)
	{
		if (classArray[i] == oldClass) 
		var discard = classArray.splice(i,1);
	}
	this.className = classArray.join(" ");
}

HTMLElement.prototype.hasClassName = function (class)
{
	var classArray = this.className.split(" ");
	for (var i=0; i<classArray.length; i++)
	{
		if (classArray[i] == class) 
		return true;
	}
	return false;
}

HTMLElement.prototype.getElementsByClassName = function(class, tagName)
{
	if (!tagName) tagName = "*";
	var elems = this.getElementsByTagName(tagName);
	var list = [];
	for (var i=0; i<elems.length; i++)
	{
		if (elems[i].hasClassName(class))
			list.push(elems[i]);
	}
	return list;
}

/* Date method additions and other functions */

/* Format a Date object as a string, according to simple substitutions */

Date.prototype.formatTemplate = function(template)
{
	var outString = template;
	outString = outString.replace("{MMM}", ["January","February","March","April","May","June","July","August","September","October","November","December"][this.getMonth()]);
	outString = outString.replace("{MM}", ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][this.getMonth()]);
	outString = outString.replace("{M}", (this.getMonth()+1).toString());
	outString = outString.replace("{DDD}", ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][this.getDay()]);
	outString = outString.replace("{DD}", ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][this.getDay()]);
	outString = outString.replace("{dd}", this.getDate());
	outString = outString.replace("{hh}", this.getHours());
	var tempMins = ("00" + this.getMinutes().toString());
	outString = outString.replace("{mm}", tempMins.substr(tempMins.length-2, 2));
	outString = outString.replace("{yyyy}", this.getFullYear());
	return outString;
}

