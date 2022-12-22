//simple code to draw a sphere

/*
    @purpose: draw a simple wireframe sphere
    @param gl: the current webgl context of the scene
    @param radius: the radius of the sphere object to be drawn
    @param centroid: the x,y,z coordinates where the capsule should be placed
*/
function DrawSphere(gl,radius,centroid){
  this.gl = gl;
    this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.modelChanged = false;
  this.radius = radius || 1;
  centroid = centroid || [0,0,0];
  this.x = centroid[0];
  this.y = centroid[1];
  this.z = centroid[2];
  this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
  this.attributes = {};
  this.attributes.position = gl.getAttribLocation(this.program, 'position');
  this.colorLocation = gl.getUniformLocation(this.program, 'color');
  this.mvpLocation = gl.getUniformLocation(this.program, 'mvp_matrix');
  var pointsPerCircle = 64;
  var vertCount = pointsPerCircle*3;
  var indexCount = pointsPerCircle*2*3;
  this.verts = new Float32Array(3*vertCount);
  this.indices = new Uint16Array(indexCount);
  
  var radius = this.radius;
  	
  var voffset = 0;
  var ioffset = 0;

  var k2 = 0 + ioffset;
  var k3 = 0 + voffset*3;
  for (i=0; i < pointsPerCircle; i++) {
      angle = i*Math.PI*2/pointsPerCircle;
      this.verts[0 + k3] = 0.0;
      this.verts[1 + k3] = Math.sin(angle) * radius / 2.0 + radius / 2.0;
      this.verts[2 + k3] = Math.cos(angle)*radius/2.0;
      this.indices[0 + k2] = i + voffset;
      if (i < pointsPerCircle - 1) {
          this.indices[1 + k2] = i + 1 + voffset;
      } else {
          this.indices[1 + k2] = 0 + voffset;
      }
      k3 += 3;
      k2 += 2;
  }
	
  voffset = vertCount/3;
  ioffset = indexCount/3;

  k2 = 0 + ioffset;
  k3 = 0 + voffset*3;
  for (i=0; i < pointsPerCircle; i++) {
      angle = i*Math.PI*2/pointsPerCircle;
      this.verts[0 + k3] = Math.cos(angle)*radius/2.0;
      this.verts[1 + k3] = 0.0 + radius / 2.0;
      this.verts[2 + k3] = Math.sin(angle)*radius/2.0;
      this.indices[0 + k2] = i + voffset;
      if (i < pointsPerCircle - 1) {
          this.indices[1 + k2] = i + 1 + voffset;
      } else {
          this.indices[1 + k2] = 0 + voffset;
      }
      k3 += 3;
      k2 += 2;
  }

  voffset = 2*vertCount/3;
  ioffset = 2*indexCount/3;

  k2 = 0 + ioffset;
  k3 = 0 + voffset*3;
  for (i=0; i < pointsPerCircle; i++) {
      angle = i*Math.PI*2/pointsPerCircle;
      this.verts[0 + k3] = Math.cos(angle)*radius/2.0;
      this.verts[1 + k3] = Math.sin(angle) * radius / 2.0 + radius / 2.0;
      this.verts[2 + k3] = 0.0;
      this.indices[0 + k2] = i + voffset;
      if (i < pointsPerCircle - 1) {
          this.indices[1 + k2] = i + 1 + voffset;
      } else {
          this.indices[1 + k2] = 0 + voffset;
      }
      k3 += 3;
      k2 += 2;
  }
	this.drawVerts = new Float32Array(3*vertCount);
  for(var i =0;i<this.verts.length;i+=3){
    this.drawVerts[i] = this.verts[i];
    this.drawVerts[i+1] = this.verts[i+1];
    this.drawVerts[i+2] = this.verts[i+2];
  }
    this.modifyModelMatrix([this.x, this.y, this.z]);
	this.indexCount = indexCount;
  this.vertsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.drawVerts, gl.STATIC_DRAW);

  this.indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}

DrawSphere.prototype.rotateMatrix = function (rotation, modelMatrix) {
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

DrawSphere.prototype.modifyModelMatrix = function (pos, rotation, scale) {
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

DrawSphere.prototype.modifyVertices = function () {
    for (var i = 0; i < this.verts.length; i += 3) {
        matrixTimesVector3offset(this.drawVerts, this.modelMatrix, this.verts, i, i);
    }
}

/*
    @purpose: draw the newly created sphere object to the scene
    @param gl: the current webgl context of the scene
    @param matrix: the transform matrix to multiply the sphere's vertices by
    @param color: the color to draw the wireframe sphere
*/
DrawSphere.prototype.draw = function(gl,matrix,color){
  color = color || [0,1,0,1];
    if (this.modelChanged) {
        this.modifyVertices();
        this.modelChanged = false;
    }
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
  gl.drawElements(gl.LINES, this.indexCount, gl.UNSIGNED_SHORT, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  console.log

  gl.disableVertexAttribArray(this.attributes.position);
}

DrawSphere.prototype.vertexShader =
'precision highp float;\n' +
'uniform mat4 mvp_matrix;\n' +
'\n' +
'attribute vec3 position;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_Position = mvp_matrix*vec4(position, 1.0);\n' +
'}\n';

DrawSphere.prototype.fragmentShader =
'precision highp float;\n' +
'\n' +
'uniform vec4 color;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_FragColor = color;\n' +
'}\n';