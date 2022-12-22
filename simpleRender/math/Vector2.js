class Vector2{
    constructor(o = 0, y = 0){
        this.x = o.x || o;
        this.y = o.y || y || o;
        this.who = "Vector2";
    }

    Add(other = 0){
        if(other.x){
            return new Vector2(this.x + other.x, this.y + other.y);
        }
        return new Vector2(this.x + other, this.y + other);
    }

    Sub(other = 0) {
        if (other.x) {
            return new Vector2(this.x - other.x, this.y - other.y);
        }
        return new Vector2(this.x - other, this.y - other);
    }

    Mul(other = 0) {
        if (other.x) {
            return new Vector2(this.x * other.x, this.y * other.y);
        }
        return new Vector2(this.x * other, this.y * other);
    }
    
    Div(other = 0) {
        if (other.x) {
            return new Vector2(this.x / other.x, this.y / other.y);
        }
        return new Vector2(this.x / other, this.y / other);
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
        return new Vector2(this.x * -1, this.y * -1);
    }

    Set(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    Clone(){
        return new Vector2(this.x, this.y);
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
    
    Dot(other){
        return this.x * other.x + this.y * other.y;
    }

    Middle(other){
        var nx = (this.x + other.x) / 2;
        var ny = (this.y + other.y) / 2;
        return new Vector2(nx, ny);
    }

    Lerp(other, ratio){
        //var nx = Mathf.Lerp(this.x, other.x, ratio);
       // var ny = Mathf.Lerp(this.y, other.y, ratio);
       // return new Vector2(nx, ny);
    }

    Min(other){
        //var nx = Mathf.lower(this.x, other.x);
        //var ny = Mathf.lower(this.y, other.y);
       // return new Vector2(nx, ny);
    }

    Max(other) {
        //var nx = Mathf.greater(this.x, other.x);
        //var ny = Mathf.greater(this.y, other.y);
        // return new Vector2(nx, ny);
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
        return new Vector2(x / distance * maxDelta, y / distance * maxDelta);
    }

    Vector3(){
        if(window["Vector3"]){
            return new Vector3(this.x, this.y, 0);
        }
    }

    Vector4(){
        if (window["Vector4"]) {
            return new Vector4(this.x, this.y, 0, 1);
        }
    }

    FromVector4(other){
        if(window["Vector4"]){
            this.x = other.x;
            this.y = other.y;
        }
    }

    FromVector3(other) {
        if (window["Vector3"]) {
            this.x = other.x;
            this.y = other.y;
        }
    }


    ToString(){
        return `Vector3 (${this.x}, ${this.y})`;
    }

    Print(){
        console.debug(this.ToString());
    }


    static Up() { return new Vector2(0, 1); }
    static Down() { return new Vector2(0, -1); }
    static Left() { return new Vector2(-1, 0); }
    static Right() { return new Vector2(1, 0); }
    static One() { return new Vector2(1); }
    static Zero() { return new Vector2(); }

    static Dot(a, b){ return a.Dot(b);}
}