// cl-sensor-light.js
// Env.Sunlight is assumed to be from 0 to 100%

var SensorLight = function () {
    this.eLightMin = 0;     
    this.eLightMax = 100; // this is %, per Environment semantics for sunlight
    this.eLightMinValueOn = this.eLightMin+(this.eLightMax-this.eLightMin) / 3;

    // init
    setComponentOpacity("SensorLightOff", 0); 
    setComponentOpacity("SensorLightOn", 0); 
    setComponentOpacity("SensorLight", 0); 

    this.elight = Environment.get("Sunlight");
    this.sync_to_env();
    this.update_visuals();
};

SensorLight.prototype.update = function (sensors, devices) {
    this.sync_to_env();
    this.update_visuals();
};

SensorLight.prototype.valueDirection = function () {
    if(this.elightPrev === this.elight)
        return 0;
    else if(this.elightPrev < this.elight)
        return 1;
    return -1;
};

SensorLight.prototype.value = function () {
    return this.elight;
};

// private 
SensorLight.prototype.update_visuals = function () {
    // value
    var opacity = 0,
        value = this.value();
    if(value < this.eLightMinValueOn) {
        opacity = 1 - (value - this.eLightMin)/(this.eLightMinValueOn - this.eLightMin);
        setComponentOpacity("SensorLightOn", 1); 
        setComponentOpacity("SensorLightOff", 0); 
    }
    else{
        setComponentOpacity("SensorLightOn", 0); 
        setComponentOpacity("SensorLightOff", 1); 
    }
    setComponentOpacity("SensorLightLevel", opacity); 
};

// private 
SensorLight.prototype.sync_to_env = function (){
    this.elightPrev = this.elight;
    this.elight = Environment.get("Sunlight");
    if(this.elight < this.eLightMin)
        this.elight = this.eLightMin;
    if(this.elight > this.eLightMax)
        this.elight = this.eLightMax;
};

