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

SIMPLE_LIT_VERTEX = 
`precision highp float;
uniform mat4 mvp_matrix;
uniform mat4 normal_matrix;

varying vec2 varyUV;
varying vec3 light;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

void main()
{
	gl_Position = mvp_matrix*vec4(position, 1.0);
    varyUV = uv;

    vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 direction = normalize(vec3(0.85, 0.8, 0.75));

    vec4 tNormal = normal_matrix * vec4(normal, 1.0);

    float directionVal = max(dot(tNormal.xyz, direction), 0.0);
    light = ambientLight + (lightColor * directionVal);
}`;

SIMPLE_LIT_FRAGMENT = 
`precision highp float;
varying vec2 varyUV;
varying vec3 light;

uniform sampler2D texture;

void main(){
    vec4 tcolor = texture2D(texture, varyUV);
    gl_FragColor = vec4(tcolor.rgb * light, tcolor.a);
}`;


class Geo {
    constructor(gl){
        this.eType = 'geo';
        this.modelMatrix = Matrix4x4.IdentityMat();
        this.quaternion = new Quaternion();
        this.modelChanged = false;
        this.SetupWireProgram(gl);
        this.SetupLitProgram(gl);
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
        this.wireVerts;
        this.wireDrawVerts;
    }

    SetupLitProgram(gl){
        this.litProgram = createProgram(gl, SIMPLE_LIT_VERTEX, SIMPLE_LIT_FRAGMENT);
        this.litAttributes = {};
        this.litLocations = {};
        this.litAttributes.position = gl.getAttribLocation(this.litProgram, 'position');
        this.litAttributes.normal = gl.getAttribLocation(this.litProgram, 'normal');
        this.litAttributes.uv = gl.getAttribLocation(this.litProgram, 'uv');
        this.litLocations.mvp = gl.getUniformLocation(this.litProgram, 'mvp_matrix');
        this.litLocations.normal = gl.getUniformLocation(this.litProgram, 'normal_matrix');
        this.litVertsBuffer = gl.createBuffer();
        this.litNormalsBuffer = gl.createBuffer();
        this.litUVsBuffer = gl.createBuffer();
        this.litIndicesBuffer = gl.createBuffer();
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

    DrawSimpleLit(gl, matrix, n_matrix){
        if (this.modelChanged) {
            this.ModifyVertices();
            this.modelChanged = false;
        }

        let program = this.litProgram;
        let attributes = this.litAttributes;
        let locations = this.litLocations;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.litIndicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.litIndices, gl.STATIC_DRAW);

        gl.useProgram(program);
        gl.uniformMatrix4fv(locations.mvp, false, matrix.data);
        gl.uniformMatrix4fv(locations.normal, false, n_matrix.data);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.litVertsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.litDrawVerts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.litNormalsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.litDrawNormals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attributes.normal, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.litUVsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.litDrawUVs, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attributes.uv, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.enableVertexAttribArray(attributes.position);
        gl.enableVertexAttribArray(attributes.normal);
        gl.enableVertexAttribArray(attributes.uv);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.litIndicesBuffer);
        gl.drawElements(gl.TRIANGLES, this.litIndices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        gl.disableVertexAttribArray(attributes.position);
        gl.disableVertexAttribArray(attributes.normal);
        gl.disableVertexAttribArray(attributes.uv);
    }
}