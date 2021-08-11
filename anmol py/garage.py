from time import *
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient

ENVIRONMENTS = [
    "Argon", "CO", "CO2", "Hydrogen", "Helium", "Methane", 
    "Nitrogen", "O2", "Ozone", "Propane", "Smoke"]
ENVIRONMENT_MAX_IMPACT = -0.04 # 4% max when door opens
TEMPERATURE_TRANSFERENCE_MULTIPLIER = 1.50 # increase speed 25% when door open
HUMIDITY_TRANSFERENCE_MULTIPLIER = 1.50
GASES_TRANSFERENCE_MULTIPLIER = 2

state = 0 # 0 off, 1 on

def on_event_detect_0 () :
    processData(customRead(0), False)

def on_input_receive(input) :
    processData(input, True)


def setup ():
    global state
    IoEClient.setup ({
        "type": "Garage Door",
        "states": [{
            "name": "On",
            "type": "bool",
            "controllable": True
        }]
    })

    IoEClient.onInputReceive(on_input_receive) 

    add_event_detect(0, on_event_detect_0)

    state = restoreProperty("state", 0);
    setState(state)


def restoreProperty (propertyName, defaultValue):
    value = getDeviceProperty(getName(), propertyName)
    if value :
        if isinstance(defaultValue, (int, float)):
            value = int(value)

        setDeviceProperty(getName(), propertyName, value)
        return value

    return defaultValue


def mouseEvent (pressed, x, y, firstPress):
    if  firstPress :
        setState(0 if state else 1)


def updateEnvironment ():
    if  state == 1:
        for e in ENVIRONMENTS:
            emax = Environment.get(e) * ENVIRONMENT_MAX_IMPACT
            # the emax is reached in an hour, so we divide by 3600 to get seconds
            # then this rate is also based on 100,000 cubic meters (approx. coporate office size)
            rate = emax / 3600 * 100000 / Environment.getVolume()
            Environment.setContribution(e, rate, emax, True)
            Environment.setTransferenceMultiplier(e, GASES_TRANSFERENCE_MULTIPLIER)

        Environment.setTransferenceMultiplier("Ambient Temperature", TEMPERATURE_TRANSFERENCE_MULTIPLIER)
        Environment.setTransferenceMultiplier("Humidity", HUMIDITY_TRANSFERENCE_MULTIPLIER)
    else:
        for  e in ENVIRONMENTS:
            Environment.setContribution(e, 0, 0, True)
            Environment.removeCumulativeContribution(e)
            Environment.setTransferenceMultiplier(e, 1)

        Environment.setTransferenceMultiplier("Ambient Temperature", 1)
        Environment.setTransferenceMultiplier("Humidity", 1)


def processData (data, bIsRemote):
    if  data is None or data is "":
        return

    setState(int(data))


def setState (newState):
    global state
    state = newState

    digitalWrite(1, HIGH if state else LOW)
    customWrite(0, state)
    IoEClient.reportStates(state)
    setDeviceProperty(getName(), "state", state)

    updateEnvironment()


if __name__ == "__main__":
    setup()
    while True:
        sleep(0)

