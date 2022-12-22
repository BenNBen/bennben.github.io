SIMPLE_GEO_VERTEX =
`precision highp float;
uniform mat4 mvp_matrix;
attribute vec3 position;
void main()
{
	gl_Position = mvp_matrix*vec4(position, 1.0);
}`;

SIMPLE_GEO_FRAGMENT =
`precision highp float;
uniform vec4 color;
void main(){
	gl_FragColor = color;
}`;


class Geo {
    constructor(gl){
        this.eType = 'geo';
        this.modelMatrix = Matrix4x4.IdentityMat();
        this.quaternion = new Quaternion();
        this.modelChanged = false;
        this.SetupWireProgram(gl);
        this.wireVerts;
        this.wireDrawVerts;
        this.ModifyModelMatrix(new Vector3());
    }

    SetupWireProgram(gl){
        this.wireProgram = createProgram(gl, SIMPLE_GEO_VERTEX, SIMPLE_GEO_FRAGMENT);
        this.wireAttributes = {};
        this.wireLocations = {};
        this.wireAttributes.position = gl.getAttribLocation(this.wireProgram, 'position');
        this.wireLocations.color = gl.getUniformLocation(this.wireProgram, 'color');
        this.wireLocations.mvp = gl.getUniformLocation(this.wireProgram, 'mvp_matrix');
        this.wireVertsBuffer = gl.createBuffer();
        this.wireIndicesBuffer = gl.createBuffer();
    }

    RotateMatrix(rotation, modelMatrix) {
        var s = new Matrix4x4();
        let q = this.quaternion;
        q.SetEuler(rotation.x, rotation.y, rotation.z);
        s.RotationMatrix(q);

        return modelMatrix.Mul(s);
    }

    ModifyModelMatrix(pos = new Vector3(0, 0, 0), rotation = new Vector3(0, 0, 0), scale = new Vector3(1, 1, 1)) {
        this.pos = pos;
        this.rotation = rotation;
        this.scale = scale;

        this.modelMatrix.ScaleMatrix(this.scale);
        this.modelMatrix = this.RotateMatrix(rotation, this.modelMatrix);
        this.modelMatrix.DisplaceMatrix(this.pos);
        this.modelChanged = true;
    }

    ModifyVertices() {
        for (var i = 0; i < this.wireVerts.length; i += 3) {
            matrixTimesVector3offset(this.wireDrawVerts, this.modelMatrix.data, this.wireVerts, i, i);
        }
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
        gl.drawElements(gl.LINES, this.wireIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        gl.disableVertexAttribArray(attributes.position);
    }
}