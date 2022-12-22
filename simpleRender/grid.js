// Grid.js -- plane grid object


const GRID_VERTEX_SHADER =
	`
precision highp float;
uniform mat4 mvp_matrix;

attribute vec3 position;

void main()
{
	gl_Position = mvp_matrix*vec4(position, 1.0);
}`;

const GRID_FRAGMENT_SHADER =
	`
precision highp float;

uniform vec4 color;

void main()
{
	gl_FragColor = color;
}`;


class Grid{
	constructor(o){
		this.divisions = 10;
		this.divisionWidth = 1;
		this.color = new Float32Array([227/255, 186/255, 0, 1]);
		this.initDrawing(gl);
		this.visible = true;
		this.scratchMatrix = new Matrix4x4();
	}


	initDrawing(gl){
		// create program for GPU

		var d = this;
		if (typeof d.program === 'undefined') {
			d.program = createProgram(gl, GRID_VERTEX_SHADER, GRID_FRAGMENT_SHADER);
			d.attributes = {};
			d.attributes.position = gl.getAttribLocation(d.program, 'position');
			d.colorLocation = gl.getUniformLocation(d.program, 'color');
			d.mvpLocation = gl.getUniformLocation(d.program, 'mvp_matrix');
		}

		// create grid coordinates and indices

		this.gridIndices = new Uint16Array((this.divisions + 1) * 2 * 2);
		this.indexCount = (this.divisions + 1) * 2 * 2;
		var x1 = -this.divisionWidth * this.divisions / 2;
		var x2 = -x1;
		var z = -this.divisionWidth * this.divisions / 2;
		var y = 0;
		this.gridVerts = new Float32Array((this.divisions + 1) * 6 * 2);
		var gindex = 0;
		var giindex = 0;
		var gn = this.gridVerts;
		var gi = this.gridIndices;
		for (var i = 0; i < this.divisions + 1; i++) {
			gn[gindex] = x1;
			gn[gindex + 1] = y;
			gn[gindex + 2] = z;
			gn[gindex + 3] = x2;
			gn[gindex + 4] = y;
			gn[gindex + 5] = z;
			gi[giindex] = giindex * 1;
			gi[giindex + 1] = (giindex + 1) * 1;
			z = z + this.divisionWidth;
			gindex = gindex + 6;
			giindex = giindex + 2;
		}
		var z1 = -this.divisionWidth * this.divisions / 2;
		var z2 = -z1;
		var x = -this.divisionWidth * this.divisions / 2;
		for (var i = 0; i < this.divisions + 1; i++) {
			gn[gindex] = x;
			gn[gindex + 1] = y;
			gn[gindex + 2] = z1;
			gn[gindex + 3] = x;
			gn[gindex + 4] = y;
			gn[gindex + 5] = z2;
			gi[giindex] = (giindex) * 1;
			gi[giindex + 1] = (giindex + 1) * 1;
			x = x + this.divisionWidth;
			gindex = gindex + 6;
			giindex = giindex + 2;
		}
		this.gridVertsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.gridVertsBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.gridVerts, gl.STATIC_DRAW);
		this.gridIndicesBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gridIndicesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.gridIndices, gl.STATIC_DRAW);
	}

	draw(gl, projectionMatrix, modelMatrix) {
		if (this.visible) {
			gl.lineWidth = 4;
			var locations = this;
			gl.useProgram(this.program);
			gl.uniform4fv(locations.colorLocation, this.color);
			this.scratchMatrix.Set(projectionMatrix);
			this.scratchMatrix = this.scratchMatrix.Mul(modelMatrix);
			this.scratchMatrix.Print();
			gl.uniformMatrix4fv(this.mvpLocation, false, this.scratchMatrix.data);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.gridVertsBuffer);
			gl.vertexAttribPointer(this.attributes.position, 3, gl.FLOAT, false, 0, 0);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			gl.enableVertexAttribArray(this.attributes.position);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.gridIndicesBuffer);
			gl.drawElements(gl.LINES, this.indexCount, gl.UNSIGNED_SHORT, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

			gl.disableVertexAttribArray(this.attributes.position);

		}
	}
}




