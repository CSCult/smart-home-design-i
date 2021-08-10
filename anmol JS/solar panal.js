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













