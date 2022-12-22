class Cone extends Geo{
    constructor(gl, pointsPerCircle = 24){
        super(gl);
        this.pointsPerCircle = pointsPerCircle;
        if (this.pointsPerCircle < 7) {
            this.pointsPerCircle = 7;
        }
        this.CalcWireFrameData();
    }

    CalcWireFrameData(){
        let distance = 1;
        let radius = 1;
        let indices = [];
        for (var i = 1; i < this.pointsPerCircle; i++) {
            indices.push(0);
            if (i < this.pointsPerCircle - 1) {
                indices.push(i);
                indices.push(i + 1);
            } else {
                indices.push(i);
                indices.push(1);
            }
        }

        indices = new Uint16Array(indices);
        let verts = new Float32Array(this.pointsPerCircle * 3);
        let drawVerts = new Float32Array(verts.length);
        let direction = new Vector3(0, 1, 0).Normalized();
        direction = direction.Mul(distance);
        verts[0] = 0;
        verts[1] = direction.y;
        verts[2] = 0;
        for (var i = 1; i < this.pointsPerCircle; i++) {
            var angle = i * Math.PI * 2 / (this.pointsPerCircle - 1)
            let k = i * 3;
            verts[k] = direction.x + Math.cos(angle) * radius / 2.0;
            verts[1 + k] = 0
            verts[2 + k] = direction.z + Math.sin(angle) * radius / 2.0;;
        }
        for (var i = 0; i < verts.length; i += 3) {
            drawVerts[i] = verts[i];
            drawVerts[i + 1] = verts[i + 1];
            drawVerts[i + 2] = verts[i + 2];
        }

        this.wireVerts = verts;
        this.wireIndices = indices;
        this.wireDrawVerts = drawVerts;
    }

    DrawWireFrame(gl, matrix, color = [0, 1, 0, 1]) {
        if (this.modelChanged) {
            this.ModifyVertices();
            this.modelChanged = false;
        }

        let program = this.wireProgram;
        let attributes = this.wireAttributes;
        let locations = this.wireLocations;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireIndicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.wireIndices, gl.STATIC_DRAW);


        gl.useProgram(program);
        gl.uniform4fv(locations.color, new Float32Array(color));
        gl.uniformMatrix4fv(locations.mvp, false, matrix.data);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.wireVertsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.wireDrawVerts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(attributes.position);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireIndicesBuffer);
        gl.drawElements(gl.LINE_LOOP, this.wireIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        gl.disableVertexAttribArray(attributes.position);
    }
}
