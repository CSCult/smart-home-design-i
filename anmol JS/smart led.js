var MAX_LIGHT_PERCENT = 3;
var VOLUME_AT_RATE = 100000;

var input;

function setup() {
	IoEClient.setup({
		type: "Smart LED",
		states: [
		{
			name: "Brightness",
			type: "number",
			controllable: false
		}			
		]
	});
	
	attachInterrupt(A0, update);
	
	update();
}

function update() {
	input = analogRead(A0);
	setComponentOpacity("black", (1-normalize(input, 0, 1023)));
	IoEClient.reportStates(input);
	setDeviceProperty(getName(), "level", input);
}

function normalize(x, min, max)
{
	var out = (x-min)/(max-min);
	if ( out < min )
		out = min;
	else if (out > max)
		out = max;
	return out;
}

function loop()
{
	updateEnvironment();
	delay(1000);
}

function updateEnvironment()
{
	var rate = (input)/1023*MAX_LIGHT_PERCENT*VOLUME_AT_RATE / Environment.getVolume();
	// rate equals limit because we want it to happen immediately
	Environment.setContribution("Visible Light", rate, rate, false);
}
