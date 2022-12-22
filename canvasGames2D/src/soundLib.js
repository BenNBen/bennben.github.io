

audioCTX = new AudioContext();

const playSound = (freq = 1109, soundType="sine") =>{
    var context = audioCTX;
    var o = context.createOscillator()
    var frequency = freq;
    o.type = soundType;
    o.frequency.value = frequency;
    var g = context.createGain()
    g.gain.value = 0.05;
    o.connect(g)
    g.connect(context.destination)
    o.start(0)
    g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + .5)
}

const playBackground = () =>{
    var context = new AudioContext()
    var o = context.createOscillator()
    var g = context.createGain()
    o.connect(g)
    g.connect(context.destination)
    o.start(0)
}