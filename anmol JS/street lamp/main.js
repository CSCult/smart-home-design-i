var DELAY = 200;
var SIZE = {width: 150, height: 150}; // largest component size 
var SERVER_PORT = 1234;
var SERVER_IP = "192.168.0.100";

var socket = null;
var sensors = {};
var count = 0;


function setup() {
	IoEClient.setup({
		type: "Street Lamp",
		states: [{
			name: "Light",
			type: "number",
			controllable: false
		}, {
			name: "Light gradient",
			type: "options",
			options: {
				"-1": "Decreasing",
				"0": "No Change",
				"1": "Increasing"
			},
			controllable: false
		}, {
			name: "Motion",
			type: "number",
			controllable: false
		}, {
			name: "Moton gradient",
			type: "options",
			options: {
				"-1": "Decreasing",
				"0": "No Change",
				"1": "Increasing"
			},
			controllable: false
		}]
	});
	
	sensors.light = new SensorLight();
	sensors.motion = new SensorMotion();
	
	socket = new UDPSocket();
	socket.begin(SERVER_PORT);
}

function loop() {
	var t = new Timer();

    var xpos = getX(),
        ypos = getY();
    var devices = devicesAt(xpos, ypos, SIZE.width, SIZE.height*2);

	t = new Timer();
	
	sensors.light.update(sensors, devices);
	sensors.motion.update(sensors, devices);

	// send data to the server
	var data = "";
	
	data += "streetlamp," + getSerialNumber() + "^";
	data += "light," + sensors.light.value() + "," + sensors.light.valueDirection() + "^";
	data += "motion," + sensors.motion.value() + "," + sensors.motion.valueDirection();
	
	socket.send(SERVER_IP, SERVER_PORT, data);
	sendReport();
	delay(DELAY);
}

function sendReport() {
	var report = sensors.light.value() + "," + sensors.light.valueDirection() + ","
		+ sensors.motion.value() + "," + sensors.motion.valueDirection();
	IoEClient.reportStates(report);
}
