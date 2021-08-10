
var ENVIRONMENTS = ["Argon", "CO", "CO2", "Hydrogen", "Helium", "Methane", "Nitrogen", "O2", "Ozone", "Propane", "Smoke"];
var ENVIRONMENT_MAX_IMPACT = -0.02; // 2% max when door opens
var TEMPERATURE_TRANSFERENCE_MULTIPLIER = 1.25; // increase speed 25% when door open
var HUMIDITY_TRANSFERENCE_MULTIPLIER = 1.25;
var GASES_TRANSFERENCE_MULTIPLIER = 2;

var doorState = 0;	// 0 is closed, 1 is opened
var lockState = 0;  // 0 is unlocked, 1 is locked

function setup () {
	IoEClient.setup({
		type: "Door",
		states: [{
			name: "Open",
			type: "bool"
		}, {
			name: "Lock",
			type: "options",
			options: {
				"0": "Unlock",
				"1": "Lock"
			},
			controllable: true
		}]
	});
	
	IoEClient.onInputReceive = function (input) {
		processData(input, true);
	};
	
	attachInterrupt(0, function () {
		processData(customRead(0), false);
	});
	
	setDoorState(doorState);
	setLockState(lockState);
}

function mouseEvent (pressed, x, y, firstPress) {
	if (firstPress) {
		if ( isPointInRectangle(x, y, 10,40,5,10) )
		{
			if ( lockState === 0 ) {
				setLockState(1);
            } else {
				setLockState(0);
            }
		} else {
			if ( doorState === 0 ) {
				openDoor();
            } else {
				closeDoor();
            }
		}		
	}
}

function loop () {
	
}

function processData (data, bIsRemote) {
	if ( data.length <= 0  ) {
		return;
    }
	Serial.println(data);
	
	data = data.split(",");
	var doorStateData = parseInt(data[0]);
	var lockStateData = parseInt(data[1]);
	if ( lockStateData > -1 ) {
		setLockState(lockStateData);
    }
	
	if ( doorStateData > -1 && !bIsRemote ) {
		if ( doorStateData === 0 ) { 
			closeDoor();
        } else {
			openDoor();
        }
	}
}
function sendReport () {
	var report = doorState+","+lockState;	// comma seperated states
	customWrite(0, report);

	IoEClient.reportStates(report);
	setDeviceProperty(getName(), "door state", doorState);
	setDeviceProperty(getName(), "lock state", lockState);
}

function closeDoor () {
	setDoorState(0);
	updateEnvironment();
}

function openDoor () {
	if ( lockState===0 ) {
		setDoorState(1);
		updateEnvironment();
	} else {
		Serial.println("can't open locked door");
	}
	
	
}

function setDoorState (state) {
	if ( state === 0) {
		digitalWrite(1, LOW);
		setComponentOpacity("led", 1);	// show the led
	} else {
		digitalWrite(1, HIGH);
		setComponentOpacity("led", 0);	// hide the led
	}
	doorState = state;
	sendReport();
}

function setLockState (state) {
	if ( state === 0 ) {
		digitalWrite(2, LOW);
    } else {
		digitalWrite(2, HIGH);
    }
	
	lockState = state;
	sendReport();
}


function updateEnvironment () {
	var rate,max;
	if ( doorState == 1) {
		for (var i=0; i<ENVIRONMENTS.length; i++) {
			max = Environment.get(ENVIRONMENTS[i]) * ENVIRONMENT_MAX_IMPACT;
			// the max is reached in an hour, so we divide by 3600 to get seconds
			// then this rate is also based on 100,000 cubic meters (approx. coporate office size)
			rate = max / 3600 * 100000 / Environment.getVolume();
			Environment.setContribution(ENVIRONMENTS[i], rate, max);
			Environment.setTransferenceMultiplier(ENVIRONMENTS[i], GASES_TRANSFERENCE_MULTIPLIER);
		}
		
		Environment.setTransferenceMultiplier("Ambient Temperature", TEMPERATURE_TRANSFERENCE_MULTIPLIER);
		Environment.setTransferenceMultiplier("Humidity", HUMIDITY_TRANSFERENCE_MULTIPLIER);
	} else {
		for (var i=0; i<ENVIRONMENTS.length; i++) {
			Environment.setContribution(ENVIRONMENTS[i], 0, 0);
			Environment.removeCumulativeContribution(ENVIRONMENTS[i]);
			Environment.setTransferenceMultiplier(ENVIRONMENTS[i], 1);
		}
		Environment.setTransferenceMultiplier("Ambient Temperature", 1);
		Environment.setTransferenceMultiplier("Humidity", 1);
	}
}

function isPointInRectangle (x,y, rx, ry, width, height) {
	if (width <= 0 || height <= 0) {
		return false;
	}
 
	return (x >= rx && x <= rx + width && y >= ry && y <= ry + height);
}

