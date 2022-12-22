//simple code to draw a path

/*
    @purpose: draw a simple wireframe cone
    @param gl: the current webgl context of the scene
*/
function DrawPath(gl, dim){
    this.gl = gl; 
    this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.modelChanged = false;
    this.program = createProgram(gl, this.vertexShader, this.fragmentShader);
    this.attributes = {};
    this.attributes.position = gl.getAttribLocation(this.program, 'position');
    this.colorLocation = gl.getUniformLocation(this.program, 'color');
    this.mvpLocation = gl.getUniformLocation(this.program, 'mvp_matrix');
    this.dim = dim || .25;
    this.p = [-this.dim,0,-this.dim,this.dim,0,this.dim];
    this.pindices =[];
    this.drawVerts = new Float32Array(this.p);
    this.indices = new Uint16Array(this.pindices)
    this.indicesBuffer = gl.createBuffer();
    this.lastIndex = 0;
    this.maxVerts = 300;
}

DrawPath.prototype.addStep = function(vert){
    var dim = this.dim;
    var maxVerts = this.maxVerts;
    this.p.push(vert[0] - dim);
    this.p.push(vert[1]);
    this.p.push(vert[2] - dim);
    this.p.push(vert[0] + dim);
    this.p.push(vert[1]);
    this.p.push(vert[2] + dim);
    if(this.p.length<=maxVerts){
        this.pindices.push(this.lastIndex);
        this.pindices.push(this.lastIndex + 1);
        this.pindices.push(this.lastIndex + 2);
        this.pindices.push(this.lastIndex + 2);
        this.pindices.push(this.lastIndex + 1);
        this.pindices.push(this.lastIndex + 3);
        this.lastIndex+=2;
    }
    while(this.p.length>maxVerts){
        this.p.splice(6);
    }
    this.drawVerts = new Float32Array(this.p);
    this.indices = new Uint16Array(this.pindices)
}

/*
    @purpose: draw the chosen arrow to the scene
    @param gl: the current webgl context of the scene
    @param matrix: the transform matrix to multiply the arrow's vertices by
    @param color: the color used to draw the wireframe arrow
    @param rotation: a three tuple vector used to rotate the vertices of the arrow
*/
DrawPath.prototype.draw = function(gl,matrix,color){
    if(this.indices <6){
        return;
    }
    color = color || [0,1,0,1];
    gl.disable(gl.CULL_FACE);
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
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gl.disableVertexAttribArray(this.attributes.position);
    gl.enable(gl.CULL_FACE);
}

DrawPath.prototype.vertexShader =
`
precision highp float;
uniform mat4 mvp_matrix;

attribute vec3 position;

void main()
{
	gl_Position = mvp_matrix*vec4(position, 1.0);
}
`;

DrawPath.prototype.fragmentShader =
`
precision highp float;

uniform vec4 color;

void main()
{
	gl_FragColor = color;
}
`;

