class AnimatedSprite extends Sprite{
    constructor(o, rownum = 1, colnum = 1){
        super(o);
        this.rownum = rownum;
        this.colnum = colnum;
        this.timeToDraw = 10000;
        this.currTime = 0;
        this.lastDraw = false;
    }

    CalcUVCoord(percent) {
        let rowNum = this.rownum;
        let colNum = this.colnum;
        var squares = rowNum * colNum;
        var offset = Math.floor(squares * percent);

        var offsetY = Math.floor(offset % rowNum) / rowNum;
        var offsetX = Math.floor(offset / colNum) / colNum;

        var x1 = 0;
        var y1 = 0;
        var x2 = 1;
        var y2 = 0;
        var x3 = 1;
        var y3 = 1;
        var x4 = 0;
        var y4 = 1;

        x1 = x1 / rowNum + offsetX;
        y1 = y1 / colNum + offsetY;
        x2 = x2 / rowNum + offsetX;
        y2 = y2 / colNum + offsetY;
        x3 = x3 / rowNum + offsetX;
        y3 = y3 / colNum + offsetY;
        x4 = x4 / rowNum + offsetX;
        y4 = y4 / colNum + offsetY;

        return [x1, y1, x2, y2, x3, y3, x4, y4];
    }

    Draw(gl, view, projection) {
        if (!this.parent) return;
        let now = window.performance.now();
        let uvs = this.uvs;
        if(this.lastDraw && (this.rownum > 1 || this.colnum > 1)){
            let diff = now - this.lastDraw;
            this.currTime += diff;
            if(this.currTime > this.timeToDraw) this.currTime = 0;
            let percent = this.currTime / this.timeToDraw;
            uvs = new Float32Array(this.CalcUVCoord(percent));
        }
        this.lastDraw = now;
        let parent = this.parent;
        let [mv, mvp] = this.CalcMatrices(view, projection);
        gl.useProgram(parent.shader);
        let locations = parent.locations;
        let attributes = parent.attributes;
        let cameraRatio = [1, 1];
        let texture = parent.defaultTexture;
        if (this.texturePath) {
            if (!this.texture) {
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
        parent.AssignBuffer(this.uvsBuffer, "ARRAY_BUFFER", uvs, attributes.uvs, 2, "float");
        parent.AssignBuffer(this.indicesBuffer, "ELEMENT_ARRAY_BUFFER", this.indices, false, 0, "u_int");

        parent.EnableAttributes(gl, attributes);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        parent.DisableAttributes(gl, attributes);
    }

}