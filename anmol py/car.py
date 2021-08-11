from time import *
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient

CO_RATE = 1./3600 # 1% per hour
CO2_RATE = 2./3600
SMOKE_RATE = 3./3600
TEMPERATURE_RATE = 1./3600
VOLUME_AT_RATE = 100000.
MAX_RATE = 1.e6

state = 0

def updateEnvironment ():
    if  state == 1 :
        volumeRatio = VOLUME_AT_RATE / Environment.getVolume()
        Environment.setContribution("CO", CO_RATE*volumeRatio, MAX_RATE, True)
        Environment.setContribution("CO2", CO2_RATE*volumeRatio, MAX_RATE, True)
        Environment.setContribution("Smoke", SMOKE_RATE*volumeRatio, MAX_RATE, True)
        Environment.setContribution("Ambient Temperature",TEMPERATURE_RATE*volumeRatio, MAX_RATE, True)
    else:
        Environment.setContribution("CO", 0, 0, True)
        Environment.setContribution("CO2", 0, 0, True)
        Environment.setContribution("Smoke", 0, 0, True)
        Environment.setContribution("Ambient Temperature", 0 , 0, True)

def setup ():
    global state
    state = restoreProperty("state", 0);
    setState(state)

def restoreProperty(propertyName, defaultValue):
    value = getDeviceProperty(getName(), propertyName)
    if  not (value is "" or value is None):
        if  type(defaultValue) is int :
            value = int(value)

        setDeviceProperty(getName(), propertyName, value)
        return value
    return defaultValue

def mouseEvent (pressed, x, y, firstPress):
    if firstPress:
        setState(0 if state else 1)

def setState (newState):
    global state
    if  newState == 0 :
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)

    state = newState
    setDeviceProperty(getName(), "state", state)
    updateEnvironment()

if __name__ == "__main__":
    setup()
    while True:
        sleep(3600)

