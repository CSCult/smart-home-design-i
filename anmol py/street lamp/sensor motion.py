from time import *
from physical import *
from gpio import *
from pyjs import *


# cl-sensor-motion.js
class  SensorMotion:
    def __init__(self):        # var SensorMotion
        self.motionPrev = 0
        self.motion = 0
        self.devices = {}

        # init
        self.update_visuals()


    def update(self, sensors, devices):
        self.update_motion(sensors, devices)
        self.update_visuals()


    def valueDirection(self):
        if self.motionPrev is self.motion:
            return 0
        elif self.motionPrev < self.motion:
            return 1
        return -1


    def value(self):
        if self.motion:
            return self.motion
        elif self.valueDirection() is not 0:
            return 1
        return 0


    # private
    def update_visuals(self):
        # value
        value = self.value()        # var value
        if value > 0:
            setComponentOpacity("SensorMotionOn", 1)
            setComponentOpacity("SensorMotionOff", 0)
        else:
            setComponentOpacity("SensorMotionOn", 0)
            setComponentOpacity("SensorMotionOff", 1)



    # private
    def update_motion(self, sensors, devices):
        myname = getName()        # var myname

        self.motionPrev = self.motion

        for n in self.devices:        # var n
            self.devices[n].current = False


        for i in xrange(0, len(devices)) :
            name = devices[i]        # var name
            mydev = self.devices.get(name)
            if name is myname:
                continue
            if mydev is None:
                self.devices[name] = JsObject({
                    "current": True
                })
                
                self.motion += 1
            else:
                mydev.current = True



        for nn in self.devices:        # var nn
            if not self.devices[nn].current:
                del self.devices[nn]
                self.motion -= 1


