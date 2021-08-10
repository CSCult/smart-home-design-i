//Solar Panel
//Read the sunlight levels
//Output electricity based on sunlight
//Panel will be 160Watts per square meter

//Features output to IoE Server:
// number of kWh of energy produced since turning on
// number of kWh per minute
// current production
var ENVIRONMENT_NAME = "Sunlight";
var MULTIPLIER = 255/1023;
var MAX_POWER = 1000;//1000 Watts of power based on one meter solar panel at noon at the equator
var EFFICIENCY = 0.16;//About a 16 percent efficiency per solar panel
var PANEL_POWER = MAX_POWER * EFFICIENCY;
var LOG_BASE = 1.0749111034571373359815489867558;

var state = 1;
var electricity = 0;
//var tick = 0;

function setup(){
	
	IoEClient.setup({
		type: "Solar",
		states: [
			{
			name: "Status",
			type: "number",
			unit: 'Wh',
			controllable: false
			}
	 ]
	 });
	 
	 IoEClient.onInputReceive = function(input) {
		// Serial.println("input: " + input);
	 	processData(input, true);
	 };
	
	
	sendReport();

}

function loop(){
//	if ( (tick++ % 10) === 0 )	// is tick consistent across devices? 
//	{
		electricity = Math.round(getElectricityProduction());
		//Serial.println(electricity);
		displayElectricity();
		sendReport();
		outputElectricity();
		delay(1000);
//	}
}

function displayElectricity(){
	setCustomText(70, 45, 1000, 1000, String(parseInt(electricity)) + '\tW');
}

function getElectricityProduction(){
	return PANEL_POWER * Environment.get(ENVIRONMENT_NAME) / 100;
}

function sendReport()
{
	var report = state;	// comma seperated states
	IoEClient.reportStates(electricity);
	setDeviceProperty(getName(), "level", electricity);
}

function outputElectricity(){
	var el_log = Math.floor(Math.log(electricity)/Math.log(LOG_BASE));
	if(el_log < 0)
		el_log = 0;
	else if (el_log > 255)
		el_log = 255;
//	Serial.println(el_log);
	analogWrite(0, el_log);
}














//wind detector


var ENVIRONMENT_NAME = "Wind Speed";
var state = 0;
var level = 0;
var tick = 0;

//set up client to talk and listen to IoE registration server
function setup() {
	IoEClient.setup({
		type: "Wind Detector",
		states: [{
			name: "Wind",
			type: "bool",
			controllable: false
		}]
	});
	
	IoEClient.onInputReceive = function(input) {
		processData(input, true);
	};
	
	setState(state);
	sendReport();

}

//continously checking if WIND exist and send report to registration server
function loop() {

	if ( (tick++ % 10) === 0 )	// is tick consistent across devices? 
	{
		detect();
		sendReport();
	}
}

//get WIND variable defined in Environment
function detect()
{
	var value = Environment.get(ENVIRONMENT_NAME);

	if (value >= 1 )
		setState(1);
	else
		setState(0);
}

//process data received from server
//not being called since controllable set to false in client setup
function processData(data, bIsRemote)
{
	if ( data.length <= 0  )
		return;
	data = data.split(",");
	setState(parseInt(data[0]));
}

//send wind state  to the server
function sendReport()
{
	var report = state;	// comma seperated states
	IoEClient.reportStates(report);
}

//set state and update component image to reflect the current state
function setState(newState)
{
	if ( newState === 0 ){
		digitalWrite(1, LOW);
	}
	else{
		digitalWrite(1, HIGH);
	}
	
	state = newState;
	
	sendReport();
}

//toggle wind state
function toggleState()
{
	if ( state === 0)
		setState(1);
	else
		setState(0);
}






//old car

var CO_RATE = 1/3600; // 1% per hour
var CO2_RATE = 2/3600;
var SMOKE_RATE = 3/3600;
var TEMPERATURE_RATE = 1/3600;
var VOLUME_AT_RATE = 100000;

var state = 0;

function updateEnvironment()
{
	if ( state == 1 )
	{
		var volumeRatio = VOLUME_AT_RATE / Environment.getVolume();
		Environment.setContribution("CO", CO_RATE*volumeRatio);
		Environment.setContribution("CO2", CO2_RATE*volumeRatio);
		Environment.setContribution("Smoke", SMOKE_RATE*volumeRatio);
		Environment.setContribution("Ambient Temperature",TEMPERATURE_RATE*volumeRatio );
		
		
	}
	else
	{
		Environment.setContribution("CO", 0);
		Environment.setContribution("CO2", 0);
		Environment.setContribution("Smoke", 0);
		Environment.setContribution("Ambient Temperature", 0 );
	}
	
}


function setup() {
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

function setState(newState)
{
	if ( newState === 0 )
		digitalWrite(1, LOW);
	else{
		digitalWrite(1, HIGH);
	}
	state = newState;
	setDeviceProperty(getName(), "state", state);
	updateEnvironment();
}
