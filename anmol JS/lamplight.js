var ENVIRONMENT_IMPACT_DIM = 10;
var VOLUME_AT_RATE = 100000;

var state = 0;	// 0 off, 1 low, 2 high
var lastTimeInSeconds = 0;

function setup() {

	IoEClient.setup({
		type: "Light",
		states: [
		{
			name: "Status",
			type: "options",
			options: {
				"0": "Off",
				"1": "Dim",
				"2": "On"
			},
			controllable: true
		}			
		]
	});
	
	IoEClient.onInputReceive = function(input) {
		processData(input, true);
	};
	
	attachInterrupt(0, function() {
		processData(customRead(0), false);
	});

	state = restoreProperty("state", 0);
	setState(state);
}

function restoreProperty(propertyName, defaultValue)
{
	var value = getDeviceProperty(getName(), propertyName);
	if ( !(value === "" || value == "undefined") ){
		if ( typeof(defaultValue) == "number" )
			value = Number(value);
		
		setDeviceProperty(getName(), propertyName, value);
		return value;
	}
	
	return defaultValue;
}

function mouseEvent(pressed, x, y, firstPress) {
	if (firstPress)
		setState(state+1);
}

function loop() {
	updateEnvironment();

	delay(1000);
}

function processData(data, bIsRemote) {
	if ( data.length <= 0  )
		return;
	setState(parseInt(data));
}

function setState(newState) {
	if (newState >= 3)
		newState = 0;
	state = newState;
	
	analogWrite(A1, state);
	customWrite(0, state);
	IoEClient.reportStates(state);
	setDeviceProperty(getName(), "state", state);
}

function updateEnvironment()
{
	var volumeRatio = VOLUME_AT_RATE / Environment.getVolume();
	if ( state === 0 )
		Environment.setContribution("Visible Light", 0,0);
	else if ( state === 1)
		Environment.setContribution("Visible Light", ENVIRONMENT_IMPACT_DIM*volumeRatio, ENVIRONMENT_IMPACT_DIM*volumeRatio, false);
	else if ( state === 2 )
		Environment.setContribution("Visible Light", ENVIRONMENT_IMPACT_DIM*2*volumeRatio, ENVIRONMENT_IMPACT_DIM*2*volumeRatio, false);
}






