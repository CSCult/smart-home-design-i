

//garage door

var ENVIRONMENTS = ["Argon", "CO", "CO2", "Hydrogen", "Helium", "Methane", "Nitrogen", "O2", "Ozone", "Propane", "Smoke"];
var ENVIRONMENT_MAX_IMPACT = -0.04; // 4% max when door opens
var TEMPERATURE_TRANSFERENCE_MULTIPLIER = 1.50; // increase speed 25% when door open
var HUMIDITY_TRANSFERENCE_MULTIPLIER = 1.50;
var GASES_TRANSFERENCE_MULTIPLIER = 2;

var state = 0; // 0 off, 1 on

function setup () {
	
	IoEClient.setup ({
		type: "Garage Door",
		states: [{
			name: "On",
			type: "bool",
			controllable: true
		}]
	});
	
	IoEClient.onInputReceive = function (input) {
		processData(input, true);
	};
	
	attachInterrupt(0, function () {
		processData(customRead(0), false);
	});
	
	state = restoreProperty("state", 0);	
	setState(state);
}

function restoreProperty (propertyName, defaultValue) {
	var value = getDeviceProperty(getName(), propertyName);
	if ( !(value === "" || value == "undefined") ) {
		if ( typeof(defaultValue) == "number" ) {
			value = Number(value);
            }
		
		setDeviceProperty(getName(), propertyName, value);
		return value;
	}
	
	return defaultValue;
}

function mouseEvent (pressed, x, y, firstPress) {
	if ( firstPress ) {
		setState(state ? 0 : 1);
        }
}

function updateEnvironment () {
	var rate,max;
	if ( state == 1) {
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
		for ( var j=0; j<ENVIRONMENTS.length; j++ ) {
			Environment.setContribution(ENVIRONMENTS[j], 0, 0);
			Environment.removeCumulativeContribution(ENVIRONMENTS[j]);
			Environment.setTransferenceMultiplier(ENVIRONMENTS[j], 1);
		}
		Environment.setTransferenceMultiplier("Ambient Temperature", 1);
		Environment.setTransferenceMultiplier("Humidity", 1);
	}
}


function processData (data, bIsRemote) {
	if ( data.length <= 0  ) {
		return;
        }
	setState(parseInt(data));
}

function setState (newState) {
	state = newState;

	digitalWrite(1, state ? HIGH : LOW);
	customWrite(0, state);
	IoEClient.reportStates(state);
	setDeviceProperty(getName(), "state", state);
	
	updateEnvironment();
	
}
