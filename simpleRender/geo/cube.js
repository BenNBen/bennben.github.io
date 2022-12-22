class Cube extends Geo{
    constructor(gl){
        super(gl);
        this.CalcWireFrameData();
    }

    CalcWireFrameData(){
        let dimension = 1;
        var bb = [-dimension / 2, 0, -dimension / 2, dimension / 2, dimension, dimension / 2];
        var p = [];
        p[0] = bb[0]		// v0
        p[1] = bb[1]
        p[2] = bb[2]
        p[3] = bb[3]		// v1
        p[4] = bb[1]
        p[5] = bb[2]
        p[6] = bb[3]		// v2
        p[7] = bb[4]
        p[8] = bb[2]
        p[9] = bb[0]		// v3
        p[10] = bb[4]
        p[11] = bb[2]
        p[12] = bb[0]		// v4
        p[13] = bb[1]
        p[14] = bb[5]
        p[15] = bb[3]		// v5
        p[16] = bb[1]
        p[17] = bb[5]
        p[18] = bb[3]		// v6
        p[19] = bb[4]
        p[20] = bb[5]
        p[21] = bb[0]		// v7
        p[22] = bb[4]
        p[23] = bb[5]
        this.wireVerts = new Float32Array(p);
        this.wireDrawVerts = new Float32Array(p);
        this.wireIndices = new Uint16Array([0, 1, 0, 3, 0, 4, 4, 5, 5, 1, 1, 2, 2, 3, 3, 7, 4, 7, 7, 6, 2, 6, 5, 6])
    }
}

