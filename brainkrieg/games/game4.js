var EstimateArea = function()
{
	var self = new BrainkriegGame("Gone To Pieces", "estimatearea", "1.0");;

	self.colours = ["red", "blue", "green", "orange"];
	self.symbols = ["tiles/red.png", "tiles/blue.png", "tiles/green.png", "tiles/orange.png"];
	self.correctAnswer = 0;
	var tileCount = 8; // Want at least 8 tiles per side, regardless of total area.
	var tileSize = 16;
	var gridCols = 8;
	var gridRows = 8;
	var gridWidth = 128;
	var gridHeight = 128;
	var gridContainer = null;
	var gridSet = [];
	var grid = null;
	var coloursUsed = [];
	var lastCount = 0;
	var partsExpected = 0;
	var partsGiven = 0;
	
	self.onInit = function()
	{
		self.trainingDuration = 45;
		self.testDuration = 30;
		self.instructions = "<h2>Gone To Pieces</h2><p>You will be shown a grid of squares of different colours.</p><p>Quickly estimate the number of squares of each colour, and select the colours on the keypad in <em>ascending order</em>, from fewest to most.</p><p>If two colours are exactly the same, it doesn't matter which order you choose!</p>";
	}

	self.onStart = function()
	{
		// Calc size of each square in pixels
		tileSize = Math.floor(Math.min(self.controller.playArea.height(), self.controller.playArea.width()) / tileCount);
		gridCols = Math.floor(self.controller.playArea.width() / tileSize);
		gridWidth = gridCols * tileSize;
		gridRows = Math.floor(self.controller.playArea.height() / tileSize);
		gridHeight = gridRows * tileSize;
	
		var gridX = Math.floor((self.controller.playArea.width() - gridWidth) / 2);
		var gridY = Math.floor((self.controller.playArea.height() - gridHeight) / 2);
		
		gridContainer = $(document.createElement("div"))
			.addClass("estimatearea-container")
			.width(gridWidth)
			.height(gridHeight)
			.css("left", gridX + "px")
			.css("top", gridY + "px");
		gridContainer.appendTo(self.controller.playArea);
		
		for (var i=0; i<4; i++)
		{
			gridSet[i] = $(document.createElement("div"))
				.addClass("estimatearea-set")
				.width(gridWidth)
				.height(gridHeight)
				.css("left", gridX + "px")
				.css("top", gridY + "px");
				
			gridSet[i].appendTo(gridContainer);
		}
		
		self.controller.questionLine.text("Colours in order from smallest to largest!");
		
		self.controller.customPad.useButtons(self.symbols);
		self.controller.customPad.show(true);
		
	}
	
	self.onEnd = function()
	{
		for (var i=0; i<gridSet.length; i++)
		{
				gridSet[i].empty();
		}
	}	

	function createNewArea(colourIndex, fromX, fromY, width, height)
	{
		for (var y=fromY; y<fromY + height; y++)
		{
			for (var x=fromX; x<fromX + width; x++)
			{
				grid[y][x] = colourIndex;
			}
		}
	}
	
	function shuffleTiles()
	{
		for (var s=0; s<30; s++)
		{
			var sourceX = Math.floor(gridCols * Math.random());
			var sourceY = Math.floor(gridRows * Math.random());
			
			var destX = Math.floor(sourceX + (Math.random()*2-1));
			var destY = Math.floor(gridRows + (Math.random()*2-1));
			destX = Math.min(gridCols-1, Math.max(0, destX));
			destY = Math.min(gridRows-1, Math.max(0, destY));
			
			temp = grid[destY][destX];
			grid[destY][destX] = grid[sourceY][sourceX];
			grid[sourceY][sourceX] = temp;
		}
	}
	
	function addTiles()
	{
		gridSet[0].css("left", (-gridWidth) + "px");
		gridSet[1].css("top", (-gridHeight) + "px");
		gridSet[2].css("left", (gridWidth) + "px");
		gridSet[3].css("top", (gridHeight) + "px");
	
		for (var y=0; y<gridRows; y++)
		{
			for (var x=0; x<gridCols; x++)
			{
				var thisSet = grid[y][x];
				
				if (thisSet > -1)
				{
					var newTile = $(document.createElement("div"))
						.addClass("tile")
						.css("background-color", self.colours[thisSet])
						.css("background-image", "url("+ self.symbols[thisSet] + ")")
						.css("left", x * tileSize + "px")
						.css("top", y * tileSize + "px")
						.width(tileSize).height(tileSize);
						
					newTile.appendTo(gridSet[thisSet]);

					coloursUsed[thisSet]++;	
				}
			}
		}
	}	
		
	self.onStartQuestion = function()
	{		
		grid = new Array(gridRows);
		for (var y=0; y<gridRows; y++)
		{
			grid[y] = new Array(gridCols);
			for (var x=0; x<gridCols; x++)
				grid[y][x] = -1;
		}
		
		for (var i=0; i<gridSet.length; i++)
		{
			gridSet[i].empty();
			coloursUsed[i] = 0;	
			var x = Math.floor(Math.random() * gridCols);
			var y = Math.floor(Math.random() * gridRows);
			var w = Math.floor(Math.random() * (gridCols - x)) + 1;
			var h = Math.floor(Math.random() * (gridRows - y)) + 1;
			
			createNewArea(i, x, y, w, h);
		}			
		
		shuffleTiles();
		addTiles();
		
		// tried to sort the colours by occurrence, but couldn't get simple answer to problem of some colours
		// having equal numbers. Went with checking as we go that each answer part is equal or greater than.
		/*var colourCount = [];
		for (var i=0; i<coloursUsed.length; i++)
		{
			colourCount.push({index: i, count: coloursUsed[i]});
		}
		
		colourCount.sort(function(a,b) { return (a.count < b.count) ? -1 : 1; });*/
	
		partsExpected = 0;
		for (var i=0; i<coloursUsed.length; i++)
		{
			if (coloursUsed[i] > 0)	partsExpected++;
		}
		partsGiven = 0;
		lastCount = 0;
	
		self.questionScore = 100 + self.controller.total
			+ gridSet[0].children().length 
			+ gridSet[1].children().length
			+ gridSet[2].children().length
			+ gridSet[3].children().length;
		self.questionPenalty = 25;		
		
		for (var i=0; i<gridSet.length; i++)
		{
			gridSet[i].animate({ left: "0px", top: "0px" }, "medium", null, allowAnswer);
		}
	}
	
	function allowAnswer()
	{	
		self.controller.customPad.enable(true);	
	}
	
	self.onEndQuestion = function()
	{
		self.controller.customPad.enable(false);
	}

	self.onCheckAnswer = function(value)
	{
		var part = Number(value.substr(value.length-1, 1));
		
		if (coloursUsed[part-1] < lastCount)
			return -1;
	
		lastCount = coloursUsed[part-1];
		partsGiven++;
		self.controller.customPad.disableButton(part);
		
		if (partsGiven < partsExpected)
			return 0;

		return 1;
	}
		
	return self;
}

gameController.addGame(new EstimateArea());
