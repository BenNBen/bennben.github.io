//simple code to draw an arrow

/*
    @purpose: draw a simple wireframe cone
    @param gl: the current webgl context of the scene
    @param pointsPerCircle: the higher the points, the smoother the surface of the arrow
*/
function DrawArrow(gl, pointsPerCircle){
    this.gl = gl; 
    this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.modelChanged = false;
    this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
    this.attributes = {};
    this.attributes.position = gl.getAttribLocation(this.program, 'position');
    this.colorLocation = gl.getUniformLocation(this.program, 'color');
    this.mvpLocation = gl.getUniformLocation(this.program, 'mvp_matrix');
    this.x = 0;
    this.y = 0;
    this.z = 0;
    var height = 1;
    var p = [0,0,0,0,height,0];
    var offset = height *.75;
    var radius = height * .2;
    this.pointsPerCircle = pointsPerCircle || 32;
    if (this.pointsPerCircle < 7) {
        this.pointsPerCircle = 7;
    }
    for (var i = 1; i < this.pointsPerCircle; i++) {
        var angle = i * Math.PI * 2 / (this.pointsPerCircle - 3)
        p.push(Math.cos(angle) * radius / 2.0, offset, Math.sin(angle) * radius / 2.0);
    }
    var indices = [];
    indices.push(0,1);
    for (var i = 1; i < this.pointsPerCircle; i++) {
        indices.push(1);
        if (i < this.pointsPerCircle - 1) {
            indices.push(i);
            indices.push(i + 1);
        } else {
            indices.push(i);
            indices.push(1);
        }
    }

    this.verts = new Float32Array(p);
    this.drawVerts = new Float32Array(p);
    this.modifyModelMatrix([this.x, this.y, this.z]);
    this.indices = new Uint16Array(indices)

    this.indicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}

DrawArrow.prototype.rotateMatrix = function (rotation, modelMatrix) {
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

DrawArrow.prototype.modifyModelMatrix = function (pos, rotation, scale) {
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

DrawArrow.prototype.modifyVertices = function () {
    for (var i = 0; i < this.verts.length; i += 3) {
        matrixTimesVector3offset(this.drawVerts, this.modelMatrix, this.verts, i, i);
    }
}

/*
    @purpose: draw the chosen arrow to the scene
    @param gl: the current webgl context of the scene
    @param matrix: the transform matrix to multiply the arrow's vertices by
    @param color: the color used to draw the wireframe arrow
    @param rotation: a three tuple vector used to rotate the vertices of the arrow
*/
DrawArrow.prototype.draw = function(gl,matrix,color){
  var pointsPerCircle = this.pointsPerCircle;
  color = color || [0,1,0,1];
 
    if (this.modelChanged) {
        this.modifyVertices();
        this.modelChanged = false;
    }
 
  this.indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    
   this.vertsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.drawVerts, gl.STATIC_DRAW);

  
  gl.useProgram(this.program);
  gl.uniform4fv(this.colorLocation, new Float32Array(color));
  gl.uniformMatrix4fv(this.mvpLocation, false, matrix);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
  gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.enableVertexAttribArray(this.attributes.position);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  gl.drawElements(gl.LINE_LOOP, this.indices.length, gl.UNSIGNED_SHORT, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.disableVertexAttribArray(this.attributes.position);
}

DrawArrow.prototype.vertexShader =
'precision highp float;\n' +
'uniform mat4 mvp_matrix;\n' +
'\n' +
'attribute vec3 position;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_Position = mvp_matrix*vec4(position, 1.0);\n' +
'}\n';

DrawArrow.prototype.fragmentShader =
'precision highp float;\n' +
'\n' +
'uniform vec4 color;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_FragColor = color;\n' +
'}\n';