function GameResult()
{
	var self = this;
	
	self.set = function(user, date, game, score, right, total)
	{
		self.username = user.username.get();
		self.date = date;
		self.game = game;
		self.score = score;
		self.right = right;
		self.total = total;
	}
	
	self.toString = function()
	{
		var tempMonth = "0" + (self.date.getUTCMonth() + 1);
		tempMonth = tempMonth.substr(tempMonth.length - 2, 2);
		var tempDay = "0" + (self.date.getUTCDate());
		tempDay = tempDay.substr(tempDay.length - 2, 2);
		
    	var dateStr = String(self.date.getUTCFullYear()) + "-" + tempMonth + "-" + tempDay;
	
		return [self.username, dateStr, self.game.id, self.game.version, self.score, self.right, self.total].join("|");
	}
	
	self.fromString = function(instr)
	{
		var arr = instr.split("|");
	
		if (arr.length >= 7)
		{
			self.username = arr[0];
			self.date = new Date(arr[1].substr(0,4), (arr[1].substr(5,2)) - 1, arr[1].substr(8,2));
			self.game = gameController.getGame(arr[2], arr[3]);
			self.score = arr[4];
			self.right = arr[5];
			self.total = arr[6];
		}
	}
}


function User(prefix)
{
	var self = this;
	
	var loginURL = "http://xmlstore.labs.opera.com/login";
	var logoutURL = "http://xmlstore.labs.opera.com/logout";
	var saveTrainingURL = "http://www.touchthe.net/services/brainkrieg/brainkrieg10.py/saveTraining";
	var loadTrainingURL = "http://www.touchthe.net/services/brainkrieg/brainkrieg10.py/loadTraining";
	var saveTestURL = "http://www.touchthe.net/services/brainkrieg/brainkrieg10.py/saveTest";
	var loadTestURL = "http://www.touchthe.net/services/brainkrieg/brainkrieg10.py/loadTest";
	
	var prefsPrefix = prefix;
	
	self.username = new Preference(prefsPrefix + "_user", "");
	self.password = new Preference(prefsPrefix + "_pass", "");
	self.trainingHistory = {};
	self.trainingBest = {};
	self.brainAge = 32;
	
	self.init = function()
	{
		self.username.load();
		self.password.load();
		
		clearHistory();
		
		if (self.isAuthenticated())
		{
			self.login(self.username.get(), self.password.get());
		}
			
	}
	
	self.isAuthenticated = function()
	{
		return (self.username.get().length > 0);
	}
	
	function clearLogin()
	{
		self.username.set("");
		self.password.set("");
		self.isLoggedIn = false;
	}
	
	function clearHistory()
	{
		self.trainingHistory = {};
		self.trainingBest = {};
		self.history = {};
	}
	
	self.loadTraining = function()
	{
		if (self.isAuthenticated())
		{
			$.ajax({
				type: "GET",
				url: loadTrainingURL,
				data: "username=" + self.username.get(),
				beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/plain"); },
				dataType: "text",
				success: loadTrainingSuccess
			});
		}
	}
	
	var loadTrainingSuccess = function(data, textStatus)
	{
		clearHistory();
		
		var lines = data.split("\n");
		for (var i=0; i<lines.length; i++)
		{
			if (lines[i].length > 0)
			{
				var result = new GameResult();
				result.fromString(lines[i]);

				
				// only load scores from the current version of games
				if (result.game.version == gameController.getGame(result.game.id).version)
				{
					var gameUnique = result.game.unique;

					if (!self.trainingHistory[gameUnique])
						self.trainingHistory[gameUnique] = [];

					self.trainingHistory[gameUnique].push(result);

					if (!self.trainingBest[gameUnique] || (result.score > self.trainingBest[gameUnique].score))
						self.trainingBest[gameUnique] = result;
				}		
			}
		}
	
	}
	
	self.loadTest = function()
	{
		if (self.isAuthenticated())
		{
			$.ajax({
				type: "GET",
				url: loadTestURL,
				data: "username=" + self.username.get(),
				beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/plain"); },
				dataType: "text",
				success: loadTestSuccess
			});
		}
	}
	
	var loadTestSuccess = function(data, textStatus)
	{
		self.brainAge = 0;
		if (!isNaN(data))
			self.brainAge = new Number(data);
			
	}
	
	self.getHighScore = function(game)
	{
		var existingRecord = self.trainingBest[game.unique];
		
		return (!existingRecord) ? 0 : existingRecord.score;
	}
	
	self.alreadyTrainedToday = function(game)
	{
		var history = self.trainingHistory[game.unique];

		if (!history)
			return false;
		
		// Calculate today's date in days since 1970 and compare against records to see if we've saved a result today
		var msInDay = 1000 * 60 * 60 * 24; 
		var today = Math.floor(new Date().getTime()/msInDay);
		
		for (var i=0; i<history.length; i++)
		{
			if (Math.floor(history[i].date.getTime()/msInDay) == today)
				return true;
		}
		return false;
	}		
	
	self.saveTraining = function(result)
	{
		if (!self.alreadyTrainedToday(result.game))
		{
			if (!self.trainingHistory[result.game.unique])
				self.trainingHistory[result.game.unique] = [];
			self.trainingHistory[result.game.unique].push(result);
			
			if (!self.trainingBest[result.game.unique] || (result.score > self.trainingBest[result.game.unique].score))
					self.trainingBest[result.game.unique] = result;
			
			if (self.isAuthenticated())
			{
				$.ajax({
					type: "GET",
					url: saveTrainingURL,
					data: "result=" + result.toString(),
					beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/plain"); },
					dataType: "text"
				});
			}
		}
	}
	
	self.saveTest = function(results, callback)
	{
		var list = [];
		for (var i=0; i<results.length; i++)
			list.push(results[i].toString());
		
		$.ajax({
			type: "GET",
			url: saveTestURL,
			data: "results=" + list.join(","),
			beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/plain"); },
			dataType: "text",
			success: callback
		});
	}
	
	
	self.login = function(attemptUsername, attemptPassword)
	{
		if (self.isAuthenticated)
			self.logout();
	
		$.ajax({
			type: "POST",
			url: loginURL,
			data: "username="+ attemptUsername + "&password=" + attemptPassword,
			beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/xml"); },
			dataType: "xml",
			success: function(data, textStatus) { loginSuccess(data, textStatus, attemptUsername, attemptPassword); },
			error: function(xhr, textStatus, error) { loginError(xhr, textStatus, error, attemptUsername, attemptPassword); }
		});
	
	}
	
	function loginSuccess(data, textStatus, attemptUsername, attemptPassword)
	{

		// XML Store service returns valid HTTP 200 response even on failure, so check the status in the message
		if ($(data).find("statuscode:first").text() == "200")
		{
			self.username.set(attemptUsername);
			self.password.set(attemptPassword);
			self.isLoggedIn = true;

			if (self.onSuccessfulLogin)
				self.onSuccessfulLogin($(data).find("message:first").text());
			
			//self.commitPendingData();				
				
		}
		else
		{
			if (self.onFailedLogin)
				self.onFailedLogin("Login failed");
		}	
		
	}
	
	function loginError(xhr, textStatus, error, attemptUsername, attemptPassword)
	{
		if (self.onFailedLogin)
			self.onFailedLogin(textStatus);
	
	}
	
	self.onSuccessfulLogin = function(message) {}
	self.onFailedLogin = function(message) {}

	self.logout = function()
	{
		$.ajax({
			type: "GET",
			url: logoutURL,
			beforeSend: function (xhr) { xhr.setRequestHeader("X-Http-Accept-Override", "text/xml"); },
			dataType: "xml",
			success: logoutSuccess,
			error: logoutError
		});
	
	}
	
	function logoutSuccess(data, textStatus)
	{
		// XML Store service returns valid HTTP 200 response even on failure, so check the status in the message
		if ($(data).find("statuscode:first").text() == "200")
		{
			clearLogin();
			clearHistory();

			if (self.onSuccessfulLogout)
				self.onSuccessfulLogout($(data).find("message:first").text());
		}
		else
		{
			if (self.onFailedLogout)
				self.onFailedLogout("Logout failed");
		}
	}
	
	function logoutError(xhr, textStatus, error)
	{
		if (self.onFailedLogout)
			self.onFailedLogout(textStatus);

	}
	
	self.onSuccessfulLogout = function(message) {}
	self.onFailedLogout = function(message) {}
		

}