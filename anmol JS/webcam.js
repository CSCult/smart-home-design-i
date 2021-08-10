var state = 0;

//set up client to talk and listen to IoE registration server
function setup() {
	
	IoEClient.setup({
		type: "Webcam",
		states: [{
			name: "On",
			type: "bool",
			controllable: true
		},
		{
			name: "Image",
			type: "image"
		}]
	});
	
	IoEClient.onInputReceive = function(input) {
		processData(input, true);
	};
	
	attachInterrupt(0, function() {
		processData(customRead(0), false);
	});
	
	state = restoreProperty("state", 0);
	sendReport();
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

//send captured image file path to registration server
function loop() {
	sendReport();
	delay(1000);
}

//process data received from server
function processData(data, bIsRemote)
{
	if ( data.length <= 0  )
		return;
	data = data.split(",");
	setState(parseInt(data[0]));
}

//send image path to server
var imageLoop=0;
function sendReport()
{
	var report = state + ",";	// comma seperated states
	
	if (state === 0)
		report += '../art/IoE/SmartDevices/camera_off.png';
	else{
		report += '../art/IoE/SmartDevices/camera_image'+imageLoop+'.png';
		imageLoop++;
		if ( imageLoop >= 3)
			imageLoop =0;
	}
	customWrite(0, report);
	IoEClient.reportStates(report);
	setDeviceProperty(getName(), "state", state);
	
}

//set state and update component image to reflect the current state
function setState(newState)
{
	if ( newState === 0 )
		digitalWrite(1, LOW);
	else
		digitalWrite(1, HIGH);
	
	state = newState;
}
