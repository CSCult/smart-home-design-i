from time import *
import math
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient


MAX_LIGHT_PERCENT = 3.       # var MAX_LIGHT_PERCENT
VOLUME_AT_RATE = 100000.        # var VOLUME_AT_RATE

ainput = None        # var ainput


def setup ():
    IoEClient.setup({
        "type": "Smart LED",
        "states": [{
            "name": "Brightness",
            "type": "number",
            "controllable": False
        }]
    })
    
    add_event_detect(A0, update)

    update()



def update ():
    global ainput
    ainput = analogRead(A0)
    setComponentOpacity("black", (1 - normalize(ainput, 0, 1023)))
    IoEClient.reportStates(ainput)
    setDeviceProperty(getName(), "level", ainput)


def normalize (x, min, max):
    out = (x - min) / float(max - min)        # var out
    if out < min:
        out = min
    elif out > max:
        out = max
    return out



def loop ():
    updateEnvironment()
    delay(1000)



def updateEnvironment ():
    rate = (ainput) / 1023. * MAX_LIGHT_PERCENT * VOLUME_AT_RATE / Environment.getVolume()        # var rate
    # rate equals limit because we want it to happen immediately
    Environment.setContribution("Visible Light", rate, rate, False)


if __name__ == "__main__":
    setup()
    while True:
        loop()
        sleep(0)

