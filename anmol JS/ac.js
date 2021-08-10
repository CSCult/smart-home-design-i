var HUMIDITY_RATE = -2/3600; // -2% per hour
var TEMPERATURE_RATE = -10/3600; // -10C per hour
var VOLUME_AT_RATE = 100000;

var input;
function setup() {
	IoEClient.setup({
		type: "AC",
		states: [{
			name: "On",
			type: "bool",
			controllable: true
		}]
	});
	
	IoEClient.onInputReceive = function(data) {
		if ( data.length <= 0  )
			return;
		data = data.split(",");
		processData(parseInt(data[0]));
	};

	attachInterrupt(0, function() {
		processData(digitalRead(0)/1023);
	});

	processData(digitalRead(0)/1023);
	
	var VAR = getDeviceProperty(getName(), "VOLUME_AT_RATE");
	if(!VAR)
		setDeviceProperty(getName(), "VOLUME_AT_RATE", VOLUME_AT_RATE);
}

function processData(data) {
	input = data;
	if ( input > 0 )
		digitalWrite(5, HIGH);
	else
		digitalWrite(5, LOW);
	IoEClient.reportStates(input);
}

function loop()
{
	updateEnvironment();
	delay(1000);
}


function updateEnvironment()
{
	var VAR = parseFloat(getDeviceProperty(getName(), "VOLUME_AT_RATE"));
	if( VAR < 0 )
		VAR = VOLUME_AT_RATE;
	//Serial.println("VAR: " + VAR);
	//Serial.println("input: " + input);

	var humidity_rate = input*HUMIDITY_RATE * VAR / Environment.getVolume();
	var temperature_rate = input*TEMPERATURE_RATE * VAR / Environment.getVolume();
	Environment.setContribution("Humidity", humidity_rate);
	Environment.setContribution("Ambient Temperature", temperature_rate);
	
	//Serial.println("T rate: " + temperature_rate);
}
