// superpanel.js -- A panel that can be drawn in 3D space and be the parent of regular panels

function SuperPanel(o) {
	this.width = o.width || 512;
	this.height = o.height || 1024;
	this.mwidth = o.mwidth || o.width||1.5;
	this.mheight = o.mheight || o.height||3;
	if ("x" in o) {
		this.x = o.x;
	} else {
		this.x = 1.5;
	}
	if ("y" in o) {
		this.y = o.y;
	} else {
		this.y = -this.mheight/2;
	}
	this.mx = (o.mx == null) ? this.x : o.mx;
	this.my = (o.my == null) ? this.y : o.my;
	this.texture = o.texture;
	this.transformMatrix = o.transformMatrix || new Float32Array([1,0,0,0,  0,1,0,0,  0,0,1,0,  0, 0, 0, 1]);
	this.scratchMatrix = new Float32Array(16);
	this.scratchMatrix2 = new Float32Array(16);
	var color = o.color || [1, 1, 1, 1]
	this.color = new Float32Array(color);
	var transparentDraw = o.transparentDraw || false
	var subPanelFill = o.subPanelFill || false
	this.panel = new Panel({width:this.width, height:this.height, color:this.color,transparentDraw:transparentDraw,
		subPanelFill:subPanelFill});
	this.panel.parent = this;
	this.render = false;
	this.mipmap = false;
	this.origin = new Float32Array(4);
	this.origin[3] = 1;		// avoid divide by zero when doing perspective divide
	this.topRight = new Float32Array(4);
	this.topRight[3] = 1;	// avoid divide by zero when doing perspective divide
	this.touchPad = o.touchPad || 10;		// in physical screen resolution
	this.mcolor = o.mcolor || new Float32Array([1, 1, 1, 0.9]);
	this.name = "SuperPanel"
	this.projectionMatrix = new Float32Array(16)
	this.useScreenCoordinates = o.useScreenCoordinates || false
	this.currentViewport = false
	this.hide = false
}

SuperPanel.prototype.drawTextures = function (gl) {
	if (this.panel.dirty) {
		this.panel.dirty = false;
		var firstDraw = false;
		if (!this.render) {
			this.render = createRenderTextureAndBuffer(gl, this.width, this.height, true);
			firstDraw = true;
		}
		var oldFrameBuffer = layout.bindFramebuffer(gl, this.render.buffer);
		gl.disable(gl.DEPTH_TEST);
		if (!this.panel.subPanelFill || firstDraw) {
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		}
		gl.cullFace(gl.BACK);
		gl.enable(gl.CULL_FACE);
		var currentViewport = this.currentViewport || gl.getParameter(gl.VIEWPORT);
		this.currentViewport = currentViewport
		setViewport(gl, 0, 0, this.render.width, this.render.height);
		ortho(this.scratchMatrix, 0, this.render.width, 0, this.render.height, -1, 1);
		uidraw.setMVP(this.scratchMatrix);
		this.panel.draw(gl,this.render.buffer);
		layout.bindFramebuffer(gl, oldFrameBuffer);
		gl.enable(gl.DEPTH_TEST);
		gl.viewport(currentViewport[0], currentViewport[1], currentViewport[2], currentViewport[3]);
		this.texture = this.render.texture;

		if (this.mipmap) {
			gl.bindTexture(gl.TEXTURE_2D, this.texture);

			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		}

	}
}

SuperPanel.prototype.draw = function (gl, projectionMatrix, cameraMatrix) {
	if (!this.texture || !vrMultiview) {
		this.drawTextures(gl);
	}

	if (!this.hide) {
		var tx, ty, twidth, theight
		if (this.useScreenCoordinates) {
			ortho(this.projectionMatrix, 0, gl.drawingBufferWidth, 0, gl.drawingBufferHeight, -1, 1)
			this.scratchMatrix.set(this.projectionMatrix);
			matrixMultiply(this.scratchMatrix, this.transformMatrix, this.scratchMatrix2);
			twidth = this.width
			theight = this.height
			tx = this.x;
			ty = this.y;
		} else {
			this.scratchMatrix.set(projectionMatrix);
			matrixMultiply(this.scratchMatrix, cameraMatrix, this.scratchMatrix2);
			matrixMultiply(this.scratchMatrix, this.transformMatrix, this.scratchMatrix2);
			twidth = this.mwidth
			theight = this.mheight
			tx = this.mx;
			ty = this.my;
		}
		uidraw.setMVP(this.scratchMatrix);
		uidraw.drawTexture(tx, ty, twidth, theight, this.texture, false, this.mcolor);

			// remember where the panel was drawn on the screen

		var origin = this.origin;
		var topRight = this.topRight;
		origin[0] = tx;
		origin[1] = ty;
		origin[2] = 0;
		origin[3] = 1;
		topRight[0] = tx + twidth;
		topRight[1] = ty + theight
		topRight[2] = 0;
		topRight[3] = 1;
		matrixTimesVector4(origin, this.scratchMatrix, origin);
		matrixTimesVector4(topRight, this.scratchMatrix, topRight);
		this.middle = [tx+twidth/2,ty+theight/2]
	}
};

SuperPanel.prototype.addSubPanel = function (p, how, rposition) {
	this.panel.addSubPanel(p, how, rposition);
};

SuperPanel.prototype.remainingHeight = function () {
	return this.panel.remainingHeight();
};

SuperPanel.prototype.remainingWidth = function () {
	return this.panel.remainingWidth();
};

SuperPanel.prototype.dimensions = function () {
	return this.panel.dimensions();
};

SuperPanel.prototype.markDirty = function () {
	postRedisplay();
};

SuperPanel.prototype.findCenter = function(width,height){

	var ox = this.origin[0]/this.origin[3];
	var oy = this.origin[1]/this.origin[3];

	var rx = ((ox+1)/2)*width
	var ry = ((oy+1)/2)*height

	return [rx+this.width/2,ry+this.height/2]
}

SuperPanel.prototype.mouseDown = function (x, y, canvasWidth, canvasHeight) {	// physical location so physical canvas dimensions
	//console.log(x,y,canvasWidth,canvasHeight)
	// first calculate in normalized coordinates (-1, -1) to (1, 1)
	var nx = 2*x/canvasWidth - 1;
	var ny = 1 - 2*y/canvasHeight;
	var ox = this.origin[0]/this.origin[3];
	var oy = this.origin[1]/this.origin[3];
	var mx = this.topRight[0]/this.topRight[3];
	var my = this.topRight[1]/this.topRight[3];
	//console.log("x,y", x, y, "canvas", canvasWidth, canvasHeight);
	//console.log("n", nx, ny, "o", ox, oy, "m", mx, my);
	//console.log("panel width", this.width, "panel height", this.height);
	var pad = 0;
	if (nx >= (ox - pad) && nx <= (mx + pad) && ny >= (oy - pad) && ny <= (my + pad)) {
		var rx = this.width*(nx - ox)/(mx - ox);
		var ry = this.height*(ny - oy)/(my - oy);

//		console.log("super panel mouse down", this.panel.touchPad);
		this.selected = this.panel.select(rx, ry, rx, ry);
		//console.log(this.selected)
		return true;
	} else {
		//console.log("mouse down not in superpanel")
		return false;
	}
}

SuperPanel.prototype.dblClick = function(x, y, canvasWidth, canvasHeight){

	var nx = 2*x/canvasWidth - 1;
	var ny = 1 - 2*y/canvasHeight;
	var ox = this.origin[0]/this.origin[3];
	var oy = this.origin[1]/this.origin[3];
	var mx = this.topRight[0]/this.topRight[3];
	var my = this.topRight[1]/this.topRight[3];
	//console.log("x,y", x, y, "canvas", canvasWidth, canvasHeight);
	//console.log("n", nx, ny, "o", ox, oy, "m", mx, my);
	//console.log("panel width", this.width, "panel height", this.height);
	var pad = 0;
	if (nx >= (ox - pad) && nx <= (mx + pad) && ny >= (oy - pad) && ny <= (my + pad)) {
		var rx = this.width*(nx - ox)/(mx - ox);
		var ry = this.height*(ny - oy)/(my - oy);
		// console.log("rx ", rx, "ry", ry)
		this.selected = this.panel.dblClick(rx, ry);
		// console.log("this.selected", this.selected)
		return true;
	} else {
		//console.log("mouse down not in superpanel")
		return false;
	}
}

SuperPanel.prototype.hover = function (x, y, canvasWidth, canvasHeight) {	// physical location so physical canvas dimensions
	console.log(x,y,canvasWidth,canvasHeight)
	// first calculate in normalized coordinates (-1, -1) to (1, 1)
	var nx = 2*x/canvasWidth - 1;
	var ny = 1 - 2*y/canvasHeight;
	var ox = this.origin[0]/this.origin[3];
	var oy = this.origin[1]/this.origin[3];
	var mx = this.topRight[0]/this.topRight[3];
	var my = this.topRight[1]/this.topRight[3];
	console.log("x,y", x, y, "canvas", canvasWidth, canvasHeight);
	console.log("n", nx, ny, "o", ox, oy, "m", mx, my);
	console.log("panel width", this.width, "panel height", this.height);
	var pad = 0;
	if (nx >= (ox - pad) && nx <= (mx + pad) && ny >= (oy - pad) && ny <= (my + pad)) {
		var rx = this.width*(nx - ox)/(mx - ox);
		var ry = this.height*(ny - oy)/(my - oy);

		var hover = this.panel.hover(rx, ry, rx, ry);
		//console.log(this.selected)
	}
}

SuperPanel.prototype.mouseUp = function () {	// logical location so logical canvas dimensions
	if (this.selected) {
		this.selected.deselect();
		this.selected = false;
	}
}

SuperPanel.prototype.mouseMove = function (x, y, canvasWidth, canvasHeight) {	// logical location so logical canvas dimensions
	if(this.selected){
		if(this.selected.move){
			var nx = 2*x/canvasWidth - 1;
			var ny = 1 - 2*y/canvasHeight;
			var ox = this.origin[0]/this.origin[3];
			var oy = this.origin[1]/this.origin[3];
			var mx = this.topRight[0]/this.topRight[3];
			var my = this.topRight[1]/this.topRight[3];
			var pad =0

//			if (nx >= (ox - pad) && nx <= (mx + pad) && ny >= (oy - pad) && ny <= (my + pad)) {
				var rx = this.width*(nx - ox)/(mx - ox);
				var ry = this.height*(ny - oy)/(my - oy);
				this.selected.move(rx,ry)
//			}
		}
		return true;
	} else {
	}
	return false;
}