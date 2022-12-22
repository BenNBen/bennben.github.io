
class Quaternion{
    constructor(o, y, z, w){
        this.x = o || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
        this.who = "Quaternion";
        this.eulerAngles = [0,0,0];
    }

    Mul(other){
        var nx = this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y;
        var ny = this.w * other.y + this.y * other.w + this.z * other.x - this.x * other.z;
        var nz = this.w * other.z + this.z * other.w + this.x * other.y - this.y * other.x;
        var nw = this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z;
        return new Quaternion(nx, ny, nz, nw);
    }

    Set(nx, ny, nz) {
        this.x = nx; this.y = ny; this.z = nz;
        this.w = 1;
    }

    SetByIndex(index, val){
        switch(index){
            case 0:
                this.x = val;
                break;
            case 1:
                this.y = val;
                break;
            case 2:
                this.z = val;
                break;
        }
    }

    Inverse(){
        this.x *= -1;
        this.y *= -1;
        this.z *= -1;
    }

    Clone(){
        return new Quaternion(this.x, this.y, this.z, this.w);
    }

    LerpUnclamped(rhs, ratio){
        let q = new Quaternion();
        if(this.Dot(rhs) < 0){
            q.x = this.x + ratio * (-rhs.x - this.x);
            q.y = this.y + ratio * (-rhs.y - this.y);
            q.z = this.z + ratio * (-rhs.z - this.z);
            q.w = this.w + ratio * (-rhs.w - this.w);   
        }else{
            q.x = this.x + (rhs.x - this.x) * ratio;
            q.y = this.y + (rhs.y - this.y) * ratio;
            q.z = this.z + (rhs.z - this.z) * ratio;
            q.w = this.w + (rhs.w - this.w) * ratio;
        }
        q.Normalize();
        return q;
    }

    Lerp(rhs, ratio){
        return this.LerpUnclamped(rhs, Mathf.Clamp01(ratio));
    }

    SlerpUnclamped(rhs, ratio){
        var cosAngle = this.Dot(rhs);
        let other = rhs.Clone();
        if(cosAngle < 0){
            cosAngle *= -1;
            other = new Quaternion(-rhs.x, -rhs.y, -rhs.z, -rhs.w);
        }
        let ratio1, ratio2;
        if(cosAngle < .95){
            let angle = Mathf.acos(cosAngle);
            let sinAngle = Mathf.sin(angle);
            let invSinAngle = 1 / sinAngle;
            ratio1 = Mathf.sin((1-ratio) * angle) * invSinAngle;
            ratio2 = Mathf.sin(ratio * angle) * invSinAngle;
            let x = this.x;
            let y = this.y;
            let z = this.z;
            let w = this.w
            return new Quaternion(x * ratio1 + other.x * ratio2, y * ratio1 + other.y * ratio2, z * ratio1 + other.z * ratio2, w * ratio1 + other.w * ratio2);
        }else{
            this.Lerp(other, ratio);
        }
        return this.Clone();
    }

    Slerp(rhs, ratio){
        return this.SlerpUnclamped(rhs, Mathf.Clamp01(ratio));
    }

    Identity(){
        this.x = 0; this.y = 0; this.z = 0; this.w = 1;
    }

    GetEuler(){
        return this.eulerAngles;
    }

    SimpleSetEuler(rx, ry, rz){ // private class function
        this.eulerAngles = [rx, ry, rz];
    }

    SetEuler(rx, ry, rz){
        this.SimpleSetEuler(rx, ry, rz);
        var halfDeg2Rad = 0.5 * Mathf.Deg2Rad(1);
        rx *= halfDeg2Rad;
        ry *= halfDeg2Rad;
        rz *= halfDeg2Rad;

        var sinx = Mathf.sin(rx);
        var cosx = Mathf.cos(rx);
        var siny = Mathf.sin(ry);
        var cosy = Mathf.cos(ry);
        var sinz = Mathf.sin(rz);
        var cosz = Mathf.cos(rz);
        this.w = cosy * cosx * cosz + siny * sinx * sinz;
        this.x = cosy * sinx * cosz + siny * cosx * sinz;
        this.y = siny * cosx * cosz - cosy * sinx * sinz;
        this.z = cosy * cosx * sinz - siny * sinx * cosz;
    }

    CleanEulerValues(euler){
        var negativeFlip = -.0001;
        var two_pi = Mathf.PI * 2;
        var positiveFlip = two_pi - .0001;

        for(var i =0;i<3;i++){
            if(euler[i] < negativeFlip){
                euler[i] += two_pi;
            }else if (euler[i] > positiveFlip) {
                euler[i] -= two_pi;
            }
        }
    }

    CalculateEulerAngles(){
        var x = this.x;
        var y = this.y;
        var z = this.z;
        var w = this.w;
        var check = 2 * (this.y * this.z - this.w * this.x);
        var values = [0, 0, 0];
        if (check < 0.999) {
            if (check > -0.999) {
                values[0] = -1 * Mathf.asin(check);
                values[1] = Mathf.atan2(2 * (x * z + w * y), 1 - 2 * (x * x + y * y));
                values[2] = Mathf.atan2(2 * (x * y + w * z), 1 - 2 * (x * x + z * z));
            } else {
                values[0] = (Mathf.PI * .05);
                values[1] = Mathf.atan2(2 * (x * y - w * z), 1 - 2 * (y * y + z * z));
                values[2] = 0;
            }
        } else {
            values[0] = -1 * (Mathf.PI * .05);
            values[1] = Mathf.atan2(-2 * (x * y - w * z), 1 - 2 * (y * y + z * z));
            values[2] = 0;
        }
        this.CleanEulerValues(values);
        values[0] *= Mathf.Rad2Deg(1);
        values[1] *= Mathf.Rad2Deg(1);
        values[2] *= Mathf.Rad2Deg(1);
        this.SimpleSetEuler(values[0], values[1], values[2]);
    }

    Dot(rhs){
        return this.x * rhs.x + this.y * rhs.y + this.z * rhs.z + this.w * rhs.w;
    }

    Angle(rhs){
        var radiansInDegrees = 57.29578;
        var dot = this.Dot(rhs);
        if(dot < 0) dot *= -1;
        return Mathf.acos(Mathf.lower(dot, 1)) * 2 * radiansInDegrees;
    }

    Normalize(){
        var n = this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        if(Mathf.Approximately(n, 1) == false && n > 0){
            n = 1 / Mathf.sqrt(n);
            this.x *= n;
            this.y *= n;
            this.z *= n;
            this.w *= n;
        }
    }

    FromMatrix(mat){
        var trace = mat[0][0] + mat[1][1] + mat[2][2];

        if(trace > 0){
            var s = Mathf.sqrt(trace + 1);
            this.w = 0.5 * s;
            s = 0.5 /s;
            this.x = (mat[2][1] - mat[1][2]) * s;
            this.y = (mat[0][2] - mat[2][0]) * s;
            this.z = (mat[1][0] - mat[0][1]) * s;
            this.Normalize();
        }else{
            var i =0;
            var next = [1,2,0];
            if (mat[1][1] > mat[0][0]) i = 1;
            if (mat[2][2] > mat[i][i]) i = 2;
            var j = next[i];
            var k = next[j];

            var t = mat[i][i] - mat[j][j] - mat[k][k] + 1;
            var s = 0.5 / Mathf.sqrt(t);
            this.SetByIndex(i, s * t);
            this.w = (mat[k][j] - mat[j][k]) * s;
            this.SetByIndex(j, (mat[j][i] + mat[i][j]) * s);
            this.SetByIndex(k, (mat[k][i] + mat[i][k]) * s);
            this.Normalize();
        }
    }

    FromToRotation(from, to){
        if(window["Vector3"]){
            from.Normalize();
            to.Normalize();

            var dot = from.Dot(to);
            if(dot > 1 - 1e-6){
                this.Identity();
            }else if(dot < -1 - 1e-6){
                var left = [0, from.z, from.y];
                var mag = left[1] * left[1] + left[2] * left[2];

                if(mag < 1e-6){
                    left[0] = -1 * from.z;
                    left[1] = 0;
                    left[2] = from.x;
                    mag = left[0] * left[0] + left[2] * left[2];
                }

                var invlen = 1 / Mathf.sqrt(mag);
                left[0] *= invlen;
                left[1] *= invlen;
                left[2] *= invlen;

                var up = [0,0,0];
                up[0] = left[1] * from.z - left[2] * from.y;
                up[1] = left[2] * from.x - left[0] * from.z;
                up[2] = left[0] * from.y - left[1] * from.x;

                var fxx = -1 * from.x * from.x;
                var fyy = -1 * from.y * from.y;
                var fzz = -1 * from.z * from.z;
                var fxy = -1 * from.x * from.y;
                var fxz = -1 * from.x * from.z;
                var fyz = -1 * from.y * from.z;
                var uxx = up[0] * up[0];
                var uyy = up[1] * up[1];
                var uzz = up[2] * up[2];
                var uxy = up[0] * up[1];
                var uxz = up[0] * up[2];
                var uyz = up[1] * up[2];

                var lxx = -left[0] * left[0];
                var lyy = -left[1] * left[1];
                var lzz = -left[2] * left[2];
                var lxy = -left[0] * left[1];
                var lxz = -left[0] * left[2];
                var lyz = -left[1] * left[2];

                var mat3x3 = [
                    [fxx + uxx + lxx, fxy + uxy + lxy, fxz + uxz + lxz],
                    [fxy + uxy + lxy, fyy + uyy + lyy, fyz + uyz + lyz],
                    [fxz + uxz + lxz, fyz + uyz + lyz, fzz + uzz + lzz]
                ];
                this.FromMatrix(mat3x3);
            }else{
                let v = from.Cross(t);
                var h = (1- dot) / v.Dot(v);

                var hx = h * v.x;
                var hz = h * v.z;
                var hxy = hx * v.y;
                var hxz = hx * v.z;
                var hyz = hz * v.y;

                var mat3x3 = [
                    [dot + hx * v.x, hxy - v.z, hxz + v.y],
                    [hxy + v.z, dot + h * v.y * v.y, hyz - v.x],
                    [hxz - v.y, hyz + v.x, dot + hz * v.z]
                ];
                this.FromMatrix(mat3x3);
            }
        }
    }

    LookRotation(forward, up){
        if(window["Vector3"]){
            var x = this.x;
            var y = this.y;
            var z = this.z;
            var w = this.w;
            var mag = forward.Magnitude();
            if(mag > 1e-6){
                forward = forward.Div(mag);
                let right = up.Cross(forward);
                right.Normalize();
                up = forward.Cross(right);
                right = up.Cross(forward);

                var t = right.x + up.y + forward.z;
                if(t > 0){
                    t++;
                    s = 0.5 / Mathf.sqrt(t);
                    this.w = s * t;
                    this.x = (up.z - forward.y) * s;
                    this.y = (forward.x - right.z) * s;
                    this.z = (right.y - up.x) * s;
                    this.Normalize();
                }else{
                    var mat = [
                        [right.x, up.x, forward.x],
                        [right.y, up.y, forward.y],
                        [right.z, up.z, forward.z]
                    ];
                    var i =0;
                    if(up.y > right.y) i =1;
                    if(forward.z > mat[i][i]) i =2;

                    var next = [1,2,0];
                    var j = next[i];
                    var k = next[j];
                    this.SetByIndex(i, s * t);
                    this.w = (mat[k][k] - mat[j][k]) * s;
                    this.SetByIndex(j, (mat[j][i] + mat[i][j]) * s);
                    this.SetByIndex(k, (mat[k][i] + mat[i][k]) * s);
                    this.Normalize();
                }
            }
        }
    }

    RotateTowards(rhs, maxDelta){
        var out = new Quaternion();
        var angle = this.Angle(rhs, maxDelta);
        if(Mathf.Approximately(angle, 0)){
            return rhs.Clone();
        }
        var ratio = Mathf.lower(1, maxDelta/angle);
        return this.SlerpUnclamped(rhs, ratio);
    }

}
