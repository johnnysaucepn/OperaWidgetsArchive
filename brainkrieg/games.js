function BrainkriegGame(name, id, version)
{
	var self = this;
	
	self.name = name;
	self.id = id;
	self.version = version;
	self.unique = id + version;
	self.trainingDuration = 6;
	self.testDuration = 6;
	
	self.instructions = "";
	self.running = false;
	self.questionScore = 100;
	self.questionPenalty = 25;
	
	self.controller = null;

	self.init = function(controller)
	{
		self.controller = controller;
		if (self.onInit) self.onInit();
	}
	
	self.start = function()
	{
		if (self.onStart) self.onStart();
		self.running = true;
		self.startQuestion();
	}
	
	self.end = function()
	{
		self.running = false;
		self.endQuestion();
		if (self.onEnd) self.onEnd();
	}	
	
	self.startQuestion = function()
	{
		if (self.onStartQuestion) self.onStartQuestion();
	}
	
	self.endQuestion = function()
	{;
		if (self.onEndQuestion) self.onEndQuestion();
		
		if (self.running) self.startQuestion();
	}
	
	self.checkAnswer = function(value)
	{
		var valStr = String(value);
		var result = 0;
		if (self.onCheckAnswer)
		{
			result = self.onCheckAnswer(valStr);
		}
		else
		{
			// if answer is more than 4 chars, let's assume it's wrong, in case something unexpected has happened
			if (valStr.length > 4) result = -1;
		}
		
		if (result != 0) self.endQuestion();
		
		return result;
				
	}
	
	self.onInit = null;
	self.onStart = null;
	self.onEnd = null;
	self.onStartQuestion = null;
	self.onEndQuestion = null;
	self.onCheckAnswer = null;
}


	