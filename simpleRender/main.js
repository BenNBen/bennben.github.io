
function matrixTimesVector3(ovector, m, vector) {
  var v1 = vector[0];
  var v2 = vector[1];
  var v3 = vector[2];


  ovector[0] = m[0] * v1 + m[4] * v2 + m[8] * v3;
  ovector[1] = m[1] * v1 + m[5] * v2 + m[9] * v3;
  ovector[2] = m[2] * v1 + m[6] * v2 + m[10] * v3;
}

function matrixTimesVector3offset(ovector, m, vector, outOffset, inOffset) {
  var v1 = vector[0 + inOffset];
  var v2 = vector[1 + inOffset];
  var v3 = vector[2 + inOffset];


  ovector[0 + outOffset] = m[0] * v1 + m[4] * v2 + m[8] * v3 + m[12];
  ovector[1 + outOffset] = m[1] * v1 + m[5] * v2 + m[9] * v3 + m[13];
  ovector[2 + outOffset] = m[2] * v1 + m[6] * v2 + m[10] * v3 + m[14];
}



function perspective(m, fovy, aspect, zNear, zFar) {
  var ymax = zNear * Math.tan(fovy * Math.PI / 360)
  var ymin = -ymax
  var xmin = ymin * aspect
  var xmax = ymax * aspect

  var A = (xmax + xmin) / (xmax - xmin)
  var B = (ymax + ymin) / (ymax - ymin)
  var C = -(zFar + zNear) / (zFar - zNear)
  var D = -2 * (zFar * zNear) / (zFar - zNear)
  var E = 2 * zNear / (xmax - xmin)
  var F = 2 * zNear / (ymax - ymin)

  m[0] = E
  m[1] = 0
  m[2] = A
  m[3] = 0

  m[4] = 0
  m[5] = F
  m[6] = B
  m[7] = 0

  m[8] = 0
  m[9] = 0
  m[10] = C
  m[11] = -1

  m[12] = 0
  m[13] = 0
  m[14] = D
  m[15] = 0
}

vrMultiview = false;
rotationAround = true;
document.addEventListener('contextmenu', event => event.preventDefault());
mouseButtonLeft = 1;
mouseButtonMiddle = 2;
mouseButtonRight = 3;
clickX = false;
clickY = false;
function screenRatio(){
  let canvas = document.getElementById('screen');
  return canvas.width/screen.width;
}

mouseDown = false;
function click(event, id){
  var ratio = screenRatio();
  var x = event.pageX * ratio;
  var y = event.pageY * ratio;
  clickX = x;
  clickY = y;
  mouseDown = true;
}

function release(event, id){
  var x = event.pageX;
  var y = event.pageY;
  mouseDown = false;
}

function touchMove(event, id){
  event.preventDefault();
  var ratio = screenRatio();
  let touches = event.touches;
  var x = touches[0].pageX * ratio;
  var y = touches[0].pageY * ratio;
  var deltax = x - clickX;
  var deltay = y - clickY;
  var sensitivity = .5;
  let rot = app.camera.rotation;
  rot.x += deltay * sensitivity;
  if (rot.x < 0) {
    rot.x += 360;
  } else if (rot.x > 360) {
    rot.x -= 360;
  }
  rot.y += deltax * sensitivity;
  if (rot.y < 0) {
    rot.y += 360;
  } else if (rot.y > 360) {
    rot.y -= 360;
  }
  clickX = x;
  clickY = y;
}

function hover(event, id){
  var ratio = screenRatio();
  var x = event.pageX * ratio;
  var y = event.pageY * ratio;

  if(window['clickX']==false || mouseDown === false){
    return;
  }

  var deltax = x - clickX;
  var deltay = y - clickY;
  var sensitivity = .5;
  let rot = app.camera.rotation;
  let mouseButton = event.which;
  if (mouseButton === mouseButtonMiddle) { //click middle mouse button to pan up and down
      app.TranslateCamera([-deltax, deltay, 0]);
  } else if (mouseButton === mouseButtonLeft) { //click left mouse button to rotate
      rot.x += deltay*sensitivity;
      if (rot.x < 0) {
          rot.x += 360;
      } else if (rot.x > 360) {
          rot.x -= 360;
      }
      rot.y += deltax*sensitivity;
      if (rot.y < 0) {
          rot.y += 360;
      } else if (rot.y > 360) {
          rot.y -= 360;
      }
  } else if (mouseButton === mouseButtonRight) { //click right mouse button to zoom in and out
      app.TranslateCamera([0, 0, deltax+deltay]);
  }
  clickX = x;
  clickY = y;
}

function keydown(kevent){
  if(kevent.code === "KeyA"){
    addRandomObject();
    spriteManager.sprites[2].texturePath = "spriteTextures/star.png"
  }
  if(kevent.code === "F9"){
    rotationAround = !rotationAround;
    if(rotationAround === true){
      app.Init([0,0,-10], [15,-45,0]);
    }
  }
  if(!rotationAround){
    var delta = 20;
    if(kevent.code == "KeyW"){
      app.translateCamera([0, 0, delta]);
    }
    if (kevent.code == "KeyS") {
      app.translateCamera([0, 0, -delta]);
    }
    if (kevent.code == "KeyA") {
      app.translateCamera([-delta, 0, 0]);
    }
    if (kevent.code == "KeyD") {
      app.translateCamera([delta, 0, 0]);
    }
  }
}

function addListeners(canvas){
    canvas.addEventListener("mousedown", click, false);
    canvas.addEventListener("mouseup", release, false);
    canvas.addEventListener("mousemove", hover, false);
    canvas.addEventListener("touchmove", touchMove, false);
    document.addEventListener("keydown", keydown);
}

__WEB_GL_TYPE = false;
function getWebGLContext(canvas){
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    console.error("WebGL 2 not available");
  }else{
    console.log("WEBGL 2 FOUND");
    __WEB_GL_TYPE = 2;
    return gl;
  }
  gl = WebGLUtils.create3DContext(canvas, { clearBeforeRender: false });
  if (!gl) {
    console.log("NO GL");
    return;
  }else{
    console.log("WEBGL 1 FOUND");
    __WEB_GL_TYPE = 1;
    return gl;
  }
}

coneToDraw = false;
capsuleToDraw = false;
sphereToDraw = false;
cylinderToDraw = false;
cubeToDraw = false;
arrowToDraw = false;
pathToDraw = false;

function addBlock(xDim, yDim, zDim, offset){
  xDim = xDim || 2;
  yDim = yDim || 2;
  zDim = zDim || 2;
  offset = offset || [0,0,0];
  var verts = [-xDim/2, 0, -zDim/2, xDim/2, 0, -zDim/2, xDim/2, 0, zDim/2, -xDim/2, 0, zDim/2, -xDim/2, yDim, -zDim/2, xDim/2, yDim, -zDim/2, xDim/2, yDim, zDim/2, -xDim/2, yDim, zDim/2];
  var indices = [0,1,2,2,3,0,4,5,6,6,7,4,0,1,4,4,5,1,1,2,5,5,6,2,2,3,6,6,7,3,3,0,7,7,4,0];
  for(var i =0;i<verts.length;i+=3){
    verts[i] += offset[0];
    verts[i+1] += offset[1];
    verts[i+2] += offset[2];
  }

  let color = [Math.random(), Math.random(), Math.random(), 1];
  var obj = new Mesh(gl, color);
  obj.LoadFromData(verts, indices);
  __meshes.push(obj);
}

__meshes = [];
__randomObjects = [];
function addMesh(obj){
  var obj = new Mesh(gl, obj.positions, obj.cells);
  __meshes.push(obj);
}

function addRandomObject(){
  var num = Math.floor(Math.random() * 5);
  let obj = false;
  switch(num){
    case 0:
      obj = new Cube(gl);
      break;
    case 1:
      obj = new Capsule(gl);
      break;
    case 2:
      obj = new Sphere(gl);
      break;
    case 3:
      obj = new Cone(gl);
      break;
    case 4:
      obj = new Cylinder(gl);
      break;
    default:
      break;
  }
  let pos = new Vector3(-10 + Math.random() * 20 , -10 + Math.random() * 20, 0);
  obj.color = [Math.random(), Math.random(), Math.random(), 1];
  obj.ModifyModelMatrix(pos);
  __randomObjects.push(obj);
}

window.setInterval(changeObjects, 2000);

function changeObjects(){
 
}

function drawMeshes(gl, mat){
  let len = __meshes.length;
  for(var i=0;i<len;i++){
    var obj = __meshes[i];
    obj.Draw(gl, mat);
  }
}

function drawRandomObjects(gl, mat){
  for(var i = 0;i<__randomObjects.length;i++){
    let obj = __randomObjects[i];
    if(!obj.yRot) obj.yRot = 0;
    obj.yRot++;
    obj.ModifyModelMatrix(obj.pos, new Vector3(0, obj.yRot, obj.yRot));
    obj.DrawWireFrame(gl, mat, obj.color);
  }
}

function displayCube(gl, mat, dimension){
  if(!cubeToDraw){
    cubeToDraw = new Cube(gl);
  }
  cubeToDraw.DrawWireFrame(gl, mat, [.25, .75, 1, 1]);
}

function displayCapsule(gl, mat) {
  var color = [1, 0, 0, 1];
  if (!capsuleToDraw) {
    capsuleToDraw = new Capsule(gl);
    capsuleToDraw.ModifyModelMatrix(new Vector3(-1, 0, 0))
  }
  capsuleToDraw.DrawWireFrame(gl, mat, color);
};

function displaySphere(gl, mat) {
  var color = [0, 0, 1, 1];
  if (!sphereToDraw) {
    sphereToDraw = new Sphere(gl);
    sphereToDraw.ModifyModelMatrix(new Vector3(-2, 0, 0))
  }
  sphereToDraw.DrawWireFrame(gl, mat, color);
};

function displayCylinder(gl, mat) {
  if (!cylinderToDraw) {
    cylinderToDraw = new Cylinder(gl);
    cylinderToDraw2 = new Cylinder(gl, 7);
    cylinderToDraw2.ModifyModelMatrix(new Vector3(5, 0, 0), new Vector3(0,0,0), new Vector3(4, 4, 4))
  }
  cylinderToDraw.DrawWireFrame(gl, mat, [1,0,1,1]);
  cylinderToDraw2.DrawWireFrame(gl, mat);
}
function displayCone(gl, mat) {
  if (!coneToDraw) {
    coneToDraw = new Cone(gl, 12);
    coneToDraw.ModifyModelMatrix(new Vector3(1, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 1, 1))

  }
  coneToDraw.DrawWireFrame(gl, mat, [1,.7,0,1]);
}
function displayArrow(gl, mat, color){
  color = color || [1,1,1,1];
  if(!arrowToDraw){
    arrowToDraw = new DrawArrow(gl);
  }
  arrowToDraw.draw(gl, mat, color);
}




function testCode(){
  beg = [-10, 0, 0];
  end = [10, 0, 0]
  /*pathToDraw.addStep([5, 0, 0]);
  pathToDraw.addStep([5, 0, 5]);
  pathToDraw.addStep([2, 0, 6]);
  pathToDraw.addStep([10, 0, 10]);
  pathToDraw.addStep([10, 0, 0]);
  pathToDraw.addStep([-5, 0, -5]);
  pathToDraw.addStep([-10, 0, 0]);
  pathToDraw.addStep([-1, 0, -1]);
  pathToDraw.addStep([-1, 0, 1]);*/
  //pathToDraw.addStep(beg);
  //pathToDraw.addStep(end);
}

function displayPath(gl, mat, color){
  color = color || [1, .7, 0, 1];
  if(!pathToDraw){
    pathToDraw = new DrawPath(gl);
  }
  pathToDraw.draw(gl, mat, color);
}

const drawGeometry = (model, proj) =>{
  var s1 = new Matrix4x4();
  var s2 = new Matrix4x4();
  s1.Set(proj);
  s1 = s1.Mul(model);
  displayCylinder(gl, s1);
  displayCone(gl, s1);
  displaySphere(gl, s1);
  displayCapsule(gl, s1);
  displayCube(gl, s1);
  drawRandomObjects(gl, s1);
  drawMeshes(gl, s1);
}

XPOS = 0;
SCALE = 3;
XLIMIT = 5;
XINCR = .25;
XROT = 0;
const adjustCube = () =>{
  XPOS += XINCR;
  if(Mathf.abs(XPOS) >= XLIMIT){
    XINCR *= -1;
  }
  XROT += 1;
  if(XROT > 360) XROT -= 360;
  if(!cubeToDraw) return;
  cubeToDraw.ModifyModelMatrix(new Vector3(XPOS, XPOS/2, 0), new Vector3(XROT, -XROT, 0), new Vector3(SCALE + XPOS/2, SCALE + XPOS/2, SCALE + XPOS/2));
  coneToDraw.ModifyModelMatrix(coneToDraw.pos, new Vector3(0, XROT, 0));
  cylinderToDraw.ModifyModelMatrix(new Vector3(-5,0,0), new Vector3(XROT * 2, 0, 0));
  cylinderToDraw2.ModifyModelMatrix(cylinderToDraw2.pos, new Vector3(0, XROT*3, 0), cylinderToDraw2.scale);
  capsuleToDraw.ModifyModelMatrix(new Vector3(-1, 2, 0), new Vector3(90, 90, 0), new Vector3(SCALE / 2 + XPOS / 4, SCALE / 2 + XPOS / 4, SCALE / 2 + XPOS / 4));
  sphereToDraw.ModifyModelMatrix(new Vector3(-2, XPOS/8, 0), new Vector3(XROT, XROT, 0));
}

window.setInterval(adjustCube, 33);

function resize() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let context = gl;
  devicePixelRatio = window.devicePixelRatio || 1,
    backingStoreRatio = context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1,

  ratio = devicePixelRatio / backingStoreRatio;
  let autoResFullWidth = width / ratio;
  let autoResFullHeight = height / ratio;
  let autoResLogicalWidth = width;
  let autoResLogicalHeight = height;
  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;
  canvas.width = autoResFullWidth;
  canvas.height = autoResFullHeight;
  gl.canvas.style.width = autoResLogicalWidth + 'px';
  gl.canvas.style.height = autoResLogicalHeight + 'px';
  if(Math.abs(window.orientation) === 90){
    gl.canvas.width = window.innerHeight;
    gl.canvas.height = window.innerWidth;
    canvas.width = autoResFullHeight;
    canvas.height = autoResFullWidth;
    gl.canvas.style.width = autoResLogicalHeight + 'px';
    gl.canvas.style.height = autoResLogicalWidth + 'px';
  }
}

const addSprites = (gl) =>{
    for(let i = 0; i < 5; i++){
        let s = spriteManager.AddDefault(gl, [-2 + i, i, 0]);
        if(i %2 == 0){
          s.color = [1/i,0,1/i]
        }
    }
}


const addFloorBlocks = () =>{
  var dim = 10;
  for(var i =0;i<dim;i++){
    for(var j=0;j<dim;j++){
      addBlock(1,1,1, [-(dim/2)+i, -1, -(dim/2)+j])
    }
  }
}
function postRedisplay(){
  
}


function main(){

  canvas = document.getElementById('screen');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  if(!canvas){
    console.log("NO CANVAS");
    return;
  }
  WEBGL2 = false;
  gl = getWebGLContext(canvas);
  if(!gl){
    console.log("NO GL");
    return;
  }
  WebGLDebugUtils.init(gl);
  spriteManager = new SpriteManager();
  spriteManager.Init(gl);
  addSprites(gl);
  addFloorBlocks();
  addListeners(canvas);
  app = new App();
  app.gl = gl;
  app.Init();
  MESH_MANAGER = new MeshManager(gl);
  var tickHandler = function(){
    app.Draw(gl);
  }

  tickHandler();
  window.setInterval(tickHandler,16);

}
