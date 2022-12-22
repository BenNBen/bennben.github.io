// uidraw.js -- helper functions for drawing UI elements

uidraw = {initialized:false};

uidraw.init = function (gl) {
	if (uidraw.initialized) {
		return;
	}
	uidraw.initialized = true;
	uidraw.gl = gl;
	uidraw.initDrawRectangle(gl);
	uidraw.initDrawTexture(gl);
	uidraw.initDrawUVeditor(gl); //drawing method for an interactable uvEditor
	uidraw.initDrawScrollBar(gl) //drawing method for an interactable scrollbar
	uidraw.mvp_matrix = new Float32Array(16);
	uidraw.white = new Float32Array([1, 1, 1, 1]);
};

uidraw.setMVP = function (mvp) {
	uidraw.mvp_matrix.set(mvp);
};


uidraw.initDrawRectangle = function (gl) {
	var vertexCode =
	'precision highp float;\n' +
	'precision highp int;\n' +
	'uniform mat4 mvp_matrix;\n' +
	'attribute vec2 position;\n' +
	'\n' +
	'void main()\n' +
	'{\n' +
	'	vec4 final = vec4( position.x, position.y, 0.0, 1.0);\n' +
	'	gl_Position = mvp_matrix*final;\n' +
	'}\n';

	var fragmentCode =
	'precision highp float;\n' +
	'precision highp int;\n' +
	'uniform vec4 rcolor;\n' +
	'\n' +
	'void main (void) \n' +
	'{\n' +
	'	gl_FragColor = rcolor;\n' +
	'}\n';

	uidraw.dr = {};
	var dr = uidraw.dr;

	var program = createProgram(gl, vertexCode, fragmentCode);
	var locations = {};
	dr.locations = locations;
	dr.program = program;
	locations.mvp_matrix = gl.getUniformLocation(program, 'mvp_matrix');
	locations.color = gl.getUniformLocation(program, 'rcolor');

	var attributes = {};
	dr.attributes = attributes;
	attributes.position = gl.getAttribLocation(program, 'position');

	dr.display_positions = new Float32Array(8);
	dr.display_indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
	dr.display_uvs = new Float32Array([0, 1,  1, 1,  1, 0,  0, 0]);

	dr.display_positionsVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	dr.display_indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dr.display_indices, gl.STATIC_DRAW);

};


uidraw.drawColorRectangle = function (x, y, w, h, color) {
	var dr = uidraw.dr;
	var gl = uidraw.gl;
	var mvp_matrix = uidraw.mvp_matrix;

	dr.display_positions[0] = x;
	dr.display_positions[1] = y;
	dr.display_positions[2] = x + w;
	dr.display_positions[3] = y;
	dr.display_positions[4] = x + w;
	dr.display_positions[5] = y + h;
	dr.display_positions[6] = x;
	dr.display_positions[7] = y + h;
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	var program = dr.program;
	var locations = dr.locations;
	var attributes = dr.attributes;

	gl.useProgram(program);
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.uniform4fv(locations.color, color);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.position);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.drawElements(gl.TRIANGLES, dr.display_indices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.disableVertexAttribArray(attributes.position);
};

uidraw.initDrawTexture = function (gl) {
	var vertexCode =
	'precision highp float;\n' +
	'precision highp int;\n' +
	'uniform mat4 mvp_matrix;\n' +
	'attribute vec2 position;\n' +
	'attribute vec2 texturecoord;\n' +
	'varying vec2 textVarying;\n' +
	'\n' +
	'void main()\n' +
	'{\n' +
	'	vec4 final = vec4( position.x, position.y, 0.0, 1.0);\n' +
	'	textVarying = texturecoord;\n' +
	'	gl_Position = mvp_matrix*final;\n' +
	'}\n';

	var fragmentCode =
	'precision highp float;\n' +
	'precision highp int;\n' +
	'uniform sampler2D texturemap;\n' +
	'uniform vec4 rcolor;\n' +
	'varying vec2 textVarying;\n' +
	'\n' +
	'void main (void) \n' +
	'{\n' +
	'	vec4 tcolor = texture2D(texturemap, textVarying);\n' +
	'	gl_FragColor = tcolor*rcolor;\n' +
	'}\n';

	uidraw.dt = {};
	var dr = uidraw.dt;

	var program = createProgram(gl, vertexCode, fragmentCode);
	var locations = {};
	dr.locations = locations;
	dr.program = program;
	locations.mvp_matrix = gl.getUniformLocation(program, 'mvp_matrix');
	locations.texturemap = gl.getUniformLocation(program, 'texturemap');
	locations.color = gl.getUniformLocation(program, 'rcolor');

	var attributes = {};
	dr.attributes = attributes;
	attributes.position = gl.getAttribLocation(program, 'position');
	attributes.texturecoord = gl.getAttribLocation(program, 'texturecoord');

	dr.display_positions = new Float32Array(8);
	dr.display_uvs = new Float32Array([0, 0,  1, 0,  1, 1,  0, 1]);
	dr.display_indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
	dr.display_uvs_upside_down = new Float32Array([0, 1,  1, 1,  1, 0,  0, 0])

	dr.display_positionsVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	dr.display_uvsVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_uvs, gl.STATIC_DRAW);

	dr.display_uvs_ud_VertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvs_ud_VertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_uvs_upside_down, gl.STATIC_DRAW);

	dr.display_indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dr.display_indices, gl.STATIC_DRAW);

};


uidraw.drawTexture = function (x, y, w, h, texture, upsidedown, color) {
	var dr = uidraw.dt;
	var gl = uidraw.gl;
	var mvp_matrix = uidraw.mvp_matrix;
	color = color || uidraw.white;

	dr.display_positions[0] = x;
	dr.display_positions[1] = y;
	dr.display_positions[2] = x + w;
	dr.display_positions[3] = y;
	dr.display_positions[4] = x + w;
	dr.display_positions[5] = y + h;
	dr.display_positions[6] = x;
	dr.display_positions[7] = y + h;
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	var program = dr.program;
	var locations = dr.locations;
	var attributes = dr.attributes;

	gl.useProgram(program);
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(locations.texturemap, 0);
	gl.uniform4fv(locations.color, color);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.position);

	if (upsidedown) {
		gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvs_ud_VertexBuffer);
	} else {
		gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvsVertexBuffer);
	}
	gl.vertexAttribPointer(attributes.texturecoord, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.texturecoord);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.drawElements(gl.TRIANGLES, dr.display_indices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.disableVertexAttribArray(attributes.position);
	gl.disableVertexAttribArray(attributes.texturecoord);
};

uidraw.initDrawUVeditor = function(gl){
	var vertexCode =
	'precision highp float;\n'+
	'uniform mat4 mvp_matrix;\n'+
	'\n'+
	'attribute vec2 position;\n'+
	'attribute vec4 color;\n'+
	'\n'+
	'varying vec4 vcolor;\n'+
	'\n'+
	'void main()\n'+
	'{\n'+
	'   gl_Position = mvp_matrix*vec4(position, 0.0, 1.0);'+
	'   vcolor = color;\n'+
	'}\n';

	var fragmentCode =
	'precision highp float;\n'+
	'\n'+
	'varying vec4 vcolor;\n'+
	'\n'+
	'void main()\n'+
	'{\n'+
	'   gl_FragColor = vcolor;\n'+
	'}\n';

	uidraw.dE = {};
	var dr = uidraw.dE;

	var program = createProgram(gl, vertexCode, fragmentCode);
	var locations = {};
	dr.locations = locations;
	dr.program = program;
	locations.mvp_matrix = gl.getUniformLocation(program, 'mvp_matrix');

	var attributes = {};
	dr.attributes = attributes;
	attributes.position = gl.getAttribLocation(program, 'position');
	attributes.color = gl.getAttribLocation(program, 'color');

	dr.display_positions = new Float32Array(58)
	dr.display_indices = new Uint16Array([0,1,1,2,2,3,3,4,4,9,9,8,8,3,8,7,7,2,7,6,
        6,1,6,5,5,0,5,10,10,11,11,6,11,12,12,7,12,13,13,8,13,14,14,9,14,19,19,18,
        18,13,18,17,17,12,17,16,16,11,16,15,15,10,15,20,20,21,21,16,21,22,22,17,22,23,23,18,23,24,24,19,25,26,26,27,27,28,28,25,25,27,28,26])
	dr.display_color = new Float32Array(116)

	var cIndex = 0;
	for(var k =0;k<29;k++){
		if(k<25){
			dr.display_color[cIndex] = 1
			dr.display_color[cIndex+1] = 1
			dr.display_color[cIndex+2] = 1
			dr.display_color[cIndex+3] = 0.65
		}else{
			dr.display_color[cIndex] = 1
			dr.display_color[cIndex+1] = 1
			dr.display_color[cIndex+2] = 0
			dr.display_color[cIndex+3] = 1
		}
		cIndex+=4
	}

	dr.display_positionsVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	dr.display_colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_colorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_color, gl.STATIC_DRAW);


	dr.display_indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dr.display_indices, gl.STATIC_DRAW);
}
uidraw.drawUVeditor = function(editor){
	var dr = uidraw.dE;
	var gl = uidraw.gl;
	gl.lineWidth(3)
	var mvp_matrix = uidraw.mvp_matrix;



	var length = editor.width/4
	var incr =0;
	for(var i=0;i<5;i++){
		for(var j=0;j<5;j++){
			dr.display_positions[incr] =0+length*i
			dr.display_positions[incr+1]=0+length*j
			incr = incr+2
		}
	}

	dr.display_positions[incr] = editor.minU;
	dr.display_positions[incr+1] = editor.minV;
	dr.display_positions[incr+2] = editor.maxU
	dr.display_positions[incr+3] = editor.minV
	dr.display_positions[incr+4] = editor.maxU
	dr.display_positions[incr+5] = editor.maxV
	dr.display_positions[incr+6] = editor.minU
	dr.display_positions[incr+7] = editor.maxV
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	var program = dr.program;
	var locations = dr.locations;
	var attributes = dr.attributes;

	gl.useProgram(program);
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.position);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_colorBuffer)
	gl.vertexAttribPointer(attributes.color,4,gl.FLOAT,false,0,0)
	gl.bindBuffer(gl.ARRAY_BUFFER,null)
	gl.enableVertexAttribArray(attributes.color)

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.drawElements(gl.LINES, dr.display_indices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.disableVertexAttribArray(attributes.position);
	gl.disableVertexAttribArray(attributes.color);
	gl.lineWidth(1)

}

uidraw.initDrawScrollBar = function(gl){
	var vertexCode =
	'precision highp float;\n'+
	'uniform mat4 mvp_matrix;\n'+
	'attribute vec2 position;\n' +
	'attribute vec2 texturecoord;\n' +
	'varying vec2 textVarying;\n' +
	'void main()\n'+
	'{\n'+
	'	textVarying = texturecoord;\n'+
	'	gl_Position = mvp_matrix*vec4(position.x, position.y,0.0,1.0);\n'+
	'}\n';

	var fragmentCode =
	'precision highp float;\n'+
	'uniform sampler2D texture;\n'+
	'varying vec2 textVarying;\n'+
	'void main()\n'+
	'{\n'+
	'	gl_FragColor = texture2D(texture, textVarying);\n'+
	'}\n';

	uidraw.sB = {};
	var dr = uidraw.sB;

	var program = createProgram(gl, vertexCode, fragmentCode);
	var locations = {};
	dr.locations = locations;
	locations.mvp_matrix = gl.getUniformLocation(program, 'mvp_matrix');
	locations.texture = gl.getUniformLocation(program,'texture');
	dr.program = program;


	var attributes = {};
	dr.attributes = attributes;
	attributes.position = gl.getAttribLocation(program, 'position');
	attributes.texturecoord = gl.getAttribLocation(program, 'texturecoord');

	dr.display_positions = new Float32Array(8)
	dr.display_uv = new Float32Array([0, 0,  1, 0,  1, 1,  0, 1])
	dr.display_indices = new Uint16Array([0, 1, 2, 0, 2, 3])


	dr.display_positionsVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	dr.display_uvVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_uv, gl.DYNAMIC_DRAW);

	dr.display_indicesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dr.display_indices, gl.STATIC_DRAW);
}

uidraw.drawScrollBar = function(x,y,w,h,texture){
	var dr = uidraw.sB;
	var gl = uidraw.gl;

	var mvp_matrix = uidraw.mvp_matrix;

	dr.display_positions[0] = x;
	dr.display_positions[1] = y;
	dr.display_positions[2] = x + w;
	dr.display_positions[3] = y;
	dr.display_positions[4] = x + w;
	dr.display_positions[5] = y + h;
	dr.display_positions[6] = x;
	dr.display_positions[7] = y + h;

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	var program = dr.program;
	var locations = dr.locations;
	var attributes = dr.attributes;

	gl.useProgram(program);
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.activeTexture(gl.TEXTURE0)
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(locations.texture, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.position);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_uvVertexBuffer);
	gl.vertexAttribPointer(attributes.texturecoord, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.texturecoord);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.drawElements(gl.TRIANGLES, dr.display_indices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.disableVertexAttribArray(attributes.position);
	gl.disableVertexAttribArray(attributes.texturecoord);

}


uidraw.drawColorRectangle = function (x, y, w, h, color) {
	var dr = uidraw.dr;
	var gl = uidraw.gl;
	var mvp_matrix = uidraw.mvp_matrix;

	dr.display_positions[0] = x;
	dr.display_positions[1] = y;
	dr.display_positions[2] = x + w;
	dr.display_positions[3] = y;
	dr.display_positions[4] = x + w;
	dr.display_positions[5] = y + h;
	dr.display_positions[6] = x;
	dr.display_positions[7] = y + h;
	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, dr.display_positions, gl.DYNAMIC_DRAW);

	var program = dr.program;
	var locations = dr.locations;
	var attributes = dr.attributes;

	gl.useProgram(program);
	gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
	gl.uniform4fv(locations.color, color);

	gl.bindBuffer(gl.ARRAY_BUFFER, dr.display_positionsVertexBuffer);
	gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	gl.enableVertexAttribArray(attributes.position);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dr.display_indicesBuffer);
	gl.drawElements(gl.TRIANGLES, dr.display_indices.length, gl.UNSIGNED_SHORT, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	gl.disableVertexAttribArray(attributes.position);
};


uidraw.colorAsString = function (a) {
	if (!a) {
		return false;
	}
	if (typeof(a) === "string") {
		return a;
	}
	var str = "rgb(";
	if (a.length > 3) {
		str = "rgba("
	}
	for (i=0; i < 3; i++) {
		var x = Math.floor(a[i]*255 + 0.5);
		if (x < 0) {
			x = 0;
		} else if (x > 255) {
			x = 255;
		}
		str = str+x;
		if (i < 2) {
			str = str+",";
		}
	}
	if (a.length > 3) {
		str = str+","+a[3];
	}
	return str+")";
}