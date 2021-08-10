



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
