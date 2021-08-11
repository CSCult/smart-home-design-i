from options import Options
from time import *
import math
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient


ENVIRONMENT_NAME = "Wind Speed"        # var ENVIRONMENT_NAME
state = 0        # var state
tick = 0        # var tick

# set up client to talk and listen to IoE registration server

def setup ():
    
    IoEClient.setup({
        "type": "Wind Detector",
        "states": [{
            "name": "Wind",
            "type": "bool",
            "controllable": False
        }]
    })
    
    IoEClient.onInputReceive ( lambda rinput: processData(input, True) )

    setState(state)
    sendReport()



# continously checking if WIND exist and send report to registration server

def loop ():
    global tick 

    if tick % 10 == 0: # is tick consistent across devices?
        detect()
        sendReport()
    tick += 1
    


# get WIND variable defined in Environment

def detect ():
    value = Environment.get(ENVIRONMENT_NAME)        # var value

    if value >= 1:
        setState(1)
    else:
        setState(0)


# process data received from server
# not being called since controllable set to False in client setup

def processData (data, bIsRemote):
    if len(data) <= 0:
        return
    data = data.split(",")        # var data
    setState(int(data[0]))


# send wind state  to the server

def sendReport ():
    report = state # comma seperated states        # var report
    IoEClient.reportStates(report)


# set state and update component image to reflect the current state

def setState (newState):
    global state
    if newState == 0:
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)

    state = newState

    sendReport()


# toggle wind state

def toggleState ():
    if state == 0:
        setState(1)
    else:
        setState(0)


if __name__ == "__main__":
    setup()
    while True:
        loop()
        sleep(0)

