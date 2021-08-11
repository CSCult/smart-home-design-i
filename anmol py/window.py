from gpio import *
from time import *
from ioeclient import *
from physical import *
from environment import *
import math

ENVIRONMENTS = ["Argon", "CO", "CO2", "Hydrogen", "Helium", "Methane", "Nitrogen", "O2", "Ozone", "Propane", "Smoke"]
ENVIRONMENT_MAX_IMPACT = -0.01; # 2% max when door opens
TEMPERATURE_TRANSFERENCE_MULTIPLIER = 1.20; # increase speed 25% when door open
HUMIDITY_TRANSFERENCE_MULTIPLIER = 1.20
GASES_TRANSFERENCE_MULTIPLIER = 2

state = 0

def main():
	setup()
	while True:
		loop()
#set up client to talk and listen to IoE registration server
def setup():
    IoEClient.setup({
        "type": "Window",
        "states": [{
            "name": "On",
            "type": "bool",
            "controllable": True
        }]
    })

    IoEClient.onInputReceive(onInputReceiveDone)
    add_event_detect(0, detect)
    
    state = restoreProperty("state", 0)
    setState(state)

def onInputReceiveDone(data):
    processData(data, True)
    
def detect():
    processData(customRead(0), false)
    
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


#update carbon dioxide and carbon monoxide and send new data to registration server
def loop():
    updateEnvironment()
    delay(1000)


#process data received from server
def processData(data, bIsRemote):
    if  len(data) <= 0 :
        return
    data = data.split(",")
    setState(int(data[0]))


#set state and update component image to reflect the current state
def setState(newState):
    global state
    if  newState is 0 :
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)
    
    state = newState
    customWrite(0, state)
    IoEClient.reportStates(state)
    setDeviceProperty(getName(), "state", state)

def updateEnvironment():
    global ENVIRONMENTS
    global ENVIRONMENT_MAX_IMPACT
    global GASES_TRANSFERENCE_MULTIPLIER
    global TEMPERATURE_TRANSFERENCE_MULTIPLIER
    global HUMIDITY_TRANSFERENCE_MULTIPLIER
    global state

    if  state == 1:
        for i in range (0,len(ENVIRONMENTS)):
            max = Environment.get(ENVIRONMENTS[i]) * ENVIRONMENT_MAX_IMPACT
            # the max is reached in an hour, so we divide by 3600 to get seconds
            # then this rate is also based on 100,000 cubic meters (approx. coporate office size)
            rate = float(max) / 3600 * 100000 / Environment.getVolume()
            Environment.setContribution(ENVIRONMENTS[i], rate, max, True)
            Environment.setTransferenceMultiplier(ENVIRONMENTS[i], GASES_TRANSFERENCE_MULTIPLIER)

        Environment.setTransferenceMultiplier("Ambient Temperature", TEMPERATURE_TRANSFERENCE_MULTIPLIER)
        Environment.setTransferenceMultiplier("Humidity", HUMIDITY_TRANSFERENCE_MULTIPLIER)
    else:
        for j in range (0, len(ENVIRONMENTS)):
            Environment.setContribution(ENVIRONMENTS[j], 0, 0, True)
            Environment.removeCumulativeContribution(ENVIRONMENTS[j])
            Environment.setTransferenceMultiplier(ENVIRONMENTS[j], 1)

        Environment.setTransferenceMultiplier("Ambient Temperature", 1)
        Environment.setTransferenceMultiplier("Humidity", 1)

if __name__ == "__main__":
    main()