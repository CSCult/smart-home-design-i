var FAN_SPEED_LOW = 0.4; // kph
var FAN_SPEED_HIGH = 0.8; // kph
var COOLING_RATE = -1/3600; // -1C/hour
var HUMDITY_REDUCTION_RATE = -1/3600; // -1%/hour

var VOLUME_AT_RATE = 100000;	// the given rates are based on this volume

var state = 0;	// 0 off, 1 low, 2 high
var level = 0;

function setup() {
	
	IoEClient.setup({
		type: "Ceiling Fan",
		states: [
		{
			name: "Status",
			type: "options",
			options: {
				"0": "Off",
				"1": "Low",
				"2": "High"
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
		toggleState();
}

function processData(data, bIsRemote)
{
	if ( data.length <= 0  )
		return;
	data = data.split(",");
	setState(parseInt(data[0]));
}

function sendReport()
{
	var report = state;	// comma seperated states
	customWrite(0, report);
	IoEClient.reportStates(report);
	setDeviceProperty(getName(), "state", state);
}

function setState(newState)
{
	analogWrite(A1, newState);
	state = newState;
	
	sendReport();
	updateEnvironment();
}

function toggleState()
{
	++state;
	if ( state >= 3 )
		state = 0;
	
	setState(state);


}

function updateEnvironment()
{
	var volumeRatio = VOLUME_AT_RATE / Environment.getVolume();

	if ( state === 0){
		Environment.setContribution("Wind Speed", 0, 0);
		Environment.setContribution("Ambient Temperature", 0, 0);
		Environment.setContribution("Humidity", 0,0); 
	}
	else if ( state == 1 )
	{
		Environment.setContribution("Wind Speed", FAN_SPEED_LOW, FAN_SPEED_LOW, false);
		
		// everytime the fan restarts, it can do another -100C
		Environment.setContribution("Ambient Temperature", COOLING_RATE/2*volumeRatio, 
			Environment.getCumulativeContribution("Ambient Temperature")-100);

		Environment.setContribution("Humidity", HUMDITY_REDUCTION_RATE/2*volumeRatio, 
			Environment.getCumulativeContribution("Humidity")-100);
			
	}
	else if ( state == 2)
	{
		Environment.setContribution("Wind Speed", FAN_SPEED_HIGH, FAN_SPEED_HIGH, false);
		
		Environment.setContribution("Ambient Temperature", COOLING_RATE/2*volumeRatio, 
			Environment.getCumulativeContribution("Ambient Temperature")-100);
			
		Environment.setContribution("Humidity", HUMDITY_REDUCTION_RATE*volumeRatio, 
			Environment.getCumulativeContribution("Humidity")-100);
	}
		
		
		
}
