DEFAULT_TEXTURE_STRING = 
    `
ctx.fillStyle="white";
ctx.strokeStyle="red";
ctx.arc(width/2, height/2, Math.floor(width/2), 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
`;


SPRITE_FRAGMENT =
`precision mediump float;
varying vec2 textVarying;

uniform sampler2D texturemap;
uniform vec3 ucolor;

void main (void){
    vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
    vec4 tcolor = texture2D(texturemap,textFlipped);
	gl_FragColor = tcolor*vec4(ucolor.xyz, 1.0);
}`;

SPRITE_VERTEX =
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

SPRITE_VERTEX_INTERP =
`precision mediump float;
uniform mat4 mvpMatrix;
uniform mat4 mvpMatrix2;
uniform mat4 mvMatrix;
uniform vec2 pixelRatio;
uniform float interpolation;

attribute vec3 position;
attribute vec2 rotatedCorner;
attribute vec2 uvs;

varying vec2 textVarying;

void main (){
    float inverseInterpolation = 1.0 - interpolation;
    mat4 mvpMat = mvpMatrix * inverseInterpolation + mvMatrix2 * interpolation;
    vec3 axis1 = vec3(mvMatrix[0][0], mvMatrix[1][0], mvMatrix[2][0]);
    vec3 axis2 = vec3(mvMatrix[0][1], mvMatrix[1][1], mvMatrix[2][1]);
    vec3 corner = rotatedCorner.x*axis1*pixelRatio.x + rotatedCorner.y*axis2*pixelRatio.y + position.xyz;
    vec4 final = vec4(corner,1.0);
    gl_Position = mvpMat * final;
    textVarying = uvs;
}`;

function drawCanvasTexture(contextString, width = 256, height = 256) {
    let ncanvas = document.createElement("canvas");
    let ctx = ncanvas.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    eval(contextString);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, ctx.canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
}

class SpriteManager{
    constructor(){
        this.sprites = [];
        this.shader = false;
        this.defaultTexture = drawCanvasTexture(DEFAULT_TEXTURE_STRING);
        this.attributeStrings = ["uvs", "spriteCorners", "pos"];
    }

    CreateShader(gl){
        let shader = createProgram(gl, SPRITE_VERTEX, SPRITE_FRAGMENT);
        let interpShader = createProgram(gl, SPRITE_VERTEX_INTERP, SPRITE_FRAGMENT);
        let locations = {};
        let attributes = {};
        let interpLocations = {};
        let interpAttributes = {};

        attributes.uvs = gl.getAttribLocation(shader, "uvs");
        attributes.spriteCorners = gl.getAttribLocation(shader, "rotatedCorner");
        attributes.pos = gl.getAttribLocation(shader, "position");
        locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
        locations.texturemap = gl.getUniformLocation(shader, "texturemap");
        locations.ucolor = gl.getUniformLocation(shader, "ucolor");
        locations.mv_matrix = gl.getUniformLocation(shader, "mvMatrix");
        locations.pixelRatio = gl.getUniformLocation(shader, "pixelRatio");

        this.attributes = attributes;
        this.locations = locations;
        this.shader = shader;
        this.gl = gl;
    }

    Init(gl){
        if(this.shader) return;
        this.CreateShader(gl);
    }

    DisableAttributes(gl, attributes) {
        let set = this.attributeStrings;
        let len = set.length;
        for (var i = 0; i < len; i++) {
            gl.disableVertexAttribArray(attributes[set[i]]);
        }
    }

    EnableAttributes(gl, attributes){
        let set = this.attributeStrings;
        let len = set.length;
        for (var i = 0; i < len; i++) {
            gl.enableVertexAttribArray(attributes[set[i]]);
        }
    }

    AssignBuffer(buffer, bufferType, data, attribute, stride, type){
        let gl_type;
        let DataType;
        let doPointer = true;
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

    EnableDrawConditions(gl){
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    }

    DisableDrawConditions(gl){
        gl.enable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
    }

    Draw(gl, view, projection){
        if (!this.shader) this.Init(gl);
        this.EnableDrawConditions(gl);
        let len = this.sprites.length;
        let newSprites = [];
        for (var i = 0; i < len; i++) {
            let s = this.sprites[i];
            if (s.toRemove === false) {
                s.Draw(gl, view, projection);
                newSprites.push(s);
            }
        }
        this.DisableDrawConditions(gl);
        this.sprites = newSprites;
    }

    AddDefault(gl, pos = [0, 0, 0]){
        let s = new Sprite(gl);
        s.ModifyModelMatrix(new Vector3(pos[0], pos[1], pos[2]));
        this.sprites.push(s);
        s.parent = this;
        return s;
    }
}

class Sprite{
    constructor(gl, color = [1,1,1]){
        this.color = new Float32Array(color);
        this.modelMatrix = Matrix4x4.IdentityMat();
        this.quaternion = new Quaternion();
        this.changed = false;
        this.parent = false;
        this.toRemove = false;
        // attribute data
        this.indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
        this.corners = new Float32Array([-.5, -.5, .5, -.5, .5, .5, -.5, .5]);
        this.uvs = new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]);
        this.positions = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        this.indicesBuffer = gl.createBuffer();
        this.cornersBuffer = gl.createBuffer();
        this.uvsBuffer = gl.createBuffer();
        this.posBuffer = gl.createBuffer();
        this.texturePath = false;
        this.texture = false;
    }

    RotateMatrix(rotation, modelMatrix) {
        var s = new Matrix4x4();
        let q = this.quaternion;
        q.SetEuler(rotation.x, rotation.y, rotation.z);
        s.RotationMatrix(q);
        return modelMatrix.Mul(s);
    }

    ModifyModelMatrix(pos = new Vector3(0, 0, 0), rotation = new Vector3(0, 0, 0), scale = new Vector3(1, 1, 1)) {
        this.pos = pos;
        this.rotation = rotation;
        this.scale = scale;

        this.modelMatrix.ScaleMatrix(this.scale);
        this.modelMatrix = this.RotateMatrix(rotation, this.modelMatrix);
        this.modelMatrix.DisplaceMatrix(this.pos);
        this.changed = true;
    }

    CalcMatrices(view, proj){
        let model = this.modelMatrix;
        let mv = view.Mul(model);
        let mvp = proj.Mul(mv);
        return [mv, mvp];
    }

    LoadTexture(gl, path, defaultTexture){
        let tex = loadTexture(gl, path);
        if(tex) return tex;
        return defaultTexture;
    }

    Draw(gl, view, projection){
        if(!this.parent) return;
        let parent = this.parent;
        let [mv, mvp] = this.CalcMatrices(view, projection);
        gl.useProgram(parent.shader);
        let locations = parent.locations;
        let attributes = parent.attributes;
        let cameraRatio = [1, 1];
        let texture = parent.defaultTexture;
        if(this.texturePath){
            if(!this.texture){
                this.texture = this.LoadTexture(gl, this.texturePath, texture);
            }
            texture = this.texture;
        }
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(locations.texturemap, 0);
        gl.uniform3fv(locations.ucolor, this.color);
        gl.uniform2fv(locations.pixelRatio, cameraRatio);

        gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp.data);
        gl.uniformMatrix4fv(locations.mv_matrix, false, mv.data);

        parent.AssignBuffer(this.posBuffer, "ARRAY_BUFFER", this.positions, attributes.pos, 3, "float");
        parent.AssignBuffer(this.cornersBuffer, "ARRAY_BUFFER", this.corners, attributes.spriteCorners, 2, "float");
        parent.AssignBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.uvs, attributes.uvs, 2, "float");
        parent.AssignBuffer(this.indicesBuffer, "ELEMENT_ARRAY_BUFFER", this.indices, false, 0, "u_int");

        parent.EnableAttributes(gl, attributes);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        parent.DisableAttributes(gl, attributes);
    }
}