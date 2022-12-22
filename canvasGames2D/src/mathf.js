
Mathf = Math;

Mathf.epsilon = .0001;

Mathf.deg2Rad =(degrees) =>{
  return degrees * (Mathf.PI / 180);
}

Mathf.rad2Deg = (radians) =>{
  return radians * (180 / Mathf.PI);
}

Mathf.clamp = (num, min, max) => Math.min(Math.max(num, min), max);

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