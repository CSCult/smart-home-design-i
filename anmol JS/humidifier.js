var HUMIDITY_RATE = 5/3600; // 1% per hour
var VOLUME_AT_RATE = 100000;

var state = 0;
var level = 0;

function setup() 
{
	IoEClient.setup({
		type: "Humdifier",
		states: [
		{
			name: "Status",
			type: "bool",
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
		setState(state ? 0 : 1);
}


function processData(data, bIsRemote)
{
	if ( data.length <= 0  )
		return;
	data = data.split(",");
	setState(parseInt(data[0]));
}

function setState(newState)
{
	analogWrite(A1, newState);
	state = newState;
	IoEClient.reportStates(state);
	setDeviceProperty(getName(), "state", state);
	updateEnvironment();
}


function updateEnvironment()
{
	if ( state == 1){
		var volumeRatio = VOLUME_AT_RATE / Environment.getVolume();
		Environment.setContribution("Humidity", HUMIDITY_RATE*volumeRatio);
	}
	else
	{
		Environment.setContribution("Humidity", 0);
	}
	
}
