var gameController = new function GameController()
{
	var self = this;
	
	self.mode = "training";
	self.difficulty = 1;
	self.score = 0;
	self.right = 0;
	self.wrong = 0;
	
	self.user = null;
	
	self.playArea = null;
	self.questionLine = null;
	var timerDisplay = null;
	var countDisplay = null;
	var answerDisplay = null;
	self.numberPad = new NumberPad();
	var numberBuffer = "";
	self.customPad = new CustomPad();
	self.game = null;
	self.timer = new Timer();
	self.scaleFactor = 1.0;
	
	var frameTimer = null;
	
	self.availableGames = [];
	
	self.reset = function()
	{
		self.right = 0;
		self.total = 0;
		self.timer.set(0);
		updateDisplay();
		updateInput();
		$("#game-play").empty();
		$("#game-question").empty();
		
	}
	
	self.init = function()
	{
		self.playArea = $("#game-play");
		self.questionLine = $("#game-question");
		self.numberPad.init($("#game-numberpad"));
		self.customPad.init($("#game-custompad"));
		self.numberPad.onNumberPressed = addNumber;
		self.numberPad.onClearPressed = clearNumber;
		self.customPad.onNumberPressed = addNumber;
		
		timerDisplay = $("#game-timer");
		countDisplay = $("#game-count");
		answerDisplay = $("#game-answer");
		

		$("#game-right").css("visibility", "hidden");
		$("#game-wrong").css("visibility", "hidden");
		
		// disable pause buttons, they currently cause problems with animations
		$("#game-pause").add($("#game-resume")).hide();
		
		
		self.timer.onTick = updateDisplay;
		
		//TODO: load highScores for each game from XML store
		for (var i=0; i<self.availableGames.length; i++)
		{
			self.availableGames[i].init(self);
			//self.availableGames[i].highScore = 0;
		}
		
		if (mediaConfig.tv)
			self.scaleFactor = 2.0;
		if (mediaConfig.desktop)
			self.scaleFactor = 1.5;
	}
	
	self.addGame = function(newGame)
	{
		for (var i=0; i<self.availableGames; i++)
		{
			if (newGame === self.availableGames[i])
				return newGame;
		}
		self.availableGames.push(newGame);
		
		return newGame;
	}
	
	self.getGame = function(gameId, gameVersion)
	{
		// if specific gameVersion requested then return null if not available
		for (var i=0; i<self.availableGames.length; i++)
		{
			var game = self.availableGames[i];
			if (game.id == gameId)
			{
				if (!gameVersion || (game.version == gameVersion))
					return game;
			}
		}
		return null;
	}	
	
	function addNumber(value)
	{
		numberBuffer += new String(value);
		updateInput();
		
		var result = self.game.checkAnswer(numberBuffer);
		if (result == 0)
			return;
		
		self.markQuestion(result > 0);
			
	}	
	function clearNumber()
	{
		numberBuffer = "";
		updateInput();
	}	
	
	function updateDisplay()
	{
		countDisplay.text(self.right + " / " + self.total);
		timerDisplay.text((self.timer.remaining / 1000).toFixed(1));
	}
	
	function updateInput()
	{
		if (self.game)
		{
			$(answerDisplay).text(numberBuffer);
		}	
		else
		{
			$(answerDisplay).empty();
		}
	}
	
	self.loadGame = function(newGame, user, mode)
	{
		self.game = newGame;
		
		self.user = user;
		self.mode = mode;
		
		self.numberPad.show(false);
		self.numberPad.enable(false);
		self.customPad.show(false);
		self.customPad.enable(false);
		
		self.reset();
	}	
		
	
	self.startGame = function(newGame)
	{
		self.score = 0;
		
		if (self.onGameStart) self.onGameStart();
		
		self.timer.set(self.mode == "training" ? self.game.trainingDuration : self.game.testDuration, self.endGame);
		self.timer.start();
		
		self.game.start();
		
	}
	
	self.markQuestion = function(correct)
	{
		if (correct)
		{
			self.right++;
			self.score += self.game.questionScore;
			$("#game-right").css("visibility", "visible");
		}
		else
		{
			self.score -= self.game.questionPenalty;
			$("#game-wrong").css("visibility", "visible");
		}
		self.total++;
		
		clearNumber();
		updateInput();
		updateDisplay();
		
		window.setTimeout(clearMark, 1000);
	}
	
	function clearMark()
	{	
		$("#game-right").add($("#game-wrong")).css("visibility", "hidden");
	}
	
	self.endGame = function()
	{
		self.game.endQuestion();
		
		self.game.end();
	
		self.numberPad.show(false);
		self.numberPad.enable(false);
		self.customPad.show(false);
		self.customPad.enable(false);
		
		if (self.onGameEnd)
			self.onGameEnd();
	
	}
	
	self.onGameStart = function() {}
	self.onGameEnd = function() {}
	
	self.pause = function()
	{
		self.playArea.hide();
		$("#game-controls").hide();
		self.timer.stop();		
	}
	
	self.resume = function()
	{
		self.playArea.show();
		$("#game-controls").show();
		self.timer.start();
	}
	
	self.getGameResult = function()
	{
		var record = new GameResult();
		record.set(self.user, new Date(), self.game, self.score, self.right, self.total);
		return record;
	}	
		
		
			
}


