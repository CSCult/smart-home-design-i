from options import Options
from time import *
import math
from physical import *
from gpio import *
from environment import Environment
from ioeclient import IoEClient
#from pyjs import *


#Solar Panel
#Read the sunlight levels
#Output electricity based on sunlight
#Panel will be 160Watts per square meter

#Features output to IoE Server:
# number of kWh of energy produced since turning on
# number of kWh per minute
# current production
ENVIRONMENT_NAME = "Sunlight"        # var ENVIRONMENT_NAME
MULTIPLIER = 255. / 1023        # var MULTIPLIER
MAX_POWER = 1000. #1000 Watts of power based on one meter solar panel at noon at the equator        # var MAX_POWER
EFFICIENCY = 0.16 #About a 16 percent efficiency per solar panel        # var EFFICIENCY
PANEL_POWER = MAX_POWER * EFFICIENCY        # var PANEL_POWER
LOG_BASE = 1.0749111034571373359815489867558        # var LOG_BASE

state = 1        # var state
electricity = 0        # var electricity
#tick = 0        # var tick


def setup ():
    
    IoEClient.setup({
        "type": "Solar",
        "states": [{
            "name": "Status",
            "type": "number",
            "unit": 'Wh',
            "controllable": False
        }]
    })

    IoEClient.onInputReceive ( lambda rinput: processData(rinput, True) )

    sendReport()




def loop ():
    global electricity
    ##    if  (tick++ % 10) is 0 )    # is tick consistent across devices?
    ##    {
    electricity = int(getElectricityProduction())
    ##print(electricity)
    displayElectricity()
    sendReport()
    outputElectricity()
    delay(1000)
    ##    



def displayElectricity ():
    setCustomText(70, 45, 1000, 1000, str(int(electricity)) + '\tW')



def getElectricityProduction ():
    return PANEL_POWER * Environment.get(ENVIRONMENT_NAME) / 100



def sendReport ():
    report = state # comma seperated states        # var report
    IoEClient.reportStates(electricity)
    setDeviceProperty(getName(), "level", electricity)



def outputElectricity ():
    el_log = math.floor(math.log(electricity) / math.log(LOG_BASE))        # var el_log
    if el_log < 0:
        el_log = 0
    elif el_log > 255:
        el_log = 255
    ##    print(el_log)
    analogWrite(0, el_log)





if __name__ == "__main__":
    setup()
    while True:
        loop()
        sleep(0)

