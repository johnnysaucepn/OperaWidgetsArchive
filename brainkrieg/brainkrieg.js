/*************************************************************************************************

License terms as defined in the file license.txt, which MUST be distributed unmodified with this file.

**************************************************************************************************/
   
var app = new function Brainkrieg()
{
	var updateURL = "http://touchthe.net/taxonomy/term/16%2C13/1/feed";
	
	// Local mode flag for testing - update checks on my local network won't work if I also access internet data 
	var localMode = false;
	
	// Local preference settings
	var opacity = new Preference("opacity", "1.0", "float");
	var fastSwitch = new Preference("fast", false, "bool");
	var pin = new Preference("pin", false, "bool");
	
	// Create an object to check for updates to the software 
	var updater = new NewsChecker(updateURL, "updates");

	// Create the main faces
	
	var faceMgr = new FaceManager("face");
	
	var mainFace = faceMgr.addFace(new Face("main"));
	var trainingFace = faceMgr.addFace(new Face("training"));
	var trainingResultFace = faceMgr.addFace(new Face("trainingresult"));
	var testFace = faceMgr.addFace(new Face("test"));
	var testResultFace = faceMgr.addFace(new Face("testresult"));
	var instructFace = faceMgr.addFace(new Face("instruct"));
	var gameFace = faceMgr.addFace(new Face("game"));
	var historyFace = faceMgr.addFace(new Face("history"));
	var configFace = faceMgr.addFace(new Face("config"));	
	
	var busy = new Throbber(6, 8);
	
	var user = new User("user");
	
	var gamesPerTest = 4;
	var testGames = [];
	var testResults = [];
	
/*******************/

	// Called when DOM has been initialised - set up everything DOM-dependent 
	var init = function()
	{
		mediaConfig.init();
		if (mediaConfig.desktop || mediaConfig.tv)
		{
			window.resizeTo(260,340);
		}
		else
		{
			if (mediaConfig.landscape)
				window.resizeTo(320,240);
			else if (mediaConfig.portrait)
				window.resizeTo(240,320);
		}	
		
		
		// load preferences 
		opacity.load();
		fastSwitch.load();
		pin.load();
		
		faceMgr.init();
		
		mainFace.init($("#main"));
		trainingFace.init($("#training"));
		trainingResultFace.init($("#trainingresult"));
		testFace.init($("#test"));
		testResultFace.init($("#testresult"));
		instructFace.init($("#instruct"));
		gameFace.init($("#game"));
		historyFace.init($("#history"));
		configFace.init($("#config"));		
		
		$("#body-pin").click(function() { pin.set(!pin.get()); });
		$("#body-config").click(toggleConfig);
		$("#body-close").click(function() { window.close(); });
		
		busy.init($("#body-busy"), true);
		
		// everything is ready, display the widget and starting loading the weather data 

		faceMgr.switchTo(mainFace, true);
				
		gameController.init();
		
		user.init();
		
		$(document.body).css("visibility", "visible");

	
	}
	
	// When DOM is loaded, call init method 
	$(document).ready(init);

/*******************/

	var toggleConfig = function()
	{
		if (faceMgr.isActive(mainFace))
			faceMgr.switchTo(configFace);
		else if (faceMgr.isActive(configFace))
			faceMgr.switchTo(mainFace);
	}		

	faceMgr.onAfterSwitch = function()
	{
		var button = $("#body-config");
		if (faceMgr.isActive(mainFace) || faceMgr.isActive(configFace))
			button.removeAttr("disabled");
		else
			button.attr("disabled", "disabled");			
		
		if (faceMgr.isActive(configFace))
			button.addClass("selected");
		else
			button.removeClass("selected");
	}			

	fastSwitch.onChange = function()
	{
		faceMgr.fastSwitch.set(fastSwitch.get());
	}
		
	// opacity disabled due to incorrect handling of opacity with translucency in current versions of Opera on Windows (perhaps others)
	opacity.onChange = function()
	{
		if (document.body)
			$(document.body).css("opacity", opacity.get());
	}
	
	pin.onChange = function()
	{
		if (pin.get())
		{
			$("#body-pin").addClass("selected");
			$(document.body).addClass("pinned");
		}
		else
		{
			$("#body-pin").removeClass("selected");
			$(document.body).removeClass("pinned");
		}
			
	}

/*******************/
		
	mainFace.onInit = function()
	{
		$("#main-training").click(function() { faceMgr.switchTo(trainingFace); });
		$("#main-test").click(function() { faceMgr.switchTo(testFace); });
		$("#main-history").click(function() { faceMgr.switchTo(historyFace); });
		$("#main-config").click(function() { faceMgr.switchTo(configFace); });
		
		mainFace.redraw();
	}
	
	mainFace.onRedraw = function()
	{
		if (user.isAuthenticated())
		{
			$("#menu-username").text(user.username.get());
			$("#main-test").removeAttr("disabled");
		}	
		else
		{
			$("#menu-username").text("nobody");
			$("#main-test").attr("disabled", "disabled");
		}
			
	}	
	
/*******************/

	trainingFace.onInit = function()
	{
		$("#training-back").click(function() { faceMgr.switchTo(mainFace); });
		
		var menu = $("#training .menu:first").empty();
		for (var i=0; i<gameController.availableGames.length; i++)
		{
			var game = gameController.availableGames[i];
			
			menu.append(makeGameButton(game));
		}
		
	}
	
	function makeGameButton(game)
	{
		var gameButton = $(document.createElement("button"))
		//.attr("type", "button")
			.text(game.name)
			.click(function() { startTraining(game); });
		var menuItem = $(document.createElement("li")).append(gameButton);
		return menuItem;
	}
	
	function startTraining(game)
	{
		gameController.loadGame(game, user, "training");
		faceMgr.switchTo(instructFace);
	}
	
	
			

/*******************/

	testFace.onInit = function()
	{
		$("#test-back").click(function() { faceMgr.switchTo(mainFace); });
		$("#test-start").click(nextTest);
	}

	testFace.onBeforeOpen = function()
	{
		testResults = [];
		
		testGames = [];
		var totalGames = gameController.availableGames.length;
		while (testGames.length < Math.min(gamesPerTest, totalGames))
		{
			var newGame = gameController.availableGames[Math.floor(Math.random() * totalGames)];
			var exists = false;
			for (var i=0; i<testGames.length; i++)
			{
				if (testGames[i] === newGame)
				{
					exists = true;
					break;
				}
			}

			if (!exists)
				testGames.push(newGame);
		}
	}
	
	function nextTest()
	{
		if (testGames.length > 0)
		{
			var game = testGames.splice(0, 1)[0];
			var out = [];
			for (g in game) out.push(g);
			gameController.loadGame(game, user, "test");
			faceMgr.switchTo(instructFace);
		}
		else
		{
			faceMgr.switchTo(testResultFace);
		}
	}	

/*******************/

	trainingResultFace.onInit = function()
	{
		$("#trainingresult-back").click(function() { faceMgr.switchTo(trainingFace); });
	}
	
	trainingResultFace.onBeforeOpen = function()
	{
		var result = gameController.getGameResult();
		$("#trainingresult-total").text(result.right + " / " + result.total);
		$("#trainingresult-score").text(result.score);
		if (result.score > user.getHighScore(gameController.game))
			$("#trainingresult-record").show();
		else
			$("#trainingresult-record").hide();
	
		user.saveTraining(result);
	
	}
	
	testResultFace.onInit = function()
	{
		$("#testresult-back").click(function() { faceMgr.switchTo(mainFace); });
	}
	
	testResultFace.onBeforeOpen = function()
	{
		$("#testresult-busy").show();
		$("#testresult-result").hide();
		$("#testresult-pending").hide();
		$("#testresult-age").text("99");
		$("#testresult-advice").text("Keep working to improve this!");
		
		user.saveTest(testResults, testSaved);
	}
	
	var testSaved = function(data, textStatus)
	{
		$("#testresult-busy").hide();
		if (data == "PENDING")
		{
			$("#testresult-pending").show();
		}
		else
		{
			$("#testresult-result").show();
		}
	}	
			

/*******************/

	instructFace.onInit = function()
	{
		$("#instruct-start").click(function() { faceMgr.switchTo(gameFace); });
		$("#instruct-back").click(function() { faceMgr.switchTo(mainFace); });
	}
		

	instructFace.onRedraw = function()
	{
		$("#instruct-text").empty().append(gameController.game.instructions);
		if (gameController.mode == "training" && user.alreadyTrainedToday(gameController.game))
			$("#instruct-onceperday").show();
		else
			$("#instruct-onceperday").hide();
	}
	
	instructFace.onBeforeOpen = function()
	{
		instructFace.redraw();
		if (gameController.mode == "training")
			$("#instruct-back").show();
		else
			$("#instruct-back").hide();
	}
/*******************/

	historyFace.onInit = function()
	{
		$("#history-back").click(function() { faceMgr.switchTo(mainFace); });
	}
	
	historyFace.onBeforeOpen = historyFace.redraw;
	
	historyFace.onRedraw = function()
	{
		var container = $("#history-list").empty();
		
		for (var j=0; j<gameController.availableGames.length; j++)
		{
			var game = gameController.availableGames[j];
			var history = user.trainingHistory[game.unique];
			if (history)
			{
				$("<h4>"+game.name+"</h4>").appendTo(container);
				
				var table = $("<table><thead><tr><th>Date</th><th>Score</th><th>Questions</th></tr><tbody></tbody></table>").appendTo(container);
				var tbody = table.find("tbody:first");
			
				for (var i=0; i<history.length; i++)
				{
					var data = history[i];

					var row = $(document.createElement("tr")).appendTo(tbody);

					$(document.createElement("td")).text(data.date.toLocaleString().split(" ")[0]).appendTo(row);
					$(document.createElement("td")).text(data.score).appendTo(row);
					$(document.createElement("td")).text(data.right + "/" + data.total).appendTo(row);
				}
			}
		}
	}	
				
				
			
	
/*******************/
	
	gameFace.onBeforeOpen = function()
	{

		gameFace.redraw();
	}
	
	gameFace.onAfterOpen = function()
	{
		gameController.startGame();
	}
	
	gameFace.onRedraw = function()
	{	
		$("#game-pause").show().click(pauseGame);
		$("#game-resume").hide().click(resumeGame);
	}
	
	function pauseGame()
	{
		gameController.pause();
		$("#game-pause").hide();
		$("#game-resume").show();
	}
	
	function resumeGame()
	{
		gameController.resume();
		$("#game-resume").hide();
		$("#game-pause").show();
	}
	
/*******************/
	
	gameController.onGameEnd = function()
	{
		if (gameController.mode == "training")
		{
			faceMgr.switchTo(trainingResultFace);
		}
		else
		{
			testResults.push(gameController.getGameResult());
			nextTest();
		}
	}	
		
		
		



/*******************/

	configFace.onRedraw = function()
	{
		$("#config-opacity").attr("value", opacity.get());
		$("#config-fast").attr("checked", fastSwitch.get());
		
		// check the box if auto-update is enabled 
				
		$("#config-update").attr("checked", updater.enabled.get());
	}
	
	configFace.onInit = function()
	{
		configFace.redraw();
		$("#config-back").click(function() { faceMgr.switchTo(mainFace); });
	
		// The inverse of configFace.onRedraw above - if the controls change, update the settings to match 
						
		$("#config-opacity").bind("change", function(evt) { opacity.set(evt.target.value); });
				
		$("#config-fast").bind("change", function(evt) { fastSwitch.set(evt.target.checked); });
		
		$("#config-update").bind("change", function(evt) { updater.enabled.set(evt.target.checked); });
		
		$("#config-login").bind("submit", function(evt) { user.login($("#config-username").attr("value"), $("#config-password").attr("value")); evt.preventDefault(); return false; } );
		
		// Uncomment the following line to force the Last Updated value to Jan 1, 1970 
		updater.resetLastUpdate();

		// If the auto-update is enabled, check the feed for news items in 2 seconds
		// call updateSuccess if able to retrieve data, updateFailure otherwise
		if (!localMode && updater.enabled.get() == true)
		{
			updater.delayedCheck( { success: updateSuccess, failure: updateFailure }, 2);
		}
	}
	
	// Before opening configuration, update to match current settings (in case they've been changed independently)
	configFace.onBeforeOpen = configFace.redraw;

/*******************/

	/* Auto-update check was successful - see if there's any unread news to display */
	
	var updateSuccess = function ()
	{
		if (updater.hasUnreadItems)
		{
			// Only display the most recent item 
			
			var lastItem = updater.items[updater.items.length - 1];

			// Insert the title, link, description, date, and download link 

			$("#config-update-title").text(lastItem.title);
			$("#config-update-link").attr("src", lastItem.link);
			$("#config-update-text").html(lastItem.description);
			$("#config-update-date").text(lastItem.shortDate);
			if (lastItem.download)
			{
				$("#config-update-download a").attr("src", lastItem.download);
			}
			
			// Now hide the 'No Updates Found' message and show the news item 
			$("#config-update-none").hide();
			$("#config-update-details").show();
		}
		else
		{
			// Hide the news item area and show the 'No Updates Found' message 
			$("#config-update-details").hide();
			$("#config-update-none").show();
		}
	}
	
	/* Auto-update failed - pop-up a dialog box */
	
	var updateFailure = function(statusCode, statusText)
	{
		if (statusCode == 408)
			statusText = "timed out connecting to update server";
		else
			statusText = "failed to check for updates";
		
		//alertMessage.show("Error - " + statusText);
	}
	
/*******************/

	user.onSuccessfulLogin = function(message)
	{
		user.loadTraining();
		mainFace.redraw();
		$("#config-username").attr("disabled", "disabled").attr("value",user.username.get());
		$("#config-password").attr("disabled", "disabled").attr("value","");
		$("#config-login button span").text("Logout");
		
		if (faceMgr.isActive(configFace))
			faceMgr.switchTo(mainFace);
	}
	
	user.onFailedLogin = function(message)
	{
		$("#config-username").removeAttr("disabled").attr("value","");
		$("#config-password").removeAttr("disabled").attr("value","");
		mainFace.redraw();
	}
	
	user.onSuccessfulLogout = function(message)
	{
		$("#config-username").removeAttr("disabled").attr("value","");
		$("#config-password").removeAttr("disabled").attr("value","");
		$("#config-login button span").text("Login");
		mainFace.redraw();
	}
	
	user.onFailedLogout = function(message)
	{
	}
}
