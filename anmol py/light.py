from gpio import *
from time import *
from physical import *
from ioeclient import *
from environment import *


ENVIRONMENT_IMPACT_DIM = 10
VOLUME_AT_RATE = 100000

state = 0;  # 0 off, 1 low, 2 high
lastTimeInSeconds = 0

def main():
    setup()
    while True:
        loop()

        
def setup():

    IoEClient.setup({
        "type": "Light",
        "states": [
        {
            "name": "Status",
            "type": "options",
            "options": {
                "0": "Off",
                "1": "Dim",
                "2": "On"
            },
            "controllable": True
        }
        ]
    })

    IoEClient.onInputReceive(onInputReceiveDone)
    global state
    add_event_detect(0, detect)
    state = restoreProperty("state", 0)
    setState(state)

def detect():
    processData(customRead(0), False)
    
def onInputReceiveDone(analogInput):
    processData(analogInput, True)
        
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
        setState(state+1)

def loop():
    updateEnvironment()
    sleep(1)


def processData(data, bIsRemote):
    if  len(data) <= 0 :
        return
    setState(int(data))


def setState(newState):
    global state
    if newState >= 3 :
        newState = 0
    state = newState

    analogWrite(A1, state)
    customWrite(0, state)
    IoEClient.reportStates(state)
    setDeviceProperty(getName(), "state", state)

def updateEnvironment():
    global VOLUME_AT_RATE
    global ENVIRONMENT_IMPACT_DIM
    volumeRatio = float(VOLUME_AT_RATE) / Environment.getVolume()
    if  state is 0 :
        Environment.setContribution("Visible Light", 0,0, True)
    elif  state is 1:
        Environment.setContribution("Visible Light", ENVIRONMENT_IMPACT_DIM*volumeRatio, ENVIRONMENT_IMPACT_DIM*volumeRatio, False)
    elif  state is 2 :
        Environment.setContribution("Visible Light", ENVIRONMENT_IMPACT_DIM*2*volumeRatio, ENVIRONMENT_IMPACT_DIM*2*volumeRatio, False)

if __name__ == "__main__":
    main()