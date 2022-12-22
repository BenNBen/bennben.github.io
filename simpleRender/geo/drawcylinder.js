//simple code to draw a cylinder

/*
    @purpose: draw a simple wireframe cylinder
    @param gl: the current webgl context of the scene
    @param radius: the radius of the cylinder object to be drawn
    @param height: the height of the cylinder object to be drawn
    @param location: the x,y,z coordinates where the cylinder should be placed
    @param pointsPerCircle: the higher the points, the smoother the surface of the cylinder
*/
function DrawCylinder(gl,radius,height,pointsPerCircle){
  this.gl = gl;
  this.modelMatrix = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
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
  this.height = height || 1;
  radius = this.radius;
  var pointsPerCircle = pointsPerCircle || 24;
  if(pointsPerCircle < 6){
      pointsPerCircle = 6;
  }
  this.verts = new Float32Array((pointsPerCircle+1)*6);

  this.indices = [];
  var k =2;
  this.indices.push(0);
  this.indices.push(1);
  for(var i =0;i<pointsPerCircle;i++){
      this.indices.push(0);
      this.indices.push(k);
      this.indices.push(1);
      this.indices.push(k+1);
      this.indices.push(k);
      this.indices.push(k+1);
      if(i<pointsPerCircle - 1){
          this.indices.push(k);
          this.indices.push(k+2);
          this.indices.push(k+1);
          this.indices.push(k+3);
      }else{
          this.indices.push(k);
          this.indices.push(2);
          this.indices.push(k+1);
          this.indices.push(3);
      }
      k+=2;
  }
  this.indices = new Uint16Array(this.indices);
  this.verts[0] = 0;
  this.verts[1] = this.height;
  this.verts[2] = 0;
  this.verts[3] = 0;
  this.verts[4] = 0;
  this.verts[5] = 0;
    
  var k =6;
  for(var i =0;i<pointsPerCircle;i++){
      var angle = i*Math.PI*2/pointsPerCircle;
      this.verts[0 + k] = Math.cos(angle)*radius/2.0;
      this.verts[1 + k] = this.height;
      this.verts[2 + k] = Math.sin(angle)*radius/2.0;
      this.verts[3 + k] = Math.cos(angle)*radius/2.0;
      this.verts[4 + k] = 0.0;
      this.verts[5 + k] = Math.sin(angle)*radius/2.0;
      k+=6;
  }
  this.drawVerts = new Float32Array(this.verts.length);
  for(var i =0;i<this.verts.length;i+=3){
    this.drawVerts[i] = this.verts[i] + this.x;
    this.drawVerts[i+1] = this.verts[i+1] + this.y;
    this.drawVerts[i+2] = this.verts[i+2] + this.z;
  }
  this.modifyModelMatrix([this.x, this.y, this.z]);
  this.vertsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.drawVerts, gl.STATIC_DRAW);

  this.indicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
}


DrawCylinder.prototype.rotateMatrix = function(rotation, modelMatrix) {
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
    
DrawCylinder.prototype.modifyModelMatrix = function (pos, rotation, scale) {
    var ps = particleSystem;
    this.pos = pos || [0, 0, 0];
    this.rotation = rotation || [0, 0, 0];
    this.scale = scale || [1, 1, 1];
    this.modelMatrix = new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    translateMatrix(this.modelMatrix, this.pos);
    var scaleMat = new Float32Array(16);
    var scratch = new Float32Array(16);
    scaleMatrix(scaleMat, this.scale);
    matrixMultiply(this.modelMatrix, scaleMat, scratch);
    this.modelMatrix = this.rotateMatrix(this.rotation, this.modelMatrix);
    this.modelChanged = true;
}

DrawCylinder.prototype.modifyVertices = function () {
    for (var i = 0; i < this.verts.length; i += 3) {
        matrixTimesVector3offset(this.drawVerts, this.modelMatrix, this.verts, i, i);
    }
}

/*
    @purpose: draw the newly created clyinder object to the scene
    @param gl: the current webgl context of the scene
    @param matrix: the transform matrix to multiply the cylinder's vertices by
    @param color: the color to draw the wireframe cylinder
*/
DrawCylinder.prototype.draw = function(gl,matrix,color){
  color = color || [0,1,0,1];
  if(this.modelChanged){
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
  gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  gl.disableVertexAttribArray(this.attributes.position);
}

DrawCylinder.prototype.vertexShader =
'precision highp float;\n' +
'uniform mat4 mvp_matrix;\n' +
'\n' +
'attribute vec3 position;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_Position = mvp_matrix*vec4(position, 1.0);\n' +
'}\n';

DrawCylinder.prototype.fragmentShader =
'precision highp float;\n' +
'\n' +
'uniform vec4 color;\n' +
'\n' +
'void main()\n' +
'{\n' +
'	gl_FragColor = color;\n' +
'}\n';