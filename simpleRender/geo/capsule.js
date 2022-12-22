

class Capsule extends Geo{
    constructor(gl, pointsPerCircle = 32){
        super(gl);
        this.pointsPerCircle = pointsPerCircle;
        this.CalcWireFrameData();
    }

    CalcWireFrameData(){
        let pointsPerCircle = this.pointsPerCircle;
        var vertCount = pointsPerCircle * 6;
        var indexCount = pointsPerCircle * 2 * 6;
        let verts = new Float32Array(3 * vertCount);
        let indices = new Uint16Array(indexCount);
        var radius = .5;
        this.height = 1 - radius;
        var voffset = 0;
        var ioffset = 0;

        var k2 = 0 + ioffset;
        var k3 = 0 + voffset * 3;
        var angleIncr = Math.PI / (pointsPerCircle - 1);
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = i * angleIncr
            verts[0 + k3] = 0.0;
            verts[1 + k3] = Math.sin(angle) * radius / 2.0 + this.height + radius / 2.0;
            verts[2 + k3] = Math.cos(angle) * radius / 2.0;
            indices[0 + k2] = i + voffset;
            indices[1 + k2] = i + 1 + voffset;

            k3 += 3;
            k2 += 2;
        }

        voffset = vertCount / 6;
        ioffset = indexCount / 6;


        k2 = 0 + ioffset;
        k3 = 0 + voffset * 3;
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = Math.PI + (i * angleIncr);
            verts[0 + k3] = 0.0;
            verts[1 + k3] = Math.sin(angle) * radius / 2.0 + radius / 2.0;
            verts[2 + k3] = Math.cos(angle) * radius / 2.0;
            indices[0 + k2] = i + voffset;
            if (i < pointsPerCircle - 1) {
                indices[1 + k2] = i + 1 + voffset;
            } else {
                indices[1 + k2] = 0;
            }
            k3 += 3;
            k2 += 2;
        }

        voffset = 2 * vertCount / 6;
        ioffset = 2 * indexCount / 6;

        k2 = 0 + ioffset;
        k3 = 0 + voffset * 3;
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = i * angleIncr
            verts[0 + k3] = Math.cos(angle) * radius / 2.0;
            verts[1 + k3] = Math.sin(angle) * radius / 2.0 + this.height + radius / 2.0;
            verts[2 + k3] = 0.0;
            indices[0 + k2] = i + voffset;
            indices[1 + k2] = i + 1 + voffset;
            k3 += 3;
            k2 += 2;
        }

        voffset = 3 * vertCount / 6;
        ioffset = 3 * indexCount / 6;

        k2 = 0 + ioffset;
        k3 = 0 + voffset * 3;
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = Math.PI + (i * angleIncr);
            verts[0 + k3] = Math.cos(angle) * radius / 2.0;;
            verts[1 + k3] = Math.sin(angle) * radius / 2.0 + radius / 2.0;
            verts[2 + k3] = 0.0;
            indices[0 + k2] = i + voffset;
            if (i < pointsPerCircle - 1) {
                indices[1 + k2] = i + 1 + voffset;
            } else {
                indices[1 + k2] = 0 + vertCount / 3;
            }
            k3 += 3;
            k2 += 2;
        }

        voffset = 4 * vertCount / 6;
        ioffset = 4 * indexCount / 6;


        k2 = 0 + ioffset;
        k3 = 0 + voffset * 3;
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = i * Math.PI * 2 / pointsPerCircle;
            verts[0 + k3] = Math.cos(angle) * radius / 2.0;
            verts[1 + k3] = this.height * .125 + radius / 2.0;
            verts[2 + k3] = Math.sin(angle) * radius / 2.0;
            indices[0 + k2] = i + voffset;
            if (i < pointsPerCircle - 1) {
                indices[1 + k2] = i + 1 + voffset;
            } else {
                indices[1 + k2] = 0 + voffset;
            }
            k3 += 3;
            k2 += 2;
        }


        voffset = 5 * vertCount / 6;
        ioffset = 5 * indexCount / 6;

        k2 = 0 + ioffset;
        k3 = 0 + voffset * 3;
        for (i = 0; i < pointsPerCircle; i++) {
            let angle = i * Math.PI * 2 / pointsPerCircle;
            verts[0 + k3] = Math.cos(angle) * radius / 2.0;
            verts[1 + k3] = this.height * .875 + radius / 2.0;
            verts[2 + k3] = Math.sin(angle) * radius / 2.0;
            indices[0 + k2] = i + voffset;
            if (i < pointsPerCircle - 1) {
                indices[1 + k2] = i + 1 + voffset;
            } else {
                indices[1 + k2] = 0 + voffset;
            }
            k3 += 3;
            k2 += 2;
        }

        let drawVerts = new Float32Array(3 * vertCount);
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