from time import *
from physical import *
from gpio import *
from ioeclient import IoEClient
from pyjs import JsObject 
from udp import *
from sensor_light import SensorLight 
from sensor_motion import SensorMotion 

DELAY = 250

SIZE = JsObject({  # var SIZE
    "width": 150, 
    "height": 150 
}) # largest component size

SERVER_PORT = 1234        # var SERVER_PORT
SERVER_IP = "192.168.0.100"        # var SERVER_IP

socket = None        # var socket
sensors = None        # var sensors

def setup ():
    global socket, sensors
    
    IoEClient.setup({
        "type": "Street Lamp",
        "states": [{
            "name": "Light",
            "type": "number",
            "controllable": False
        }, {
            "name": "Light gradient",
            "type": "options",
            "options": {
                "-1": "Decreasing",
                "0": "No Change",
                "1": "Increasing"
            },
            "controllable": False
        }, {
            "name": "Motion",
            "type": "number",
            "controllable": False
        }, {
            "name": "Moton gradient",
            "type": "options",
            "options": {
                "-1": "Decreasing",
                "0": "No Change",
                "1": "Increasing"
            },
            "controllable": False
        }]
    })
    
    sensors = JsObject({
        "light": SensorLight(),     
        "motion": SensorMotion()     
    })
    
    socket = UDPSocket()
    socket.begin(SERVER_PORT)


def loop ():
    global dataPrev
    xpos = getX()        # var xpos
    ypos = getY()
    devices = devicesAt(xpos, ypos, SIZE.width, SIZE.height * 2)        # var devices

    sensors.light.update(sensors, devices)
    sensors.motion.update(sensors, devices)
    
    sendData()
    sendReport()


# send data to the server
def sendData():
    data = "".join([
        "streetlamp," , str( getSerialNumber() ) , "^",
        "light," , str( sensors.light.value() ) , ",", 
            str( sensors.light.valueDirection() ) , "^",
        "motion," , str( sensors.motion.value() ) , ",", 
            str(sensors.motion.valueDirection() )
    ])
    socket.send(SERVER_IP, SERVER_PORT, data)

# send report to reg server
def sendReport ():
    report = ",".join([
        str( sensors.light.value() ), 
        str( sensors.light.valueDirection() ),
        str( sensors.motion.value() ),
        str( sensors.motion.valueDirection() )
    ])
    IoEClient.reportStates(report)


if __name__ == "__main__":
    setup()
    while True:
        loop()
        delay(DELAY)


