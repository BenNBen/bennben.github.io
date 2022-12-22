//simple code to draw a cone

/*
    @purpose: draw a simple wireframe cone
    @param gl: the current webgl context of the scene
    @param radius: the radius of the cone object to be drawn
    @param centroid: the x,y,z coordinates where the ccone should be placed
    @param pointsPerCircle: the higher the points, the smoother the surface of the cone
*/
function DrawCone(gl,radius,distance,pointsPerCircle){
  this.gl = gl; 
  this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  this.modelChanged = false;
  this.radius = radius || 1;
  this.x = 0;
  this.y = 0;
  this.z = 0;
  this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
  this.attributes = {};
  this.attributes.position = gl.getAttribLocation(this.program, 'position');
  this.colorLocation = gl.getUniformLocation(this.program, 'color');
  this.mvpLocation = gl.getUniformLocation(this.program, 'mvp_matrix');
  this.distance = distance || 1;
  this.pointsPerCircle = pointsPerCircle || 24;
    if (this.pointsPerCircle < 7) {
        this.pointsPerCircle = 7;
    }
  this.verts = new Float32Array(this.pointsPerCircle *3);
  var indices = [];
  for(var i =1;i<this.pointsPerCircle;i++){
      indices.push(0);
      if(i<this.pointsPerCircle-1){
        indices.push(i);
        indices.push(i+1);
      }else{
        indices.push(i);
        indices.push(1);
      }
  }
    
  this.indices  = new Uint16Array(indices);
  this.drawVerts = new Float32Array(this.verts.length);
    this.verts = new Float32Array(this.pointsPerCircle * 3);
    var n = [];
    var direction = [0, 1, 0];
    n = Vec3_normalize(n, direction);
    var scope = [];
    scope = Vec3_smul(scope, this.distance, n);
    this.verts[0] = 0;
    this.verts[1] = scope[1]
    this.verts[2] = 0;
    var k = 3;
    for (var i = 1; i < this.pointsPerCircle; i++) {
        var angle = i * Math.PI * 2 / (this.pointsPerCircle - 1)
        this.verts[k] = scope[0] + Math.cos(angle) * this.radius / 2.0;
        this.verts[1 + k] = 0
        this.verts[2 + k] = scope[2]+ Math.sin(angle) * this.radius / 2.0;;
        k += 3;
    }
    for (var i = 0; i < this.verts.length; i += 3) {
        this.drawVerts[i] = this.verts[i];
        this.drawVerts[i + 1] = this.verts[i + 1];
        this.drawVerts[i + 2] = this.verts[i + 2];
    }
  this.modifyModelMatrix([this.x, this.y, this.z]);
  this.vertsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.drawVerts, gl.STATIC_DRAW);

  this.indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}

DrawCone.prototype.rotateMatrix = function (rotation, modelMatrix) {
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

DrawCone.prototype.modifyModelMatrix = function (pos, rotation, scale) {
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

DrawCone.prototype.modifyVertices = function () {
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
DrawCone.prototype.draw = function(gl,matrix,color){
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

DrawCone.prototype.vertexShader =
'precision highp float;\n' +
'uniform mat4 mvp_matrix;\n' +
'\n' +
'attribute vec3 position;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_Position = mvp_matrix*vec4(position, 1.0);\n' +
'}\n';

DrawCone.prototype.fragmentShader =
'precision highp float;\n' +
'\n' +
'uniform vec4 color;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_FragColor = color;\n' +
'}\n';