class Cylinder extends Geo{
    constructor(gl, pointsPerCircle = 24){
        super(gl);
        if (pointsPerCircle < 6) {
            pointsPerCircle = 6;
        }
        this.pointsPerCircle = pointsPerCircle;
        this.CalcWireFrameData();
    }

    CalcWireFrameData(){
        this.height = 1;
        let radius = 1;

        let verts = new Float32Array((this.pointsPerCircle + 1) * 6);
        let indices = [];
        var k = 2;
        indices.push(0);
        indices.push(1);
        for (var i = 0; i < this.pointsPerCircle; i++) {
            indices.push(0);
            indices.push(k);
            indices.push(1);
            indices.push(k + 1);
            indices.push(k);
            indices.push(k + 1);
            if (i < this.pointsPerCircle - 1) {
                indices.push(k);
                indices.push(k + 2);
                indices.push(k + 1);
                indices.push(k + 3);
            } else {
                indices.push(k);
                indices.push(2);
                indices.push(k + 1);
                indices.push(3);
            }
            k += 2;
        }
        indices = new Uint16Array(indices);
        verts[0] = 0;
        verts[1] = this.height;
        verts[2] = 0;
        verts[3] = 0;
        verts[4] = 0;
        verts[5] = 0;

        var k = 6;
        for (var i = 0; i < this.pointsPerCircle; i++) {
            var angle = i * Math.PI * 2 / this.pointsPerCircle;
            verts[0 + k] = Math.cos(angle) * radius / 2.0;
            verts[1 + k] = this.height;
            verts[2 + k] = Math.sin(angle) * radius / 2.0;
            verts[3 + k] = Math.cos(angle) * radius / 2.0;
            verts[4 + k] = 0.0;
            verts[5 + k] = Math.sin(angle) * radius / 2.0;
            k += 6;
        }
        let drawVerts = new Float32Array(verts.length);
        for (var i = 0; i < verts.length; i += 3) {
            drawVerts[i] = verts[i];
            drawVerts[i + 1] = verts[i + 1];
            drawVerts[i + 2] = verts[i + 2];
        }
        this.wireVerts = verts;
        this.wireIndices = indices;
        this.wireDrawVerts = drawVerts;
    }
}

