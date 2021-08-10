


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
