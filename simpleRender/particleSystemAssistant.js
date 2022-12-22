i = 0;
function updateParticleSystemEmitters(){
    i++;
    postMessage(i)
  /*var ps = self.particleSystem;
  debugger;
  var eLen = ps.effects.length;
  for (var i = 0; i < eLen; i++) {
      updateEffect(ps.effects[i])
  }*/
  setInterval(updateParticleSystemEmitters, 1000);
}

function updateEmitter(effect){
    var ps = self.particleSystem;
    var time = self.performance.now() / 1000;
    if (effect.startTime === false) {
        effect.startTime = time;
    }
    var clockTime = 0;
    if (ps.paused === false) {
        clockTime = time - effect.startTime;
    } else { //clockTime should not change if currently paused
        var wouldHaveBeen = time - effect.startTime;
        clockTime = effect.lastTime;
        var diff = wouldHaveBeen - clockTime;
        effect.startTime += diff;
    }
    clockTime = clockTime;
    var eLen = effect.emitters.length;
    for (var i = 0; i < eLen; i++) {
        if (effect.emitters[i].hidden === false) { //only update and draw if the emitters are visible
            if (effect.emitters[i].type === "cpu") {
             effect.emitters[i].updateParticles(clockTime);
            }
        }
    }
}

self.addEventListener("message", function(e){
    console.log("MESSAGE", e)
    debugger;
});
