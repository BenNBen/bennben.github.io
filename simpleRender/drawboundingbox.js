// drawboundingbox.js - draw 3D bounding box

function DrawBoundingBox(gl) {
	this.positions = new Float32Array(8*3)
	this.indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4,
			0, 4, 1, 5, 2, 6, 3, 7])
	this.color = new Float32Array(4)
	var vertexCode = '\n' +
		'precision highp float;\n' +
		'uniform mat4 mvp_matrix;\n' +
		'\n' +	
		'attribute vec3 position;\n' +
		'\n' +	
		'void main()\n' +
		'{\n' +
		'	vec4 final = vec4(position, 1.0);\n' +
		'\n' +
		'	gl_Position = mvp_matrix*final;\n' +	
		'}\n';

	var fragmentCode = '\n' +
		'precision highp float;\n' +
		'uniform vec4 color;\n' +
		'\n' +
		'void main (void)\n' +
		'{\n' +
		'\n' +
		'	gl_FragColor = color;\n' +
		'}\n';

	this.program = createProgram(gl, vertexCode, fragmentCode)
	this.mvpLocation = gl.getUniformLocation(this.program, "mvp_matrix")
	this.colorLocation = gl.getUniformLocation(this.program, "color")
	this.positionAttribute = gl.getAttribLocation(this.program, 'position')
	this.positionsVertexBuffer = gl.createBuffer()
	this.indicesBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW)
}

DrawBoundingBox.prototype.draw = function (gl, bb, color, matrix, lineWidth) {
	var p = this.positions
	p[0] = bb[0]		// v0
	p[1] = bb[1]
	p[2] = bb[2]
	p[3] = bb[3]		// v1
	p[4] = bb[1]
	p[5] = bb[2]
	p[6] = bb[3]		// v2
	p[7] = bb[4]
	p[8] = bb[2]
	p[9] = bb[0]		// v3
	p[10] = bb[4]
	p[11] = bb[2]
	p[12] = bb[0]		// v4
	p[13] = bb[1]
	p[14] = bb[5]
	p[15] = bb[3]		// v5
	p[16] = bb[1]
	p[17] = bb[5]
	p[18] = bb[3]		// v6
	p[19] = bb[4]
	p[20] = bb[5]
	p[21] = bb[0]		// v7
	p[22] = bb[4]
	p[23] = bb[5]

	this.color[0] = color[0]
	this.color[1] = color[1]
	this.color[2] = color[2]
	this.color[3] = color[3]

	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsVertexBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, p, gl.DYNAMIC_DRAW)

	gl.lineWidth(lineWidth)
	gl.useProgram(this.program)
	gl.uniformMatrix4fv(this.mvpLocation, false, matrix)
	gl.uniform4fv(this.colorLocation, this.color)
	gl.bindBuffer(gl.ARRAY_BUFFER, this.positionsVertexBuffer)
	gl.vertexAttribPointer(this.positionAttribute, 3, gl.FLOAT, false, 0, 0)
	gl.bindBuffer(gl.ARRAY_BUFFER, null)
	gl.enableVertexAttribArray(this.positionAttribute)

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer)
	gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0)
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
	gl.disableVertexAttribArray(this.positionAttribute)
}