/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/

/*
	An object which checks an RSS feed for news about new software versions. Accesses fairly minimal RSS data.
	
	string newFeedURL - the URL of the feed to check.
	string prefsPrefix - a prefix to add to widget.setPreferenceForKey() calls to keep instances unique.
*/

NewsChecker = function(newFeedURL, prefsPrefix)
{
	var self = this;
	
	var feedURL = newFeedURL;
	
	// One AJAX transaction object, so we can cancel earlier attempts 
	var transaction = null;
	
	// Persistent Prefs object to store when the last successful check was 
	
	var lastUpdate = new Preference(prefsPrefix + "_lastUpdate", new Date(), "date");
	lastUpdate.load();
	
	// Is this feed checker enabled? 
	
	self.enabled = new Preference(prefsPrefix + "_checkEnabled", true, "bool");
	self.enabled.load();
	
	// Store the feed data and status 
	
	self.firstUnread = -1;
	self.hasUnreadItems = false;
	self.items = [];
	
	/* Check for news after [delayTime] seconds */
	
	self.delayedCheck = function(callback, delayTime)
	{
		window.setTimeout(function() { self.startCheck(callback); }, delayTime*1000);
	}
	
	/* For testing only - reset [lastUpdate] to January, 1970. Ensures old messages get downloaded. */
	
	self.resetLastUpdate = function()
	{
		lastUpdate.set(new Date(0));
	}
	
	/* Start AJAX download. Pass in callback object, consisting of success and failure callbacks. */
	
	self.startCheck = function(callback)
	{
		// Reset the feed data and status 
		
		self.firstUnread = -1;
		self.hasUnreadItems = false;
		self.items = [];
		
		// Safety check - if not running as a widget, do nothing 
		
		if (typeof widget != "undefined")
		{
			// Pass in our own callbacks, not the callers'. Pass the callers' as an argument. 
			
			var yahooCallback = { success: checkSuccess, failure: checkFailure, argument: callback };	
		
			// Abort any previous request running 
		
			if (transaction && YAHOO.util.Connect.isCallInProgress(transaction))
			{
				YAHOO.util.Connect.abort(transaction);
			}
		
			transaction = YAHOO.util.Connect.asyncRequest('GET', feedURL, yahooCallback);
		}
	}

	/* Success - parse and populate the news items */

	var checkSuccess = function(response)
	{
		// Retrieve callbacks from response 
	
		var callback = response.argument;
		
		var xmlRoot = response.responseXML;
		
		// Not got an RSS feed - tell the caller 
		
		if (xmlRoot.getElementsByTagName("rss").length == 0)
		{
			if (callback.failure) callback.failure(response.status, "failed to check for updates");
		}
		else
		{
			// Get all the RSS item elements and pull out the data we need 
			
			var feedItems = xmlRoot.getElementsByTagName("item");

			if (feedItems.length > 0)
			{
				for (var i=0; i<feedItems.length; i++)
				{
					// Populate a new news item 
				
					var pubDate = new Date(feedItems[i].getElementsByTagName("pubDate")[0].firstChild.nodeValue);
					self.items[i] = {};
					self.items[i].rawDate = pubDate.getTime();
					self.items[i].fullDate = pubDate.toUTCString();
					self.items[i].shortDate = pubDate.toLocaleString().split(" ")[0];
					self.items[i].title = feedItems[i].getElementsByTagName("title")[0].firstChild.nodeValue;
					self.items[i].link = feedItems[i].getElementsByTagName("link")[0].firstChild.nodeValue;
					self.items[i].description = feedItems[i].getElementsByTagName("description")[0].firstChild.nodeValue;
					
					// If an enclosure is provided, it's a widget download link 
					
					if (feedItems[i].getElementsByTagName("enclosure").length > 0)
					{
						self.items[i].download = feedItems[i].getElementsByTagName("enclosure")[0].getAttribute("url");
					}
					else
					{
						self.items[i].download = null;
					}
					
					// Mark it unread if newer that the last time we checked.
					// Use raw times (milliseconds since Jan 1970) to compare.

					self.items[i].unread = (self.items[i].rawDate > lastUpdate.get().getTime());

				}
				
				// Make sure they're sorted into date order 

				self.items.sort(function(a,b) { return ((a.rawDate < b.rawDate) ? -1 : 1); });
				
				// Find the first unread item in the list, so the caller can choose where to start 

				for (var i=0; (i<self.items.length) && (self.firstUnread == -1); i++)
				{
					if (self.items[i].unread) self.firstUnread = i;
				}

			}
			
			// Set convenient status flags if any items are unread 

			self.hasUnreadItems = (self.items.length != 0 && self.firstUnread >= 0);
			
			// Save the current time as lastUpdate 
			
			lastUpdate.set(new Date());
			
			// If a success callback has been defined, call it 
			
			if (callback.success) callback.success();
			
		}
		
		
	}
	
	/* Check failed - if a callback is defined, call it with the error info */
	
	var checkFailure = function(response)
	{
		var callback = response.argument;
		
		if (callback.failure) callback.failure(response.status, response.statusText);
	}	

}