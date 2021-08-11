from physical import *
from bluetooth import *
from time import *

DEFAULT_BEACON_UUID = "{00000000-0000-0000-0000-000000000001}"
DEFAULT_BEACON_DATA = "Location 1"

def setup():
    Bluetooth.init()
    Bluetooth.enableBroadcast(True)
    global DEFAULT_BEACON_UUID
    global DEFAULT_BEACON_DATA
    uuid = getDeviceProperty(getName(), "beaconUuid")
    if uuid == None:
        setDeviceProperty(getName(), "beaconUuid", DEFAULT_BEACON_UUID)

    data = getDeviceProperty(getName(), "beaconData")
    if data == None:
        setDeviceProperty(getName(), "beaconData", DEFAULT_BEACON_DATA)


def main():
    setup()
    while True:
        uuid = getDeviceProperty(getName(), "beaconUuid")
        data = getDeviceProperty(getName(), "beaconData")
        print "Broadcasting to " + str(uuid)
        Bluetooth.broadcastBeacon(uuid, data)
        delay(5000)
        
if __name__ == "__main__":
    main()