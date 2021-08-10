var Timer = function() {
    this.started = (new Date()).getTime();    
}

Timer.prototype.elapsed = function(){
    return (new Date()).getTime() - this.started;
}