//simple code to draw a cone

/*
    @purpose: draw a simple wireframe cone
    @param gl: the current webgl context of the scene
*/
function Mesh(gl, verts, indices){
    this.gl = gl; 
    this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.modelChanged = false;
    this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
    this.attributes = {};
    this.attributes.position = gl.getAttribLocation(this.program, 'position');
    this.colorLocation = gl.getUniformLocation(this.program, 'color');
    this.mvpLocation = gl.getUniformLocation(this.program, 'mvp_matrix');
    this.drawVerts = new Float32Array(verts);
    this.indices = new Uint16Array(indices);
    var v = [];
    var ind = [];
    if(verts[0].length == 3){
        for(var i =0 ;i<verts.length;i++){
            v.push(verts[i][0]);
            v.push(verts[i][1]);
            v.push(verts[i][2]);
        }
        this.drawVerts = new Float32Array(v);
        this.verts = new Float32Array(v);
    }
    if (indices[0].length == 3) {
        for (var i = 0; i < indices.length; i++) {
            ind.push(indices[i][0]);
            ind.push(indices[i][1]);
            ind.push(indices[i][2]);
        }
        this.indices = new Uint16Array(ind);
    }
    this.modelChanged = true;
}

Mesh.prototype.rotateMatrix = function (rotation, modelMatrix) {
    var s1 = new Float32Array(16);
    var s2 = new Float32Array(16);
    var x = rotation[0] * (Math.PI / 180);
    var y = rotation[1] * (Math.PI / 180);
    var z = rotation[2] * (Math.PI / 180);
    // below code checks whether a given rotation exists and properly rotates the particle effect/s model matrix appropriately
    if (rotation[1] != 0) { //y rotation matrix
        yRotationMatrix(s1, y);
        matrixMultiply(modelMatrix, s1, s2);
    }
    if (rotation[0] != 0) { //x rotation matrix
        xRotationMatrix(s1, x);
        matrixMultiply(modelMatrix, s1, s2);
    }
    if (rotation[2] != 0) { //z rotation matrix
        zRotationMatrix(s1, z);
        matrixMultiply(modelMatrix, s1, s2);
    }
    return modelMatrix;
}

Mesh.prototype.modifyModelMatrix = function (pos, rotation, scale) {
    var ps = particleSystem;
    this.pos = pos || [0, 0, 0];
    this.rotation = rotation || [0, 0, 0];
    this.scale = scale || [1, 1, 1];
    this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    translateMatrix(this.modelMatrix, this.pos);
    var scaleMat = new Float32Array(16);
    var scratch = new Float32Array(16);
    scaleMatrix(scaleMat, this.scale);
    matrixMultiply(this.modelMatrix, scaleMat, scratch);
    this.modelMatrix = this.rotateMatrix(this.rotation, this.modelMatrix);
    this.modelChanged = true;
}

Mesh.prototype.modifyVertices = function () {
    for (var i = 0; i < this.verts.length; i += 3) {
        matrixTimesVector3offset(this.drawVerts, this.modelMatrix, this.verts, i, i);
    }
}

/*
    @purpose: draw the chosen cone to the scene
    @param gl: the current webgl context of the scene
    @param matrix: the transform matrix to multiply the cone's vertices by
    @param color: the color used to draw the wireframe cone
*/
Mesh.prototype.draw = function(gl, matrix, color, verts, indices){
    if(verts && indices){
        this.drawVerts = new Float32Array(verts);
        this.indices = new Uint16Array(indices);
    }

    if (this.modelChanged) {
        //this.modifyVertices();
        this.modelChanged = false;
        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        this.vertsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.drawVerts, gl.STATIC_DRAW);
    }
    gl.disable(gl.CULL_FACE);
    color = color || [.3,.3,.3,1];

    gl.useProgram(this.program);
    gl.uniform4fv(this.colorLocation, new Float32Array(color));
    gl.uniformMatrix4fv(this.mvpLocation, false, matrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
    gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.enableVertexAttribArray(this.attributes.position);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.disableVertexAttribArray(this.attributes.position);
    gl.enable(gl.CULL_FACE);
}

Mesh.prototype.vertexShader =
'precision highp float;\n' +
'uniform mat4 mvp_matrix;\n' +
'\n' +
'attribute vec3 position;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_Position = mvp_matrix*vec4(position, 1.0);\n' +
'}\n';

Mesh.prototype.fragmentShader =
'precision highp float;\n' +
'\n' +
'uniform vec4 color;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_FragColor = color;\n' +
'}\n';