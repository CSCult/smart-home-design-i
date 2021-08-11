from options import Options
from time import *
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient


HUMIDITY_RATE = 5. / 3600 # 1% per hour        # var HUMIDITY_RATE
VOLUME_AT_RATE = 100000        # var VOLUME_AT_RATE
MAX_RATE = 100000        # var MAX_RATE

state = 0        # var state
level = 0        # var level


def on_input_received(rinput):
    processData(rinput, True)

def on_event_detect_0():
    processData(customRead(0), False)

def setup ():
    global state 
    IoEClient.setup({
        "type": "Humdifier",
        "states": [{
            "name": "Status",
            "type": "bool",
            "controllable": True
        }]
    })
    

    IoEClient.onInputReceive( on_input_received )

    add_event_detect(0, on_event_detect_0)

    state = restoreProperty("state", 0)
    setState(state)



def restoreProperty (propertyName, defaultValue):
    value = getDeviceProperty(getName(), propertyName)        # var value
    if value is not None:
        if isinstance(defaultValue, (int, float)):
            value = int(value)

        setDeviceProperty(getName(), propertyName, value)
        return value
    

    return defaultValue



def mouseEvent (pressed, x, y, firstPress):
    if firstPress:
        setState(( 0  if state  else 1 ) )




def processData (data, bIsRemote):
    if len(data) <= 0:
        return
    data = data.split(",")
    setState(int(data[0]))



def setState (newState):
    global state 
    analogWrite(A1, newState)
    state = newState
    IoEClient.reportStates(state)
    setDeviceProperty(getName(), "state", state)
    updateEnvironment()




def updateEnvironment ():
    if state == 1:
        volumeRatio = VOLUME_AT_RATE / Environment.getVolume()        # var volumeRatio
        Environment.setContribution("Humidity", HUMIDITY_RATE * volumeRatio, MAX_RATE, True)
    else:
        Environment.setContribution("Humidity", 0, MAX_RATE, True)


if __name__ == "__main__":
    setup()
    while True:
        #loop()
        sleep(0)

