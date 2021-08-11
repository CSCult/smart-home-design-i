from gpio import *
from time import *
from ioeclient import *
from environment import *
from physical import *

HUMIDITY_RATE = -2./3600; # -2% per hour
TEMPERATURE_RATE = -10./3600; # -10C per hour
VOLUME_AT_RATE = 100000.

myInput = 0


    
def onInputReceiveDone(data):
    if  len(data) <= 0:
        return
    data = data.split(",")
    processData(int(data[0]))
        

def detect():
    processData(digitalRead(0)/1023)
  
def setup():
    IoEClient.setup({
        "type": "AC",
        "states": [{
            "name": "On",
            "type": "bool",
            "controllable": True
        }]
    })
    IoEClient.onInputReceive(onInputReceiveDone)
    add_event_detect(0, detect)
    detect()
    
    VAR = getDeviceProperty(getName(), "VOLUME_AT_RATE")
    if not VAR:
    	setDeviceProperty(getName(), "VOLUME_AT_RATE", VOLUME_AT_RATE)



def processData(data):
    global myInput
    myInput = data
    if  myInput > 0 :
        digitalWrite(5, HIGH)
    else :
        digitalWrite(5, LOW)
    IoEClient.reportStates(myInput)


def updateEnvironment():
    VAR = float(getDeviceProperty(getName(), "VOLUME_AT_RATE"))
    if VAR < 0:
    	VAR = 0

    humidity_rate = float(myInput*HUMIDITY_RATE*VAR) / Environment.getVolume()
    temperature_rate = float(myInput*TEMPERATURE_RATE*VAR) / Environment.getVolume()
    Environment.setContribution("Humidity", humidity_rate, 0, True) 
    Environment.setContribution("Ambient Temperature", temperature_rate, -1000, True)
    #print temperature_rate, VAR

def main():
    setup()
    while True:
        updateEnvironment()
        delay(1000)
        
if __name__ == "__main__":
    main()