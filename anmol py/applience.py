from gpio import *
from time import *
from ioeclient import *
from environment import *
from physical import *

state = 0

def main():
    setup()
    global state
    while True:
        state = restoreProperty("state", 0)
        setState(state)
        delay(1000)
        
def setup():
    IoEClient.setup({
        "type": "Appliance",
        "states": [{
            "name": "On",
            "type": "bool",
            "controllable": True
        }]
    })
    IoEClient.onInputReceive(onInputReceiveDone)
    add_event_detect(0, detect)
        
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


def processData(data, bIsRemote):
    if  len(data) <= 0 :
        return
    setState(int(data))


def setState(newState):
    global state
    state = newState

    if  state == 0 :
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)
    customWrite(0, state)
    IoEClient.reportStates(state)
    setDeviceProperty(getName(), "state", state)

if __name__ == "__main__":
	main()