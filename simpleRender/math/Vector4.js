class Vector4{
    constructor(o = 0, y = 0, z = 0, w = 0){
        this.x = o.x || o;
        this.y = o.y || y || o;
        this.z = o.z || z || o;
        this.w = o.w || w || o;
        this.who = "Vector4";
    }

    Add(other = 0){
        if(other.x){
            return new Vector4(this.x + other.x, this.y + other.y, this.z + other.z);
        }
        return new Vector4(this.x + other, this.y + other, this.z + other);
    }

    Sub(other = 0) {
        if (other.x) {
            return new Vector4(this.x - other.x, this.y - other.y, this.z - other.z);
        }
        return new Vector4(this.x - other, this.y - other, this.z - other);
    }

    Mul(other = 0) {
        if (other.x) {
            return new Vector4(this.x * other.x, this.y * other.y, this.z * other.z);
        }
        return new Vector4(this.x * other, this.y * other, this.z * other);
    }
    
    Div(other = 0) {
        if (other.x) {
            return new Vector4(this.x / other.x, this.y / other.y, this.z / other.z);
        }
        return new Vector4(this.x / other, this.y / other, this.z / other);
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
        return new Vector4(this.x * -1, this.y * -1, this.z * -1);
    }

    Set(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    Clone(){
        return new Vector4(this.x, this.y, this.z);
    }

    SqrMagnitude(){
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }

    Magnitude(){
        return Math.sqrt(this.SqrMagnitude());
    }

    Normalize(){
        var mag = this.Magnitude();
        this.x /= mag;
        this.y /= mag;
        this.z /= mag;
        this.w /= mag;
    }

    Normalized(){
        var clone = this.Clone();
        clone.Normalize();
        return clone;
    }

    Dot(other){
        return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
    }

    Middle(other){
        var nx = (this.x + other.x) / 2;
        var ny = (this.y + other.y) / 2;
        var nz = (this.z + other.z) / 2;
        var nw = (this.w + other.w) / 2;
        return new Vector4(nx, ny, nz, nw);
    }

    Lerp(other, ratio){
        var nx = Mathf.Lerp(this.x, other.x, ratio);
        var ny = Mathf.Lerp(this.y, other.y, ratio);
        var nz = Mathf.Lerp(this.z, other.z, ratio);
        var nw = Mathf.Lerp(this.w, other.w, ratio);
        return new Vector4(nx, ny, nz, nw);
    }

    Min(other){
        var nx = Mathf.lower(this.x, other.x);
        var ny = Mathf.lower(this.y, other.y);
        var nz = Mathf.lower(this.z, other.z);
        var nw = Mathf.lower(this.w, other.w);
        return new Vector4(nx, ny, nz, nw);
    }

    Max(other) {
        var nx = Mathf.greater(this.x, other.x);
        var ny = Mathf.greater(this.y, other.y);
        var nz = Mathf.greater(this.z, other.z);
        var nw = Mathf.greater(this.w, other.w);
         return new Vector4(nx, ny, nz, nw);
    }

    Distance(other){
        let vecTemp = this.Sub(other);
        return vecTemp.Magnitude();
    }

    Project(other){
        let n = other.Normalized();
        let dot = this.Dot(n);
        return n.Mul(dot);
    }

    MoveTowards(other, maxDelta){
        let distance = this.Distance(other);
        if(distance < maxDelta){
            return other.Clone();    
        }
        let x = other.x - this.x;
        let y = other.y - this.y;
        let z = other.z - this.z;
        let w = other.w - this.w;
        return new Vector4(x / distance * maxDelta, y / distance * maxDelta, z / distance * maxDelta, w / distance * maxDelta);
    }

    Vector3(){
        if(window["Vector3"]){
            return new Vector3(this.x, this.y, this.z);
        }
    }

    Vector2(){
        if (window["Vector2"]) {
            return new Vector2(this.x, this.y);
        }
    }

    FromVector3(other){
        if(window["Vector3"]){
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            this.w = 0;
        }
    }

    FromVector2(other) {
        if (window["Vector2"]) {
            this.x = other.x;
            this.y = other.y;
            this.z = 0;
            this.w = 0;
        }
    }


    ToString(){
        return `Vector4 (${this.x}, ${this.y}, ${this.z}, ${this.w})`;
    }

    Print(){
        console.debug(this.ToString());
    }

    static One() { return new Vector4(1); }
    static Zero() { return new Vector4(); }

    static Dot(a, b){ return a.Dot(b);}
}