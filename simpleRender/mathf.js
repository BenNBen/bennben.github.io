
Mathf = Math;

Mathf.epsilon = .0001;

Mathf.Deg2Rad =(degrees) =>{
    return degrees * (Mathf.PI / 180);
}

Mathf.Rad2Deg = (radians) =>{
    return radians * (180 / Mathf.PI);
}

Mathf.clamp = (num, min=0, max=1) => Math.min(Math.max(num, min), max);

Mathf.rotatePositions2D = (pos, degrees, pivot) => {
    var angle = Mathf.deg2Rad(degrees);
    var newPos = [];
    var len = pos.length;
    for(var i =0;i<len;i+=2){
      var xshift = pos[i] - pivot[0];
      var yshift = pos[i+1] - pivot[1];
      newPos[i] = pivot[0] + (xshift * Mathf.cos(angle) - yshift * Mathf.sin(angle));
      newPos[i+1] = pivot[1] + (xshift * Mathf.sin(angle) + yshift * Mathf.cos(angle));
    }
    return newPos;
}

Mathf.Approximately = (lhs, rhs) => {
    var diff = lhs - rhs;
    if(diff <= Mathf.epsilon) return true;
    return false;
}

Mathf.colorFromDec = (dec = [1,1,1,1]) =>{
    let color = {};
    color.dec = dec;
    color.rgba = [Math.floor(dec[0]), Math.floor(dec[1]), Math.floor(dec[2]), dec[3]];
    return color;
}

Mathf.closestPowerOfTwo = (value) =>{
    let next = 1;
    while (next <= value)
    {
        next <<= 1;
    }
    let prev = next / 2;
    let nDiff = next - value;
    let pDiff = value - prev;
    let closest = next;
    if (nDiff > pDiff)
    {
        closest = prev;
    }
    return closest;
}

Mathf.nextPowerOfTwo = (value) =>{
    let next = 1;
    while (next <= value) {
        next <<= 1;
    }
    return next;
}

Mathf.lerp = (lhs, rhs, ratio) =>{
    return lhs * (1.0 - ratio) + rhs * ratio;
}

Mathf.lower = (lhs, rhs) =>{
    if (lhs <= rhs) {
        return lhs;
    }
    return rhs;
}

Mathf.greater = (lhs, rhs) =>{
    if (lhs >= rhs) {
        return lhs;
    }
    return rhs;
}