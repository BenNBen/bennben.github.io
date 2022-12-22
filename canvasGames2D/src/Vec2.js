class Vec2 { 
    constructor(o =0, y = 0){
        this.x = o.x ?? o[0] ?? o ?? 0;
        this.y = o.y ?? o[1] ?? y ?? 0;
    }

    Add(other = Vec2(0,0)){
        this.x += other.x;
        this.y += other.y;
    }

    Sub(other = Vec2(0,0)){
        this.x -= other.x;
        this.y -= other.y;
    }

    Div(divisor){
        this.x /= divisor;
        this.y /= divisor;
    }

    Magnitude(){
        return Mathf.sqrt(this.x * this.x + this.y * this.y);
    }

    Normalize(){
        var mag = this.Magnitude();
        this.Div(mag);
    }

    FindDirection(other = Vec2(0,0)){
        this.Sub(other);
        this.Normalize();
    }

    Dot(other){
        return this.x * other.x + this.y * other.y;
    }
}