var WhatsMissing = function()
{
	var self = new BrainkriegGame("What's Missing?", "missing", "1.0");
	
	var blocker = null;
	var tileHolder = null;
	var allSymbols = [	"tiles/anchor.png", "tiles/bell.png", "tiles/book_open.png", "tiles/cake.png", 
						"tiles/car.png", "tiles/cd.png", "tiles/clock.png", "tiles/cup.png",
						"tiles/drink.png", "tiles/emoticon_smile.png", "tiles/heart.png", "tiles/money.png",
						"tiles/money_dollar.png", "tiles/music.png", "tiles/palette.png", "tiles/rainbow.png", 
						"tiles/ruby.png", "tiles/sport_8ball.png", "tiles/sport_soccer.png", "tiles/sport_tennis.png",
						"tiles/star.png", "tiles/user.png", "tiles/user_female.png"
					];

	var sequence = [];
	var hiddenTile = null;
	var correctAnswer = null;
	
	var startY = 0;
	var middleY = 0;
	var endY = 0;

	self.onInit = function()
	{
		self.instructions = "<h2>What's Missing?</h2><p>Watch the symbols and remember them as they pass behind the brick wall - one will disappear.</p><p>When you think you know which one, select it using the buttons.</p><p><em>Remember, there may be more than one of each symbol, and they may change places under cover!</em></p>";

		self.trainingDuration = 60;
		self.testDuration = 45;		
	}
	
	self.onStart = function()
	{
		var blockerHeight = 32;
		var blockerY = ((self.controller.playArea.height() - blockerHeight)/2 - 2);
		blocker = $(document.createElement("div"))
			.addClass("missing-blocker")
			.css("left", "0px")
			.css("top", blockerY + "px")
			.css("width", ((self.controller.playArea.width()) - 2) + "px")
			.css("height", blockerHeight + "px");
		
		tileHolder = $(document.createElement("div"))
			.addClass("missing-tileholder");

		self.controller.playArea.append(blocker);
		self.controller.playArea.append(tileHolder);
		
		self.controller.questionLine.text("Remember which tile is missing!");

		startY = 20;
		middleY = blockerY + 2;
		endY = self.controller.playArea.height() - tileHolder.height() - 20;
		
		
		self.controller.customPad.enable(true);
		

	}
	
	self.onEnd = function()
	{
		self.controller.playArea.empty();
		self.controller.questionLine.empty();
		
		self.controller.customPad.show(false);
		
		tileHolder.stop(true, false);
	}		
	
	function shuffle(a, b)
	{
		return (Math.random() < 0.5) ? -1 : 1;
	}
	
	function newTile(symbol)
	{
		if (!symbol)
		{
			symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
		}
		
		var element = $(document.createElement("div"))
			.addClass("missing-tile")
			.css("left", "0px")			// this gets positioned later
			.css("top", "0px")
			.append(
				$(document.createElement("img"))
				.attr("src", symbol)
				.attr("alt", "")
			);
		return { element: element, symbol: symbol };

	}
	
	function repositionTiles()
	{
		if (sequence[0])
		{
			var tileWidth = sequence[0].element.width();
			var x = Math.floor((tileHolder.width() - sequence.length * tileWidth) / 2);
			for (var i=0; i<sequence.length; i++)
			{
				sequence[i].element.css("left", x + "px");
				x += tileWidth;
			}
		}
	}	
			
	
	self.onStartQuestion = function()
	{
		tileHolder.css("top", startY + "px");
		
		correctAnswer = 0;
		
		var difficulty = Math.floor(self.controller.total/3);
		var sequenceLength = Math.max(Math.min(2 + difficulty + Math.floor(Math.random()*2-1), 7), 3);
		var choicesCount = Math.max(Math.min(4 + difficulty + Math.floor(Math.random()*2-1), 9), 3);
		
		allSymbols.sort(shuffle);
		
		var choices = allSymbols.slice(0, choicesCount); // Get the set of symbols
		choices.sort(shuffle);
		var correctSymbol = choices[0];
		choices.sort(shuffle);
		
		for (var i=0; i<choices.length; i++)
		{
			if (choices[i] == correctSymbol)
			correctAnswer = i+1;
		}
		
		self.controller.customPad.useButtons(choices);
		
		hiddenTile = newTile(correctSymbol);
		sequence.push(hiddenTile);
		tileHolder.append(hiddenTile.element);
		
		for (var i=1; i<sequenceLength; i++)
		{
			var tile = newTile();
			sequence.push(tile);
			tileHolder.append(tile.element);
				
		}
		sequence.sort(shuffle);
				
		repositionTiles();
		
		self.questionScore = 150 + (sequence.length + choices.length) * 10;
		self.questionPenalty = 25 - Math.max(0, (sequence.length + choices.length) * 5);
		
		window.setTimeout(dropTiles, 1500);
	}
	
	function dropTiles()
	{
		tileHolder
		.animate({ top: middleY + "px" }, "normal", null, shuffleAndHide)
		.animate({ top: endY + "px" }, "normal", null, allowAnswer);
	}
	
	function shuffleAndHide()
	{
		// tiles are hidden under the bar - do the switch
		hiddenTile.element.addClass("missing-hidden");
		
		if (self.controller.total > 5)
		{
			sequence.sort(shuffle);
			repositionTiles();
		}
	}
	
	function allowAnswer()
	{	
		tileHolder.css("top", endY + "px");
		self.controller.customPad.show(true);	
	}
	
	self.onEndQuestion = function()
	{
		self.controller.customPad.show(false);
		tileHolder.stop();
		tileHolder.empty();
		sequence = [];

	}
	
	self.onCheckAnswer = function(value)
	{
		var ans = String(correctAnswer);

		if (value == ans)
			return 1;

		return -1;
	
	}
	
	return self;
}

gameController.addGame(new WhatsMissing());