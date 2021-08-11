from gpio import *
from time import *
from ioeclient import *
from physical import *
from environment import *
import math

state = 0

def main():
	setup()
	while True:
		loop()
		
#set up client to talk and listen to IoE registration server
def setup():
    global state
    IoEClient.setup({
        "type": "Webcam",
        "states": [{
            "name": "On",
            "type": "bool",
            "controllable": True
        },
        {
            "name": "Image",
            "type": "image"
        }]
    })

    IoEClient.onInputReceive(onInputReceiveDone)
    add_event_detect(0, detect)

    state = restoreProperty("state", 0)
    sendReport()

def onInputReceiveDone(data):
    processData(data, True)
    
def detect():
    processData(customRead(0), False)
    
def restoreProperty(propertyName, defaultValue):
    value = getDeviceProperty(getName(), propertyName)
    if  not (value is "" or value is None):
        if  type(defaultValue) is int :
            value = int(value)

        setDeviceProperty(getName(), propertyName, value)
        return value
    return defaultValue

def mouseEvent(pressed, x, y, firstPress):
    global state
    if firstPress:
        if state == True:
        	setState(0)
        else:
        	setState(1)


#send captured image file path to registration server
def loop():
    sendReport()
    delay(1000)


#process data received from server
def processData(data, bIsRemote):
    if  len(data) <= 0 :
        return
    data = data.split(",")
    setState(int(data[0]))


#send image path to server
imageLoop=0
def sendReport():
    global state
    global imageLoop
    report = str(state) + ","   # comma seperated states

    if state is 0:
        report += '../art/IoE/SmartDevices/camera_off.png'
    else:
        report += '../art/IoE/SmartDevices/camera_image'+ str(imageLoop)+'.png'
        imageLoop = imageLoop + 1
        if  imageLoop >= 3:
            imageLoop =0
    
    customWrite(0, report)
    IoEClient.reportStates(report)
    setDeviceProperty(getName(), "state", state)


#set state and update component image to reflect the current state
def setState(newState):
    global state
    if  newState is 0 :
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)

    state = newState
    
if __name__ == "__main__":
    main()