	from gpio import *
from time import *
from ioeclient import *
from physical import *
from bluetooth import *
import math

dstService = "{58c41a2f-5111-45b0-863c-0429591c81fd}"
btService = BluetoothService()
state = 0
active = 0

def setup ():
    IoEClient.setup({
        "type": "Bluetooth Speaker",
        "states": [{
            "name": "Connected",
            "type": "bool",
            "controllable": False
        },
        {
            "name": "Playing",
            "type": "bool",
            "controllable": False
        }]
    })
    global state
    global active
    global dstService
    global blueTooth
    state = restoreProperty("state", 0)
    active = restoreProperty("active", 0)

    destroySounds()
    Bluetooth.init()
    Bluetooth.setAcceptingPairRequest(True)
    Bluetooth.setDiscoverable(True)
    print btService.start(dstService)


def restoreProperty(propertyName, defaultValue):
    value = getDeviceProperty(getName(), propertyName)
    if  not (value == "" or value == None):
        if  type(defaultValue) is int :
            value = int(value)

        setDeviceProperty(getName(), propertyName, value)
        return value
    return defaultValue

def main ():
    setup()
    while True:
        updateState()
        delay(1000)


def updateState ():
    global state
    global active
    if float(active) == 0:
        digitalWrite(1, LOW)
    else:
        digitalWrite(1, HIGH)

    report = str(state) + "," + str(active)
    IoEClient.reportStates(report)
    setDeviceProperty(getName(), "state", state)
    setDeviceProperty(getName(), "active", active)


def playMusic (sound):
    global active
    destroySounds()
    addSound("music", sound)
    playSound("music", -1)
    active = 1
    digitalWrite(1, HIGH)


def stopMusic ():
    global active
    destroySounds()
    active = 0
    digitalWrite(1, LOW)

def onAcceptPairRequestDone(mac, deviceName):
    print "accepting pair request: " + str(mac)
    Bluetooth.acceptPairRequest(mac, deviceName)
    

def onDevicePairDone(mac):
    global state
    print "paired: " + str(mac)
    state = 1
    

def onDeviceUnpairDone(mac):
    global state
    print "unpaired: " + str(mac)
    stopMusic()
    state = 0
    

def onDeviceConnectDone(mac):
    global state
    print "connected: " + str(mac)
    state = 1
    

def onDeviceDisconnectDone(mac):
    global state
    print "disconnected: " + str(mac)
    stopMusic()
    state = 0
    

def onReceiveDone(srcMac, srcService, dstMac, dstService, data):
    print "received from " + srcMac + ":" + srcService + ": " + data
    if len(data) > 0:
        playMusic(data)
    else:
        stopMusic()
        
btService.onReceive(onReceiveDone)
Bluetooth.onDeviceDisconnect(onDeviceDisconnectDone)
Bluetooth.onDeviceConnect(onDeviceConnectDone)
Bluetooth.onDevicePair(onDevicePairDone)
Bluetooth.onDeviceUnpair(onDeviceUnpairDone)
Bluetooth.onPairRequest(onAcceptPairRequestDone)

if __name__ == "__main__":
    main()
