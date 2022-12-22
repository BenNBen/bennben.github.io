MESH_MANAGER = false;
class MeshManager {
    constructor(gl){
        this.shadersCreated = false;
        this.InitShaders(gl);
    }

    BasicShader(gl){
        let program = createProgram(gl, SIMPLE_GEO_VERTEX, SIMPLE_GEO_FRAGMENT);
        let attributes = {}
        let locations = {};

        attributes.position = gl.getAttribLocation(program, 'position');
        locations.color = gl.getUniformLocation(program, 'color');
        locations.mvp = gl.getUniformLocation(program, 'mvp_matrix');

        this.basicProgram = program;
        this.basicAttributes = attributes;
        this.basicLocations = locations;
    }

    InitShaders(gl) {
        if(this.shadersCreated) return;
        this.BasicShader(gl);
        this.shadersCreated = true;
    }
}

class Mesh {
    constructor(gl, color = [.7,.7,.7,1]){
        this.eType = "mesh";
        this.modelMatrix = Matrix4x4.IdentityMat();
        this.quaternion = new Quaternion();
        this.indices = [];
        this.vertices = [];
        this.color = new Float32Array(color);
        this.basicIndexBuffer = gl.createBuffer();
        this.basicVertexBuffer = gl.createBuffer(); 
        this.changed = false;
    }

    LoadFromPath(path){}

    LoadFromData(verts, indices){
        // temp vertex and index arrays
        let v = [];
        let i = [];
        this.vertices = new Float32Array(verts);
        this.indices = new Uint16Array(indices);
        if(verts[0].length === 3){
            for (let index = 0; index < verts.length; index++) {
                v.push(verts[index][0]);
                v.push(verts[index][1]);
                v.push(verts[index][2]);
            }
            this.vertices = new Float32Array(v);
        }
        if(indices[0].length === 3){
            for(let index = 0; index < indices.length; index++) {
                i.push(indices[index][0]);
                i.push(indices[index][1]);
                i.push(indices[index][2]);
            }
            this.indices = new Uint16Array(i);
        }
        this.changed = true;
    }

    Draw(gl, matrix){
        if(!MESH_MANAGER) return;

        if(this.changed){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.basicIndexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.basicVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
            this.changed = false;
        }

        gl.disable(gl.CULL_FACE);

        let program = MESH_MANAGER.basicProgram;
        let locations = MESH_MANAGER.basicLocations;
        let attributes = MESH_MANAGER.basicAttributes;
        gl.useProgram(program);
        gl.uniform4fv(locations.color, this.color);
        gl.uniformMatrix4fv(locations.mvp, false, matrix.data);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.basicVertexBuffer);
        gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.enableVertexAttribArray(attributes.position);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.basicIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        gl.disableVertexAttribArray(attributes.position);
        gl.enable(gl.CULL_FACE);
    }
}