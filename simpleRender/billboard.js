// billboard.js

// initialize the global BillboardManager object
BillboardManager = {
	who: "BillboardManager",
	billboards: [],
	shader: false,
	defaultTexture: false,
	attributeStrings: ["uvs", "spriteCorners", "pos"],
	oneColorAttributeStrings: ["uvs", "spriteCorners", "pos"],
}

/*
	@purpose: initialize all shaders which could possibly be used to draw any billboard objects
	@param gl: the current webgl context of the scene
*/
BillboardManager.createShader = function (gl) {
	let shader = createProgram(gl, this.vertexCode, this.fragmentCode);
	let oneColorShader = createProgram(gl, this.oneColorVertexCode, this.oneColorFragmentCode);
	let locations = {};
	let attributes = {};
	let oneColorLocations = {};
	let oneColorAttributes = {};

	// regular render locations and attributes
	attributes.uvs = gl.getAttribLocation(shader, "uvs");
	attributes.spriteCorners = gl.getAttribLocation(shader, "rotatedCorner");
	attributes.pos = gl.getAttribLocation(shader, "position");
	locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
	locations.texturemap = gl.getUniformLocation(shader, "texturemap");
	locations.ucolor = gl.getUniformLocation(shader, "ucolor");
	locations.mv_matrix = gl.getUniformLocation(shader, "mvMatrix");
	locations.pixelRatio = gl.getUniformLocation(shader, "pixelRatio");

	// single color locations adn atributes
	oneColorAttributes.uvs = gl.getAttribLocation(oneColorShader, "uvs");
	oneColorAttributes.spriteCorners = gl.getAttribLocation(oneColorShader, "rotatedCorner");
	oneColorAttributes.pos = gl.getAttribLocation(oneColorShader, "position");
	oneColorLocations.mvp_matrix = gl.getUniformLocation(oneColorShader, "mvpMatrix");
	oneColorLocations.texturemap = gl.getUniformLocation(oneColorShader, "texturemap");
	oneColorLocations.ucolor = gl.getUniformLocation(oneColorShader, "ucolor");
	oneColorLocations.mv_matrix = gl.getUniformLocation(oneColorShader, "mvMatrix");
	oneColorLocations.pixelRatio = gl.getUniformLocation(oneColorShader, "pixelRatio");

	this.attributes = attributes;
	this.locations = locations;
	this.shader = shader;
	this.oneColorAttributes = oneColorAttributes;
	this.oneColorLocations = oneColorLocations;
	this.oneColorShader = oneColorShader;
	this.gl = gl;
	this.genDefaultTexture();
}

/*
	@purpose: modify the current state of the webgl context in order to prepare for drawing of stenciled billboards
*/
BillboardManager.enableStencil = function () {
	gl.disable(gl.CULL_FACE);
	gl.disable(gl.DEPTH_TEST);
	gl.colorMask(false, false, false, false);
	gl.depthMask(false);
	gl.enable(gl.STENCIL_TEST);
	gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
	gl.stencilFunc(gl.ALWAYS, 1, 0xff);  // write 1 into stencil buffer for all object fragments 
	gl.stencilMask(0xff);
}

/*
	@purpose: change the state of the webgl context back to the state before any stenciled billboards are drawn
*/
BillboardManager.disableStencil = function (depthMask) {
	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);
	gl.colorMask(true, true, true, true);
	gl.disable(gl.STENCIL_TEST);
	gl.depthMask(depthMask);
}

/*
	@purpose: draw all the billboard objects which are contained within the billboard manager 
	@param gl: the current webgl context of the scene 
	@param view: the current view matrix of the scene's camera 
	@param projection: the current projection matrix of the scene's camera
*/
BillboardManager.drawBillboards = function (gl, view, projection) {
	if (this.shader === false) { // initialize any necessary shaders for billboard display
		this.createShader(gl);
	}
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
	this.lastView = view;
	this.lastProj = projection;
	let len = this.billboards.length;
	let newBillboards = [];
	let color = [1, .6, 0];
	console.debug("LEN ", len);
	for (var i = 0; i < len; i++) {
		let b = this.billboards[i];
		if (b.mustRemove === false) {
			if (b.selected) {
				b.drawOneColor(gl, view, projection, color);
				b.draw(gl, view, projection);
			} else {
				b.draw(gl, view, projection);
			}
			newBillboards.push(b);
		}
	}
	this.billboards = newBillboards;
}

/*	
	@purpose: initialize a webgl buffer which can continually be used for billboard attribute drawing
	@param gl: the current webgl context of the scene
*/
BillboardManager.initializeBuffer = function (gl) {
	let buffer = gl.createBuffer();
	return buffer;
}

BillboardManager.assignBuffer = function (buffer, bufferType, data, attribute, stride, type) {
	var gl_type;
	var DataType;
	doPointer = true;
	if (type === "float") {
		DataType = Float32Array;
		gl_type = "FLOAT"
	} else if (type === "u_int") {
		DataType = Uint16Array;
		doPointer = false;
	}
	gl.bindBuffer(gl[bufferType], buffer);
	gl.bufferData(gl[bufferType], new DataType(data), gl.DYNAMIC_DRAW);
	if (doPointer === true) {
		gl.vertexAttribPointer(attribute, stride, gl[gl_type], false, 0, 0);
	}
}

/*
	@purpose: disable any shader attributes after a billboard draw
	@param attributes: the set of attributes being used in a draw 
	@param set: a set of strings which represent the attribute names
*/
BillboardManager.disableAttributes = function (attributes, set) {
	var manager = BillboardManager;
	var gl = manager.gl;
	var len = set.length;
	for (var i = 0; i < len; i++) {
		gl.disableVertexAttribArray(attributes[set[i]]);
	}
}

/*
	@purpose: enable any shader attributes before a billboard draw
	@param attributes: the set of attributes being used in a draw
	@param set: a set of strings which represent the attribute names
*/
BillboardManager.enableAttributes = function (attributes, set, check) {
	var manager = BillboardManager;
	var gl = manager.gl;
	var len = set.length;
	for (var i = 0; i < len; i++) {
		gl.enableVertexAttribArray(attributes[set[i]]);
	}
}
BillboardManager.addTexturedBillboard = function (gl, pos, scale, rot, tex, dim = [1, 1]) {
	if (tex) {
		gl = gl || this.gl;
		let b = new Billboard(gl, pos, scale, rot, dim);
		this.billboards.push(b);
		b.texture = tex;
		return b;
	}
}

BillboardManager.addDefaultBillboard = function (gl, pos = [0,5,0], scale, rot, path, dim = [1, 1]) {
	gl = gl || this.gl;
	let b = new Billboard(gl, pos, scale, rot, dim);
	b.texture = this.defaultTexture;
	this.billboards.push(b);
	return b;
}

BillboardManager.addBillboard = function (gl, pos, scale, rot, path, dim = [1, 1]) {
	gl = gl || this.gl;
	let b = new Billboard(gl, pos, scale, rot, dim);
	this.billboards.push(b);
	b.texture = loadUncompressedTexture(gl, path);
	return b;
}

BillboardManager.addSpawn = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/SPAWNplayer.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

BillboardManager.addLightPoint = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/LIGHTpoint.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

BillboardManager.addLightSpot = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/LIGHTspot.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

BillboardManager.addLightInfinite = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/LIGHTinfinate.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

BillboardManager.addFog = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/FOG.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

BillboardManager.addBlankActor = function (gl, pos, scale, rot, dim = [1, 1]) {
	let path = "/lib/engine/icons/BLANKactor.svg";
	return this.addBillboard(gl, pos, scale, rot, path, dim);
}

// simple test code to display some placeholder tool billboards
BillboardManager.testBillboardTools = function (gl) {
	gl = gl || this.gl;
	this.addSpawn(gl, [-5, 5, 0]);
	this.addBlankActor(gl, [-3, 5, 0]);
	this.addFog(gl, [-1, 5, 0]);
	this.addLightSpot(gl, [1, 5, 0]);
	this.addLightPoint(gl, [3, 5, 0]);
	this.addLightInfinite(gl, [5, 5, 0]);
}

/*
	@purpose: draw all the billboards to the screen each having its own unique color, making it possibly to 
		quickly check what billboard was chosen by the user given the color of the pixel they select 
	@param gl: the current webgl context of the scene 
*/
BillboardManager.drawSelectionPixels = function (gl) {
	let pixelR = 1;
	let pixelG = 0;
	let pixelB = 0;
	gl.enable(gl.BLEND)
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)	// for non-premultiplied alpha textures
	gl.depthMask(false)
	let len = this.billboards.length;
	for (var i = 0; i < len; i++) {
		let b = this.billboards[i];
		let pixelID = pixelR + pixelG * 256 + pixelB * 256 * 256;
		this.billboardColors[pixelID] = i;
		let color = []; //find unique color per billboard based on its place in the billboards array
		color[0] = pixelR / 255.0;
		color[1] = pixelG / 255.0;
		color[2] = pixelB / 255.0;
		if (pixelR < 255) {
			pixelR++;
		} else if (pixelG < 255) {
			pixelG++;
		} else if (pixelB < 255) {
			pixelB++;
		}
		b.drawOneColor(gl, this.lastView, this.lastProj, color);
	}
}

/*
	@purpose: determine which billboard is being selected based on the x,y coordinates of a mouse interaction 
	@param gl: the current webgl context of the scene 
	@param viewportx: the current x coordinate of the user's mouse interaction 
	@param viewporty: the current y coordinate of the user's mouse interaction
*/
BillboardManager.findBillboardAtPixel = function (gl, viewportX, viewportY) {
	this.billboardColors = [];
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.SCISSOR_TEST);
	gl.enable(gl.CULL_FACE)
	gl.cullFace(gl.BACK)
	gl.depthFunc(gl.LESS);
	gl.scissor(viewportX, viewportY, 1, 1);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	this.drawSelectionPixels(gl); //draw the billboards each with a unique color
	let pixels = new Uint8Array(4);
	gl.readPixels(viewportX, viewportY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels); //read the color of the pixels at a given x,y coordinate combination
	gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
	gl.disable(gl.SCISSOR_TEST);
	let id = pixels[0] + pixels[1] * 256 + pixels[2] * 256 * 256; //reconstruct the id of the billboard from the color
	if (pixels[3] > 0 && id > 0) {
		this.billboards[id - 1].toggleSelected();
		return id - 1;
	}
	return -1;
}

/*
	@purpose: initialization of a new billboard object 
	@param gl: the current webgl context of the scene 
	@param pos: the three tuple vector representing the translation of the billboard in space 
	@param scale: the three tuple vector representing the scale of the billboard in space 
	@param rot: the three tuple vector representing the rotation of the billboard in space
*/
function Billboard(gl, pos, scale, rot, dim = [1, 1]) {
	this.who = "Billboard";
	this.color = [1, 1, 1];
	this.texture = BillboardManager.defaultTexture;
	this.mustRemove = false; // flag to indicate when to remove a billboard from the scene
	this.locations = false;
	this.attributes = false;
	this.dim = dim;

	this.selected = false;

	// transform data
	this.position = pos || [0, 0, 0];
	this.scale = scale || [.8, .8, .8];
	this.rotation = rot || [0, 0, 0];
	// required matrix math variables
	this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	this.s1 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	this.s2 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	this.s3 = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	this.modifyModelMatrix();

	// this attribute data
	this.indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
	this.corners = new Float32Array([-1 * dim[0], -1 * dim[1], 1 * dim[0], -1 * dim[1], 1 * dim[0], 1 * dim[1], -1 * dim[0], 1 * dim[1]]);
	this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
	this.positions = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

	let parent = BillboardManager;
	// init attribute buffers
	this.indicesBuffer = parent.initializeBuffer(gl);
	this.cornersBuffer = parent.initializeBuffer(gl);
	this.uvsBuffer = parent.initializeBuffer(gl);
	this.posBuffer = parent.initializeBuffer(gl);
}

/*
	@purpose: toggle whether a billboard has been selected and whether the billboard's highlight is being drawn
*/
Billboard.prototype.toggleSelected = function () {
	this.selected = !this.selected;
}

/*
	@purpose: mark a billboard for removal from the scene's billboard manager
*/
Billboard.prototype.remove = function () {
	this.mustRemove = true;
}

/*
	@purpose:calculate the mvp and mv matrices for the billboard based on the scene's perspective and view matrices 
	@param view: the current view matrix of the scene 
	@param proj: the current projection matrix of the scene
	@param model: the model matrix of the billboard itself
*/
Billboard.prototype.getMatrices = function (view, proj, model) {
	var rv = [];
	let s1 = this.s1;
	let s2 = this.s2;
	let scratch = this.s3;
	s1.set(proj);
	s2.set(view);
	matrixMultiply(s2, model, scratch);
	rv[0] = s2;
	matrixMultiply(s1, s2, scratch);
	rv[1] = s1;
	return rv;
}

/*
	@purpose: calculate a rotation matrix for a billboard should it have any rotation values 
	@param rot: three tuple vector representing how a matrix should be rotated around the x,y,z axes 
	@param modelMatrix: the current model matrix of the billboard 
*/
Billboard.prototype.rotateMatrix = function (rot, modelMatrix) {
	let s1 = new Float32Array(16);
	let s2 = new Float32Array(16);
	if (rot[1] != 0) { //y rotation matrix
		yRotationMatrix(s1, rot[1]);
		matrixMultiply(modelMatrix, s1, s2);
	}
	if (rot[0] != 0) { //x rotation matrix
		xRotationMatrix(s1, rot[0]);
		matrixMultiply(modelMatrix, s1, s2);
	}
	if (rot[2] != 0) { //z rotation matrix
		zRotationMatrix(s1, rot[2]);
		matrixMultiply(modelMatrix, s1, s2);
	}
	return modelMatrix;
}

/*
	@purpose: recalculate the model matrix for the billboard given the billboard's transform values 
		and the view/projection matrices of the scene's camera
*/
Billboard.prototype.modifyModelMatrix = function () {
	let pos = this.position;
	let scale = this.scale
	let rot = this.rotation;
	rot[0] *= (Math.PI / 180);
	rot[1] *= (Math.PI / 180);
	rot[2] *= (Math.PI / 180);

	let smat = new Float32Array(16);
	let scratch = new Float32Array(16);

	translateMatrix(this.modelMatrix, pos);
	scaleMatrix(smat, scale);
	matrixMultiply(this.modelMatrix, smat, scratch);
	this.modelMatrix = this.rotateMatrix(rot, this.modelMatrix);
}

/*
	@purpose: calculate the distance of the billboard from the translation of the camera in order to 
		determine how to scale the billboard as the user approaches the center of the billboard's model matrix
*/
Billboard.prototype.getCameraDistance = function () {
	let h = 1080;
	let w = 1920;
	let t = app.camera.translation;
	let x = (-1 * t.x) - this.position[0];
	let y = (-1 * t.y) - this.position[1];
	let z = (-1 * t.z) - this.position[2];
	return Math.sqrt(x * x + y * y + z * z);
}

/*
	@purpose: draw a billboard with a singular color in order to make highlighting the billboard and 
		picking between them based on unique color more easily 
	@param gl: the current webgl context of the scene 
	@param view: the current view matrix of the scene's camera 
	@param projection: the current projection matrix of the scene's camera 
	@param color: the color which should be used to draw the pixels of the billboard 
*/
Billboard.prototype.drawOneColor = function (gl, view, projection, color) {
	let parent = BillboardManager;
	var rv = this.getMatrices(view, projection, this.modelMatrix);
	var mv_matrix = rv[0];
	var mvp_matrix = rv[1];
	gl.useProgram(parent.oneColorShader);
	let locations = parent.oneColorLocations;
	let attributes = parent.oneColorAttributes;
	let dist = this.getCameraDistance();
	var rval = 1;
	if (dist < 10) {
		rval = dist / 10;
	}
	rval = rval * 1.05;
	let ratio = [rval, rval];
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i(locations.texturemap, 0);
	gl.uniform3fv(locations.ucolor, color);
	gl.uniform2fv(locations.pixelRatio, ratio);

	// apply matrices
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.uniformMatrix4fv(locations.mv_matrix, false, mv_matrix);

	// assign attribute buffers
	parent.assignBuffer(this.posBuffer, "ARRAY_BUFFER", this.positions, attributes.pos, 3, "float");
	parent.assignBuffer(this.cornersBuffer, "ARRAY_BUFFER", this.corners, attributes.spriteCorners, 2, "float");
	parent.assignBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.uvs, attributes.uvs, 2, "float");
	parent.assignBuffer(this.indicesBuffer, "ELEMENT_ARRAY_BUFFER", this.indices, false, 0, "u_int");

	// draw triangles
	parent.enableAttributes(attributes, parent.oneColorAttributeStrings);
	gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	parent.disableAttributes(attributes, parent.oneColorAttributeStrings);
}

/*
	@purpose: draw the selected billboard in the scene 
	@param gl: the current webgl context of the scene 
	@param view: the current view matrix of the scene's camera 
	@param projection: the current projection matrix of the scene's camera 
*/
Billboard.prototype.draw = function (gl, view, projection) {
	let parent = BillboardManager;
	var rv = this.getMatrices(view, projection, this.modelMatrix);
	var mv_matrix = rv[0];
	var mvp_matrix = rv[1];
	gl.useProgram(parent.shader);
	let locations = parent.locations;
	let attributes = parent.attributes;
	let dist = this.getCameraDistance();
	var rval = 1;
	if (dist < 10) {
		rval = dist / 10;
	}
	let ratio = [rval, rval];
	// apply uniform locations
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.uniform1i(locations.texturemap, 0);
	gl.uniform3fv(locations.ucolor, this.color);
	gl.uniform2fv(locations.pixelRatio, ratio);

	// apply matrices
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.uniformMatrix4fv(locations.mv_matrix, false, mv_matrix);

	// assign attribute buffers
	parent.assignBuffer(this.posBuffer, "ARRAY_BUFFER", this.positions, attributes.pos, 3, "float");
	parent.assignBuffer(this.cornersBuffer, "ARRAY_BUFFER", this.corners, attributes.spriteCorners, 2, "float");
	parent.assignBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.uvs, attributes.uvs, 2, "float");
	parent.assignBuffer(this.indicesBuffer, "ELEMENT_ARRAY_BUFFER", this.indices, false, 0, "u_int");

	// draw triangles
	parent.enableAttributes(attributes, parent.attributeStrings);
	gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
	parent.disableAttributes(attributes, parent.attributeStrings);
}

// SHADER AND TEXTURE CODE FOR THE BILLBOARD MANAGER

BillboardManager.fragmentCode =
	`precision mediump float;
varying vec2 textVarying;

uniform sampler2D texturemap;
uniform vec3 ucolor;

void main (void){
    vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
    vec4 tcolor = texture2D(texturemap,textFlipped);
	gl_FragColor = tcolor*vec4(ucolor.xyz, 1.0);

}`;

BillboardManager.oneColorFragmentCode =
	`precision mediump float;
varying vec2 textVarying;

uniform sampler2D texturemap;
uniform vec3 ucolor;

void main (void){
	vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
    vec4 tcolor = texture2D(texturemap,textFlipped);
	gl_FragColor = vec4(ucolor.xyz, tcolor.a);
}`;


BillboardManager.vertexCode =
	`precision mediump float;
uniform mat4 mvpMatrix;
uniform mat4 mvMatrix;
uniform vec2 pixelRatio;

attribute vec3 position;
attribute vec2 rotatedCorner;
attribute vec2 uvs;

varying vec2 textVarying;

void main (){
    vec3 axis1 = vec3(mvMatrix[0][0], mvMatrix[1][0], mvMatrix[2][0]);
    vec3 axis2 = vec3(mvMatrix[0][1], mvMatrix[1][1], mvMatrix[2][1]);
    vec3 corner = rotatedCorner.x*axis1*pixelRatio.x + rotatedCorner.y*axis2*pixelRatio.y + position.xyz;
    vec4 final = vec4(corner,1.0);
    gl_Position = mvpMatrix * final;
    textVarying = uvs;
}`;

BillboardManager.oneColorVertexCode =
	`precision mediump float;
uniform mat4 mvpMatrix;
uniform mat4 mvMatrix;
uniform vec2 pixelRatio;

attribute vec3 position;
attribute vec2 rotatedCorner;
attribute vec2 uvs;

varying vec2 textVarying;

void main (){
    vec3 axis1 = vec3(mvMatrix[0][0], mvMatrix[1][0], mvMatrix[2][0]);
    vec3 axis2 = vec3(mvMatrix[0][1], mvMatrix[1][1], mvMatrix[2][1]);
    vec3 corner = rotatedCorner.x*axis1*pixelRatio.x + rotatedCorner.y*axis2*pixelRatio.y + position.xyz;
    vec4 final = vec4(corner,1.0);
    gl_Position = mvpMatrix * final;
    textVarying = uvs;
}`;


BillboardManager.defaultTextureString =
	`
x = 128;
y = 128;
innerRad = 70;
outerRad = 100;
ctx.lineWidth = 12;
ctx.strokeStyle="white";
ctx.fillStyle="white";
ctx.beginPath();
ctx.arc(x,y,innerRad,0,2*Math.PI)
ctx.closePath();
ctx.fill();
`;

function drawCanvasTexture(contextString, width, height) {
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");
	ctx.canvas.width = width;
	ctx.canvas.height = height;
	eval(contextString);
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return texture;
}

BillboardManager.genDefaultTexture = function () {
	var str = this.defaultTextureString;
	this.defaultTexture = drawCanvasTexture(str, 256, 256);
}
