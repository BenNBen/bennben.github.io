// quaternion matrix math

function Quaternion(x, y, z, w){
    x = x || 0;
    y = y || 0;
    z = z || 0;
    w = w || 1;
    this.identity = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    this[0] = x; //x
    this[1] = y; //y
    this[2] = z; //z
    this[3] = w; //w
    this.epsilon = .00001;
}

Quaternion.prototype.eulerAngles = function(){

}

Quaternion.prototype.normalized = function(){

}

function multiplyQuaternion(m1, m2){
    var x = m1.w * m2.x + m1.x * m2.w + m1.y * m2.z - m1.z * m2.y;
    var y = m1.w * m2.y + m1.y * m2.w + m1.z * m2.x - m1.x * m2.z;
    var z = m1.w * m2.z + m1.z * m2.w + m1.x * m2.y - m1.y * m2.x;
    var w = m1.w * m2.w - m1.x * m2.x - m1.y * m2.y - m1.z * m2.z;
    return new Quaternion(x, y, z, w);
}