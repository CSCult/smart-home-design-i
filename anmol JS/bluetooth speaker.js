var dstService = "{58c41a2f-5111-45b0-863c-0429591c81fd}";
var btService = new BluetoothService();
var state = 0;
var active = 0;

function setup() {
	IoEClient.setup({
		type: "Bluetooth Speaker",
		states: [{
			name: "Connected",
			type: "bool",
			controllable: false
		},
		{
			name: "Playing",
			type: "bool",
			controllable: false
		}]
	});
	
	state = restoreProperty("state", 0);
	active = restoreProperty("active", 0);
	
	destroySounds();
	Bluetooth.init();
	Bluetooth.setAcceptingPairRequest(true);
	Bluetooth.setDiscoverable(true);
	Serial.println(btService.start(dstService));
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

function loop() {
	updateState();
	delay(1000);	
}

function updateState() {
	if (active)
		digitalWrite(1, HIGH);
	else
		digitalWrite(1, LOW);
	
	var report = state + "," + active;
	IoEClient.reportStates(report);
	setDeviceProperty(getName(), "state", state);
	setDeviceProperty(getName(), "active", active);
}

function playMusic(sound) {
	destroySounds();
	addSound("music", sound);
	playSound("music", -1);
	active = 1;
	digitalWrite(1, HIGH);
}

function stopMusic() {
	destroySounds();
	active = 0;
	digitalWrite(1, LOW);
}

Bluetooth.onPairRequest = function(mac, deviceName) {
	Serial.println("accepting pair request: " + mac);
	Bluetooth.acceptPairRequest(mac, deviceName);
};

Bluetooth.onDevicePair = function(mac) {
	Serial.println("paired: " + mac);
	state = 1;
};

Bluetooth.onDeviceUnpair = function(mac) {
	Serial.println("unpaired: " + mac);
	stopMusic();
	state = 0;
};

Bluetooth.onDeviceConnect = function(mac) {
	Serial.println("connected: " + mac);
	state = 1;
};

Bluetooth.onDeviceDisconnect = function(mac) {
	Serial.println("disconnected: " + mac);
	stopMusic();
	state = 0;
};

btService.onReceive = function(srcMac, srcService, dstMac, dstService, data) {
	Serial.println("received from " + srcMac + ":" + srcService + ": " + data);
	if (data.length)
		playMusic(data);
	else
		stopMusic();
};
