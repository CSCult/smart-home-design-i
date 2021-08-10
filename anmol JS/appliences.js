var state = 0;

function setup() {
	
	IoEClient.setup({
		type: "Appliance",
		states: [{
			name: "On",
			type: "bool",
			controllable: true
		}]
	});
	
	IoEClient.onInputReceive = function(input) {
		processData(input, true);
	};
	
	attachInterrupt(0, function() {
		processData(customRead(0), false);
	});
	
	setState(state);
}

function mouseEvent(pressed, x, y, firstPress) {
	if (firstPress)
		setState(state ? 0 : 1);
}

function processData(data, bIsRemote) {
	if ( data.length <= 0  )
		return;
	setState(parseInt(data));
}

function setState(newState) {
	state = newState;
	
	if ( state === 0 )
		digitalWrite(1, LOW);
	else
		digitalWrite(1, HIGH);
	
	customWrite(0, state);
	IoEClient.reportStates(state);
	setDeviceProperty(getName(), "state", state);
}
