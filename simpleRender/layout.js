

function Layout(){
  this.modelMatrix = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);
  this.scratchVector3 = new Float32Array(3);
  this.scratchMatrix = new Float32Array(16);
  this.scratchMatrix2 = new Float32Array(16);
  this.scratchMatrix3 = new Float32Array(16);
  this.projectionMatrix = new Float32Array(16);
  this.normalMatrix = new Float32Array(9);
  this.scratchVector = new Float32Array(4);
  this.identityMatrix = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  0, 0, 1, 0,  0, 0, 0, 1]);
  this.boundingBox = [-0, -0, -0, 0, 0, 0];
  this.upVector=new Float32Array([0, 1, 0]);
  this.camera = {rotation:[0, 0, 0], translation:[0, 0, 0]};
  this.lastCameraMatrix = new Float32Array(16)
  this.lastProjectionMatrix = new Float32Array(16)
  this.viewFrustrum = new Frustrum();
}

Layout.prototype.updateLightMatrices = function(){
  var light = this.light;
  var upVector = this.upVector;

}

Layout.prototype.initialize = function(gl){
  this.camera.rotation = [15, -45, 0];
	this.camera.translation = [0, 0, -10];
	this.camera.tmp = [0, 0, 0];

}

Layout.prototype.setView = function(width,height, eye){
  perspective(this.projectionMatrix,55,width/height,0.1,1000);

  var camera = this .camera;
  var model = this.modelMatrix;
  var s = this.scratchMatrix;
  var s2 = this.scratchMatrix2;

  model.set(this.identityMatrix);

  camera.tmp[0] = camera.translation[0]
  camera.tmp[1] = camera.translation[1]
  camera.tmp[2] = camera.translation[2]
  translateMatrix(s, camera.tmp)
  multiplyMat(model, s, s2)

  if (camera.rotation[0] != 0) {
    xRotationMatrix(s, camera.rotation[0]*Math.PI/180)
    multiplyMat(model, s, s2)
  }
  if (camera.rotation[1] != 0) {
    yRotationMatrix(s, camera.rotation[1]*Math.PI/180)
    multiplyMat(model, s, s2)
  }
  if (camera.rotation[2] != 0) {
    zRotationMatrix(s, camera.rotation[2]*Math.PI/180)
    multiplyMat(model, s, s2)
  }

  if (!rotationAround ){
    var xComp = Math.sin(camera.rotation[1] * Math.PI / 180)
    var zComp = Math.cos(camera.rotation[1] * Math.PI / 180)
    camera.tmp[0] = -eye * .06 * zComp + camera.translation[0]
    camera.tmp[1] = camera.translation[1]
    camera.tmp[2] = -eye * .06 * xComp + camera.translation[2]
    translateMatrix(s, camera.tmp)
    multiplyMat(model, s, s2)
  }

  this.lastCameraMatrix.set(model)
  this.lastProjectionMatrix.set(this.projectionMatrix)

}

Layout.prototype.translateCamera = function(deltaVec){
  var angle = this.camera.rotation[1]*Math.PI/180;
	var x = deltaVec[0] * Math.cos(angle) + deltaVec[2] * Math.sin(angle);
	var z = deltaVec[0] * Math.sin(angle) - deltaVec[2] * Math.cos(angle);

  this.camera.translation[0] -= x * 0.01;
  this.camera.translation[1] -= deltaVec[1] * 0.01;
  this.camera.translation[2] -= z * 0.01;
}

Layout.prototype.transparency = function (gl, flag) {
  if (flag) {
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)		// for premulitplied alpha textures
    gl.depthMask(false)
  } else {
    gl.disable(gl.BLEND)
    gl.depthMask(true)
  }
}

Layout.prototype.bindFramebuffer = function (gl, fb) {
  var oldBuffer = this.currentFramebuffer;
  this.currentFramebuffer = fb;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  return oldBuffer;
}

Layout.prototype.draw = function(gl){

  if( typeof this.grid === 'undefined'){
    this.grid = new Grid(gl);
  }

  gl.disable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
	gl.cullFace(gl.FRONT);
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
  gl.clearColor(28 / 255, 79 / 255, 110 / 255, 1.0);

  this.setView(gl.drawingBufferWidth, gl.drawingBufferHeight, 0);
  this.viewFrustrum.frustrumFromMatrix(this.modelMatrix);
  this.grid.draw(gl,this.projectionMatrix,this.modelMatrix);

  this.transparency(gl, true)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  particleSystem.manageSystem(this.modelMatrix, this.projectionMatrix);
  this.transparency(gl, false)
  drawGeometry(this.modelMatrix, this.projectionMatrix);

}
