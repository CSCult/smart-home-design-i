// cl-sensor-motion.js

var SensorMotion= function () {
    this.motionPrev = 0;
    this.motion = 0;
    this.devices = {};

    // init
    this.update_visuals();
};

SensorMotion.prototype.update = function (sensors, devices) {
    this.update_motion(sensors, devices);
    this.update_visuals();
};

SensorMotion.prototype.valueDirection = function () {
    if(this.motionPrev === this.motion)
        return 0;
    else if(this.motionPrev < this.motion)
        return 1;
    return -1;
};

SensorMotion.prototype.value = function () {
    if(this.motion)
    	return this.motion;
    else if(this.valueDirection() !== 0)
    	return 1;
    return 0;
};

// private 
SensorMotion.prototype.update_visuals = function () {
    // value
    var value = this.value();
    if(value > 0) {
        setComponentOpacity("SensorMotionOn", 1); 
        setComponentOpacity("SensorMotionOff", 0); 
    }
    else{
        setComponentOpacity("SensorMotionOn", 0); 
        setComponentOpacity("SensorMotionOff", 1); 
    }
};

// private 
SensorMotion.prototype.update_motion = function (sensors, devices) {
    var myname = getName();

	this.motionPrev = this.motion;

    for(var n in this.devices) {
        this.devices[n].current = false; 
    }

    for(var i=0; i<devices.length; ++i) {
        var name = devices[i],
            mydev = this.devices[name];
        if(name === myname)
            continue; 
        if(mydev === undefined){
            this.devices[name] = {current: true};
            ++this.motion;
        }
        else {
            mydev.current = true;
        }
    }

    for(var nn in this.devices){ 
        if(!this.devices[nn].current) {
            delete this.devices[nn];
            --this.motion;
      }
    }
};

