class Vector3{
    constructor(o = 0, y = 0, z = 0){
        this.x = o.x ?? o;
        this.y = o.y ?? y ?? o;
        this.z = o.z ?? z ?? o;
        this.who = "Vector3";
    }

    Add(other = 0){
        if(typeof(other.x)==='number'){
            return new Vector3(this.x + other.x, this.y + other.y, this.z + other.z);
        }
        return new Vector3(this.x + other, this.y + other, this.z + other);
    }

    Sub(other = 0) {
        if (typeof (other.x) === 'number') {
            return new Vector3(this.x - other.x, this.y - other.y, this.z - other.z);
        }
        return new Vector3(this.x - other, this.y - other, this.z - other);
    }

    Mul(other = 0) {
        if (typeof(other.x)==='number') {
            return new Vector3(this.x * other.x, this.y * other.y, this.z * other.z);
        }
        return new Vector3(this.x * other, this.y * other, this.z * other);
    }
    
    Div(other = 0) {
        if (typeof(other.x)==='number') {
            return new Vector3(this.x / other.x, this.y / other.y, this.z / other.z);
        }
        return new Vector3(this.x / other, this.y / other, this.z / other);
    }

    Equals(other){
        let sub = this.Sub(other);
        let delta = sub.SqrMagnitude(); 
        if(delta < .001){
            return true;
        }
        return false;
    }

    Invert(){
        return new Vector3(this.x * -1, this.y * -1, this.z * -1);
    }

    SetTuple(tuple = [0,0,0]){
        this.x = tuple[0];
        this.y = tuple[1];
        this.z = tuple[2];
    }

    Set(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    Clone(){
        return new Vector3(this.x, this.y, this.z);
    }

    SqrMagnitude(){
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    Magnitude(){
        return Math.sqrt(this.SqrMagnitude());
    }

    Normalize(){
        var mag = this.Magnitude();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
    }

    Normalized(){
        var clone = this.Clone();
        clone.Normalize();
        return clone;
    }

    Cross(rhs){
        var nx = this.y * rhs.z - this.z * rhs.y;
        var ny = this.z * rhs.x - this.x * rhs.z;
        var nz = this.x * rhs.y - this.y * rhs.x;
        return new Vector3(nx, ny, nz);
    }
    
    Dot(other){
        return this.x * other.x + this.y * other.y + this.z * other.z;
    }

    Middle(other){
        var nx = (this.x + other.x) / 2;
        var ny = (this.y + other.y) / 2;
        var nz = (this.z + other.z) / 2;
        return new Vector3(nx, ny, nz);
    }

    Lerp(other, ratio){
        //var nx = Mathf.Lerp(this.x, other.x, ratio);
       // var ny = Mathf.Lerp(this.y, other.y, ratio);
        //var nz = Mathf.Lerp(this.z, other.z, ratio);
       // return new Vector3(nx, ny, nz);
    }

    Min(other){
        //var nx = Mathf.lower(this.x, other.x);
        //var ny = Mathf.lower(this.y, other.y);
        //var nz = Mathf.lower(this.z, other.z);
       // return new Vector3(nx, ny, nz);
    }

    Max(other) {
        //var nx = Mathf.greater(this.x, other.x);
        //var ny = Mathf.greater(this.y, other.y);
        //var nz = Mathf.greater(this.z, other.z);
        // return new Vector3(nx, ny, nz);
    }

    Distance(other){
        let vecTemp = this.Sub(other);
        return vecTemp.Magnitude();
    }

    Angle(other){
        let cross = this.Cross(other);
        let up = Vector3.Up();
        let dot = up.Dot(cross);
        let rv = Mathf.acos(this.Dot(other) / this.Magnitude() * other.Magnitude());
        if(dot < 0){ return rv * -1;}
        return rv;
    }

    Project(other){
        let n = other.Normalized();
        let dot = this.Dot(n);
        return n.Mul(dot);
    }

    Reflect(other){
        let n = other.Normalized();
        let dot = this.Dot(n) * -2;
        n = n.Mul(dot);
        return this.Add(n);
    }

    MoveTowards(other, maxDelta){
        let distance = this.Distance(other);
        if(distance < maxDelta){
            return other.Clone();    
        }
        let x = other.x - this.x;
        let y = other.y - this.y;
        let z = other.z - this.z;
        return new Vector3(x / distance * maxDelta, y / distance * maxDelta, z / distance * maxDelta);
    }

    Vector4(){
        if(window["Vector4"]){
            return new Vector4(this.x, this.y, this.z, 0);
        }
    }

    Vector2(){
        if (window["Vector2"]) {
            return new Vector2(this.x, this.y);
        }
    }

    FromVector4(other){
        if(window["Vector4"]){
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
        }
    }

    FromVector2(other) {
        if (window["Vector2"]) {
            this.x = other.x;
            this.y = other.y;
            this.z = 0;
        }
    }


    ToString(){
        return `Vector3 (${this.x}, ${this.y}, ${this.z})`;
    }

    Print(){
        console.debug(this.ToString());
    }


    static Up() { return new Vector3(0, 1, 0); }
    static Down() { return new Vector3(0, -1, 0); }
    static Left() { return new Vector3(-1, 0, 0); }
    static Right() { return new Vector3(1, 0, 0); }
    static Forward() { return new Vector3(0, 0, 1); }
    static Back() { return new Vector3(0, 0, -1); }
    static One() { return new Vector3(1); }
    static Zero() { return new Vector3(); }

    static Cross(a, b){ return a.Cross(b);}
    static Dot(a, b){ return a.Dot(b);}
}