var CountingThings = function()
{
	var self = new BrainkriegGame("Out For The Count", "counting", "1.0");;

	self.items = [];
	var positionsUsed = [];
	self.colours = ["red", "blue", "green", "orange", "black"];
	self.numbersUsed = {};
	self.coloursUsed = {};
	self.correctAnswer = 0;
	var gridWidth = 0;
	var gridHeight = 0;
	var gridCols = 8;
	var gridRows = 8;
	var margin = 8;

	self.onInit = function()
	{
		self.trainingDuration = 45;
		self.testDuration = 30;
		self.instructions = "<h2>Out For The Count</h2><p>In this game, you must quickly count things as they appear.</p><p><em>Pay attention to the question at the top of the screen.</em></p><p>When you know how many numbers of the right type are on the screen, enter that number using the keypad.</p>";
	}

	self.onStart = function()
	{
		gridWidth = Math.floor((self.controller.playArea.width() - margin*2) / gridCols);
		gridHeight = Math.floor((self.controller.playArea.height() - margin*2) / gridRows);
		
		self.controller.numberPad.show(true);
		self.controller.numberPad.enable(true);
	}
	
	self.onEnd = function()
	{
		self.controller.numberPad.show(false);
	}	

	function newItem()
	{
		do
		{
			var x = Math.floor(Math.random() * gridCols);
			var y = Math.floor(Math.random() * gridRows);
			var positionIndex = y * gridRows + x;
							
		} while (positionsUsed[positionIndex]);
		
		positionsUsed[positionIndex] = true;
		
		var element = $(document.createElement("div"));
		var number = Math.floor(Math.random() * 9) + 1;
		var colour = Math.floor(Math.random() * self.colours.length);
		var size = Math.floor(((Math.random() * 15) + 12));
		
		element.text(number)
			.css("position", "absolute")
			.css("color", self.colours[colour])
			.css("font-size", size + "px")
			.css("left", x * gridWidth + margin + "px")
			.css("top", y * gridHeight + margin + "px");
			
		return { element: element, number: number, colour: colour, size: size, x: x, y: y, positionIndex: positionIndex };
			
	}
	
		
	self.onStartQuestion = function()
	{		
		var colourPick = 0;
		var numberPick = 0;
		
		for (var i=0; i < Math.floor(Math.random()*(self.controller.total + 10)) + 5; i++)
		{
			var item = newItem();
			self.items.push(item);
			if (self.numbersUsed[item.number])
				self.numbersUsed[item.number]++;
			else
				self.numbersUsed[item.number] = 1;
				
			if (self.coloursUsed[item.colour])
				self.coloursUsed[item.colour]++;
			else
				self.coloursUsed[item.colour] = 1;
		
			if (i==0)
			{
				colourPick = item.colour;
				numberPick = item.number;
			}
			
			self.controller.playArea.append(item.element);
		}
		
		switch (Math.floor(Math.random()*2))
		{
			case 0:
				self.controller.questionLine.text("How many number " + numberPick + "s are there?");
				self.correctAnswer = self.numbersUsed[numberPick];
				break;
				
			case 1:
				self.controller.questionLine.text("How many " + self.colours[colourPick] + " numbers are there?");
				self.correctAnswer = self.coloursUsed[colourPick];
			break;
		}
		
		self.questionScore = 100 + (self.controller.total + self.items.length + self.correctAnswer) * 5;
		self.questionPenalty = 25 - Math.max(0, (self.controller.total + self.items.length + self.correctAnswer));
		
		self.controller.numberPad.enable(true);
		
	}
	
	self.onEndQuestion = function()
	{
		self.controller.numberPad.enable(false);
		
		// clear out existing items
		self.controller.playArea.empty();
		self.controller.questionLine.empty();
		self.items = [];
		self.coloursUsed = {};
		self.numbersUsed = {};
		positionsUsed = [];
	}

	self.onCheckAnswer = function(value)
	{
		var ans = String(self.correctAnswer);
		if (value.length < ans.length)
			return 0;

		if (value == ans)
			return 1;

		return -1;

	}
		
	return self;
}

gameController.addGame(new CountingThings());
