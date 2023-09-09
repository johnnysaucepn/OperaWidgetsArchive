var Arithmetic1 = function()
{
	var self = new BrainkriegGame("Mental Arithmetic", "arithmetic1", "1.0");
	
	var questionHolder = null;
	var parts;
	var correctAnswer = "0";
	
	var startX = 0;
	var middleX = 0;
	var endX = 0;

	self.onInit = function()
	{
		self.instructions = "<h2>Mental Arithmetic</h2><p>You'll see a simple arithmetic question, with one of the digits hidden.</p><p>Work out what number goes in the space, and enter it using the keypad.</p>";

		self.trainingDuration = 45;
		self.testDuration = 30;	
	}
	
	self.onStart = function()
	{
		questionHolder = $(document.createElement("div"))
			.addClass("arithmetic1-question")
			.css("left", -self.controller.playArea.width() + "px")
			.append($("<div><span></span></div><div><span></span></div><div><span></span></div><div>=</div><div><span></span></div>"));
		parts = questionHolder.find("span");
		
		self.controller.playArea.append(questionHolder);
		
		startX = -questionHolder.width();
		endX = self.controller.playArea.width();
		
		// now that question is on screen, work out y-pos
		questionHolder.css("top", Math.floor((self.controller.playArea.height() - questionHolder.height()) / 2));
		
		self.controller.questionLine.text("Fill in the missing number!");
		
		self.controller.numberPad.show(true);
		self.controller.numberPad.enable(false);
	}
	
	self.onEnd = function()
	{
		self.controller.playArea.empty();
		self.controller.questionLine.empty();
		
		self.controller.numberPad.show(false);
		
		questionHolder.stop(true, false);
	}					
	
	self.onStartQuestion = function()
	{
		var operand1 = 0;
		var operand2 = 0;
		var operator = "";
		var result = 0;
		
		self.questionScore = 80;
		self.questionPenalty = 50;
				
		switch (Math.floor(Math.random()*6))
		{
			case 0:
			case 1:
				operator = "+";
				operand1 = Math.floor(Math.random()*20)+1;
				operand2 = Math.floor(Math.random()*20)+1;
				result = operand1 + operand2;
				self.questionScore += 10;
				break;
			case 2:
			case 3:
				operator = "-";
				result = Math.floor(Math.random()*20)+1;
				operand2 = Math.floor(Math.random()*20)+1;
				operand1 = result + operand2;
				self.questionScore += 20;
				break;
			case 4:
				operator = unescape("%u00d7");
				operand1 = Math.floor(Math.random()*10)+1;
				operand2 = Math.floor(Math.random()*10)+1;
				result = operand1 * operand2;
				self.questionScore += 30;
				break;
			case 5:
				operator = unescape("%u00f7");
				result = Math.floor(Math.random()*10)+1;
				operand2 = Math.floor(Math.random()*10)+1;
				operand1 = result * operand2;
				self.questionScore += 40;
				break;
		}
		
		parts.eq(0).text(operand1);
		parts.eq(1).text(operator);
		parts.eq(2).text(operand2);
		parts.eq(3).text(result);
		
		switch (Math.floor(Math.random()*4))
		{
			case 0:
			case 1:
				correctAnswer = String(result);
				parts.eq(3).parent().addClass("arithmetic1-hidden");
				self.questionScore += 20;
				break;
			case 2:
				correctAnswer = String(operand1);
				parts.eq(0).parent().addClass("arithmetic1-hidden");
				self.questionScore += 30;
				break;
			case 3:
				correctAnswer = String(operand2);
				parts.eq(2).parent().addClass("arithmetic1-hidden")
				self.questionScore += 40;
				break;
		}
		
		
		middleX = Math.floor((self.controller.playArea.width() - questionHolder.width()) / 2);
		
		questionHolder.css("left", startX + "px");
		questionHolder.animate({ left: middleX + "px" }, "fast", null, allowAnswer);
	}
		
	function allowAnswer()
	{	
		self.controller.numberPad.enable(true);	
	}
	
	self.onEndQuestion = function()
	{
		self.controller.numberPad.enable(false);
		questionHolder.stop(true, false);
		parts.parent().removeClass("arithmetic1-hidden");
		//questionHolder.empty();
	}
	
	self.onCheckAnswer = function(value)
	{
		if (value.length < correctAnswer.length)
			return 0;
			
		if (value == correctAnswer)
			return 1;

		return -1;
	
	}
	
	return self;
}

gameController.addGame(new Arithmetic1());