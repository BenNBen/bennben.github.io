
class Matrix4x4 {
    constructor(o = Array(16).fill(0)){
        this.who = "Matrix4x4";
        this.data = new Float32Array(o);
    }

    Mul(other){
        let m = Array(16).fill(0);
        let data = this.data;
        let v1 = other.data[0];
        let v2 = other.data[1];
        let v3 = other.data[2];
        let v4 = other.data[3];

        m[0] = data[0] * v1 + data[4] * v2 + data[8] * v3 + data[12] * v4;
        m[1] = data[1] * v1 + data[5] * v2 + data[9] * v3 + data[13] * v4;
        m[2] = data[2] * v1 + data[6] * v2 + data[10] * v3 + data[14] * v4;
        m[3] = data[3] * v1 + data[7] * v2 + data[11] * v3 + data[15] * v4;        

        v1 = other.data[4];
        v2 = other.data[5];
        v3 = other.data[6];
        v4 = other.data[7];

        m[4] = data[0] * v1 + data[4] * v2 + data[8] * v3 + data[12] * v4;
        m[5] = data[1] * v1 + data[5] * v2 + data[9] * v3 + data[13] * v4;
        m[6] = data[2] * v1 + data[6] * v2 + data[10] * v3 + data[14] * v4;
        m[7] = data[3] * v1 + data[7] * v2 + data[11] * v3 + data[15] * v4;

        v1 = other.data[8];
        v2 = other.data[9];
        v3 = other.data[10];
        v4 = other.data[11];

        m[8] = data[0] * v1 + data[4] * v2 + data[8] * v3 + data[12] * v4;
        m[9] = data[1] * v1 + data[5] * v2 + data[9] * v3 + data[13] * v4;
        m[10] = data[2] * v1 + data[6] * v2 + data[10] * v3 + data[14] * v4;
        m[11] = data[3] * v1 + data[7] * v2 + data[11] * v3 + data[15] * v4;

        v1 = other.data[12];
        v2 = other.data[13];
        v3 = other.data[14];
        v4 = other.data[15];

        m[12] = data[0] * v1 + data[4] * v2 + data[8] * v3 + data[12] * v4;
        m[13] = data[1] * v1 + data[5] * v2 + data[9] * v3 + data[13] * v4;
        m[14] = data[2] * v1 + data[6] * v2 + data[10] * v3 + data[14] * v4;
        m[15] = data[3] * v1 + data[7] * v2 + data[11] * v3 + data[15] * v4;

        return new Matrix4x4(m);
    }

    Determinant(){
        data = this.data;
        var det = data[0] * (data[10] * data[5] - data[9] * data[6]) - data[4] * (data[10] * data[1] - data[9] * data[2]) + data[8] * (data[6] * data[1] - data[5] * data[2]);
        return det;
    }

    GetColumn(index){
        if(index < 0 || index > 15){
            return;
        }
        if(window["Vector4"]){
            return new Vector4(this.data[index], this.data[index+4], this.data[index+8], this.data[index+12]);
        }
    }

    GetRow(index){
        if (index < 0 || index > 15) {
            return;
        }
        if (window["Vector4"]) {
            let rindex = index *4;
            return new Vector4(this.data[rindex], this.data[rindex + 1], this.data[rindex + 2], this.data[rindex + 3]);
        }
    }

    GetPosition(){
        if(window["Vector3"]){
            return new Vector3(this.data[12], this.data[13], this.data[14]);
        }
    }

    SetColumn(v, index){
        if (index < 0 || index > 15) {
            return;
        }
        if(window["Vector4"]){
            this.data[index] = v.x;
            this.data[index+4] = v.y;
            this.data[index+8] = v.z;
            this.data[index+12] = v.w;
        }
    }

    SetRow(v, index) {
        if (index < 0 || index > 15) {
            return;
        }
        if (window["Vector4"]) {
            this.data[index] = v.x;
            this.data[index + 1] = v.y;
            this.data[index + 2] = v.z;
            this.data[index + 3] = v.w;
        }
    }

    Set(other){
        this.data = other.data;
    }

    DisplaceMatrix(v = new Vector3(0,0,0)){
        this.data[12] = v.x;
        this.data[13] = v.y;
        this.data[14] = v.z;
    }

    TranslationMatrix(v){
        this.Identity();
        this.data[12] = v.x;
        this.data[13] = v.y;
        this.data[14] = v.z;
    }

    ScaleMatrix(v){
        this.Identity();
        this.data[0] = v.x;
        this.data[5] = v.y;
        this.data[10] = v.z;
    }

    RotationMatrix(q){
        let x = q.x;
        let y = q.y;
        let z = q.z;
        let w = q.w;
        this.data[0] = 1.0 - 2.0 * (y * y + z * z);
        this.data[1] = 2.0 * (x * y + z * w);
        this.data[2] = 2.0 * (x * z - y * w);
        this.data[3] = 0.0;
        this.data[4] = 2.0 * (x * y - z * w);
        this.data[5] = 1.0 - 2.0 * (x * x + z * z);
        this.data[6] = 2.0 * (z * y + x * w);
        this.data[7] = 0.0;
        this.data[8] = 2.0 * (x * z + y * w);
        this.data[9] = 2.0 * (y * z - x * w);
        this.data[10] = 1.0 - 2.0 * (x * x + y * y);
        this.data[11] = 0.0;
        this.data[12] = 0.0;
        this.data[13] = 0.0;
        this.data[14] = 0.0;
        this.data[15] = 1.0;
    }

    Ortho(left, right, bottom, top, zNear, zFar) {
        this.data[0] = 2 / (right - left);
        this.data[4] = 0;
        this.data[8] = 0;
        this.data[12] = -(right + left) / (right - left);

        this.data[1] = 0;
        this.data[5] = 2 / (top - bottom);
        this.data[9] = 0;
        this.data[13] = -(top + bottom) / (top - bottom);

        this.data[2] = 0;
        this.data[6] = 0;
        this.data[10] = -2 / (zFar - zNear);
        this.data[14] = -(zFar + zNear) / (zFar - zNear);

        this.data[3] = 0;
        this.data[7] = 0;
        this.data[11] = 0;
        this.data[15] = 1;
    }

    Perspective(fovy, aspect, zNear, zFar){
        var ymax = zNear * tan(fovy * Math.PI / 360);
        var ymin = -ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        var A = (xmax + xmin) / (xmax - xmin);
        var B = (ymax + ymin) / (ymax - ymin);
        var C = -(zFar + zNear) / (zFar - zNear);
        var D = -2 * (zFar * zNear) / (zFar - zNear);
        var E = 2 * zNear / (xmax - xmin);
        var F = 2 * zNear / (ymax - ymin);

        this.data[0] = E;
        this.data[1] = 0;
        this.data[2] = A;
        this.data[3] = 0;

        this.data[4] = 0;
        this.data[5] = F;
        this.data[6] = B;
        this.data[7] = 0;

        this.data[8] = 0;
        this.data[9] = 0;
        this.data[10] = C;
        this.data[11] = -1;

        this.data[12] = 0;
        this.data[13] = 0;
        this.data[14] = D;
        this.data[15] = 0;
    }

    LookAt(from, to, up){
        let forward = to.Sub(from);
        forward.Normalize();
        let side = forward.Sub(up);
        side.Normalize();
        let upVec = Vector3.Cross(side, forward);

        this.data[0] = side.x;
        this.data[4] = side.y;
        this.data[8] = side.z;
        this.data[12] = 0;

        this.data[1] = upVec.x;
        this.data[5] = upVec.y;
        this.data[9] = upVec.z;
        this.data[13] = 0;

        this.data[2] = -forward.x;
        this.data[6] = -forward.y;
        this.data[10] = -forward.z;
        this.data[14] = 0;

        this.data[3] = 0;
        this.data[7] = 0;
        this.data[11] = 0;
        this.data[15] = 1;

        let et = new Matrix4x4();
        et.TranslationMatrix(-from.x, -from.y, -from.z);
        this.Mul(et);
    }

    MultiplyVector(v){
        let vx = v.x;
        let vy = v.y;
        let vz = v.z;
        let x = this.data[0] * vx + this.data[4] * vy + this.data[8] * vz + this.data[12];
        let y = this.data[1] * vx + this.data[5] * vy + this.data[9] * vz + this.data[13];
        let z = this.data[2] * vx + this.data[6] * vy + this.data[10] * vz + this.data[14];
        return new Vector3(x, y, z);
    }

    MultiplyVector4(v){
        let vx = v.x;
        let vy = v.y;
        let vz = v.z;
        let vw = v.w;
        let x = this.data[0] * vx + this.data[4] * vy + this.data[8] * vz + this.data[12] * vw;
        let y = this.data[1] * vx + this.data[5] * vy + this.data[9] * vz + this.data[13] * vw;
        let z = this.data[2] * vx + this.data[6] * vy + this.data[10] * vz + this.data[14] * vw;
        let w = this.data[3] * vx + this.data[7] * vy + this.data[11] * vz + this.data[15] * vw;
        return new Vector4(x, y, z, w);
    }

    Clone(){
        return new Matrix4x4(this.data);
    }

    ToString(){
        let s = "Matrix4x4\n";
        s += `[ ${this.data[0]}, ${this.data[1]}, ${this.data[2]}, ${this.data[3]}]\n`;
        s += `[ ${this.data[4]}, ${this.data[5]}, ${this.data[6]}, ${this.data[7]}]\n`;
        s += `[ ${this.data[8]}, ${this.data[9]}, ${this.data[10]}, ${this.data[11]}]\n`;
        s += `[ ${this.data[12]}, ${this.data[13]}, ${this.data[14]}, ${this.data[15]}]\n`;
        return s;
    }

    Identity(){
        for (var i = 0; i < 16; i++) {
            this.data[i] = 0;
            if (i % 5 == 0) {
               this.data[i] = 1;
            }
        }
    }

    IsIdentity(){
        var flag = true;
        for (var i = 0; i < 16; i++) {
            if (i % 5 == 0) {
                if (this.data[i] != 1) {
                    flag = false;
                    break;
                }
            } else {
                if (this.data[i] != 0) {
                    flag = false;
                    break;
                }
            }
        }
        return flag;
    }

    AffineInverse(){
        let inv = new Matrix4x4();
        let det = this.Determinant();
        inv.data[0] = (this.data[10] * this.data[5] - this.data[9] * this.data[6]) / det;
        inv.data[1] = -(this.data[10] * this.data[1] - this.data[9] * this.data[2]) / det;
        inv.data[2] = (this.data[6] * this.data[1] - this.data[5] * this.data[2]) / det;
        inv.data[4] = -(this.data[10] * this.data[4] - this.data[8] * this.data[6]) / det;
        inv.data[5] = (this.data[10] * this.data[0] - this.data[8] * this.data[2]) / det;
        inv.data[6] = -(this.data[6] * this.data[0] - this.data[4] * this.data[2]) / det;
        inv.data[8] = (this.data[9] * this.data[4] - this.data[8] * this.data[5]) / det;
        inv.data[9] = -(this.data[9] * this.data[0] - this.data[8] * this.data[1]) / det;
        inv.data[10] = (this.data[5] * this.data[0] - this.data[4] * this.data[1]) / det;
        inv.data[3] = 0;
        inv.data[7] = 0;
        inv.data[11] = 0;
        inv.data[12] = -(inv.data[0] * this.data[12] + inv.data[4] * this.data[13] + inv.data[8] * this.data[14]);
        inv.data[13] = -(inv.data[1] * this.data[12] + inv.data[5] * this.data[13] + inv.data[9] * this.data[14]);
        inv.data[14] = -(inv.data[2] * this.data[12] + inv.data[6] * this.data[13] + inv.data[10] * this.data[14]);
        inv.data[15] = 1;
        return inv;
    }

    GetScaleFromMatrix(){
        var sx = Math.sqrt(this.data[0] * this.data[0] + this.data[1] * this.data[1] + this.data[2] * this.data[2]);
	    var sy = Math.sqrt(this.data[4] * this.data[4] + this.data[5] * this.data[5] + this.data[6] * this.data[6]);
	    var sz = Math.sqrt(this.data[8] * this.data[8] + this.data[9] * this.data[9] + this.data[10] * this.data[10]);
        return new Vector3(sx, sy, sz);
    }

    GetTranslationFromMatrix(){
        return new Vector3(this.data[12], this.data[13], this.data[14]);
    }

    GetRotationFromMatrix(){
        let scale = this.GetScaleFromMatrix();
        let copy = this.Clone();
        copy.data[0] /= scale.x;
        copy.data[1] /= scale.x;
        copy.data[2] /= scale.x;
        copy.data[4] /= scale.y;
        copy.data[5] /= scale.y;
        copy.data[6] /= scale.y;
        copy.data[8] /= scale.z;
        copy.data[9] /= scale.z;
        copy.data[10] /= scale.z;
        copy.data[12] = 0;
        copy.data[13] = 0;
        copy.data[14] = 0;
        let data = this.data;
        var rotXangle = Math.atan2(-data[6], data[10]);
        var cosYangle = Math.sqrt(data[0] * data[0] + data[1] * data[1]);
        var rotYangle = Math.atan2(data[2], cosYangle);
        var sinXangle = Math.sin(rotXangle);
        var cosXangle = Math.cos(rotXangle);
        var rotZangle = Math.atan2(cosXangle * data[4] + sinXangle * data[8], cosXangle * data[5] + sinXangle * data[9]);
        return new Vector3(-rotXangle, -rotYangle, -rotZangle);
    }

    GetTransformFromMatrix(){
        return {rotation: this.GetRotationFromMatrix(), 
                scale: this.GetScaleFromMatrix(),
                translation: this.GetTranslationFromMatrix()
            }
    }

    Print(){
        //console.debug(this.ToString());
    }

    static Zero(){
       return new Matrix4x4();
    }

    static IdentityMat(){
        let m = new Matrix4x4();
        m.Identity();
        return m;
    }

    static TranslateMatrix(v){
        let m = new Matrix4x4();
        m.TranslationMatrix(v);
        return m;
    }
}