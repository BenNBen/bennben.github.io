// panel.js -- simple panel as a IU element

CurrentViewport = false;

function getViewport(gl) {
	CurrentViewport = CurrentViewport || gl.getParameter(gl.VIEWPORT);
	return [CurrentViewport[0], CurrentViewport[1], CurrentViewport[2], CurrentViewport[3]];
}

function setViewport(gl, a, b, c, d)
{
	if (!CurrentViewport) {
		CurrentViewport = [];
	}
	CurrentViewport[0] = a;
	CurrentViewport[1] = b;
	CurrentViewport[2] = c;
	CurrentViewport[3] = d;
	gl.viewport(CurrentViewport[0], CurrentViewport[1], CurrentViewport[2], CurrentViewport[3]);
}

function Panel(o) {
	this.width = o.width || 100;
	this.height = o.height || 50;
	this.x = o.x || 0;
	this.y = o.y || 0;
	this.subPanels = [];
	this.dirty = true;		// has not been drawn
	this.color = o.color || [0, 0, 0, 0];
	this.scolor = o.scolor || o.color;
	if (Array.isArray(this.color)) {
		this.color = new Float32Array(this.color);
	}
	if (Array.isArray(this.scolor)) {
		this.scolor = new Float32Array(this.scolor);
	}
	this.leftPos = 0;
	this.topPos = this.height;
	this.name = "Panel";
	this.hidden = false;
	this.texture = o.texture || false;
	this.textureColor = o.textureColor || false;
	this.transparentDraw = o.transparentDraw || false;
	this.touchPad = o.touchPad || 0;
	this.upsideDown = o.upsideDown || false;
	this.selectable = o.selectable || false;
	this.selectFunction = o.selectFunction || false;
	this.subPanelFill = o.subPanelFill || false;
	this.firstDraw = true;
	this.currentViewport = false;
}

Panel.prototype.draw = function (gl) {
	var pX = 0
	var pY = 0
	var pHeight = this.height
	var pWidth = this.width
	if(this.xOffset){ //used in scrollbar and anything else that might have an x offset draw method
		pX = this.xOffset
		pWidth = this.virtualWidth

	}
	if(this.yOffset){ //used in scrollbar and anything else that might have a y offset drawing method
		pY = this.yOffset
		pHeight = this.virtualHeight
	}
	if(this.hidden == true){
		return
	}
	var currentViewport;

	if(this.transparentDraw || (!this.firstDraw && this.subPanelFill)) {
	}else{
		if (this.drawBackground) {
			this.drawBackground();
		} else if (this.texture) {
			uidraw.drawTexture(pX, pY, pWidth, pHeight, this.texture,this.upsideDown,this.textureColor);
		} else if (this.uvEditor){
			uidraw.drawUVeditor(this)
		}else if (this.scrollbar){
			uidraw.drawScrollBar(0,0,this.width,this.height,this.texture)
		}else if (this.color) {
			var color = this.color;
			if(this.selected === true){
				color = this.scolor;
			}
			uidraw.drawColorRectangle(0.0, 0.0, this.width, this.height,color);
		}
	}
	this.firstDraw = false;
//	console.log("drawColorRectangle", this.width, this.height);
	if (this.subPanels.length > 0) {
		currentViewport = getViewport(gl);
		this.currentViewport = currentViewport;
		if (!this.scratchMatrix) {
			this.scratchMatrix = new Float32Array(16);
		}
	}
	for (var i=0; i < this.subPanels.length; i++) {		// todo - limit width too
		var p = this.subPanels[i];
		if((p.dirty || !this.subPanelFill)) {
			var top = currentViewport[1] + p.y + p.height;
			var height = p.height;
			if (top > currentViewport[1] + currentViewport[3]) {
				height = currentViewport[3] - p.y;
			}
			if (height > 0) {
				setViewport(gl, currentViewport[0] + p.x, currentViewport[1] + p.y, p.width, height);
				ortho(this.scratchMatrix, 0.0, p.width, 0.0, height, -1, 1);
				uidraw.setMVP(this.scratchMatrix);
				p.draw(gl);
				setViewport(gl, currentViewport[0], currentViewport[1], currentViewport[2], currentViewport[3]);
			}
		}
	}

	this.dirty = false;
};


Panel.prototype.addSubPanel = function (p, how, rposition) {
	p.prevX = this.leftPos
	p.prevY = this.topPos
	var x = 0;
	var y = 0;
	if (how == "relative") {
		x = rposition[0];
		y = rposition[1];
	} else if (how == "topDown") {
		this.topPos -= p.height;
		//console.log("=================add subpanel topdown", p.name, "height", p.height, this.topPos, Math.floor((this.width - p.width)/2))
		y = this.topPos;
		x = Math.floor((this.width - p.width)/2);
	} else if (how == "leftToRight") {
		x = this.leftPos;
		this.leftPos += p.width;
		y = Math.floor((this.height - p.height)/2);
	}
	p.how = how;
	p.rposition = rposition;
	p.x = x;
	p.y = y;
	p.relX = x
	p.relY = y
	this.subPanels.push(p);
	p.parent = this;
};

Panel.prototype.clearPanels = function(index){
	index = index || 0;
	if(this.subPanels.length<1){
		return;
	}
	while(this.subPanels.length>index){
		this.popSubPanel();
	}
}

Panel.prototype.popSubPanel = function(){
	this.leftPos = this.subPanels[this.subPanels.length-1].prevX
	this.topPos = this.subPanels[this.subPanels.length-1].prevY
	this.subPanels.pop()
	this.markDirty()
}

Panel.prototype.remainingHeight = function () {
	return this.topPos;
};

Panel.prototype.remainingWidth = function () {
	return this.width - this.leftPos;
};

Panel.prototype.dimensions = function () {
	return [this.width, this.height];
};

Panel.prototype.markDirty = function () {
	if (!this.dirty) {
		this.dirty = true;
		if (this.parent) {
			this.parent.markDirty();
		}
		if(this.virtual){
			this.physicalPanel.markDirty()
		}
	}
};

Panel.prototype.select = function (x, y, ax, ay) {
// console.log("panel select", x, y, ax, ay)
    // var unhighlight = TextBox.select(x,y)

	for (var i=0; i < this.subPanels.length; i++) {
		var p = this.subPanels[i];
	// console.log("i", i, "name", p.name, "px py", p.x, p.y, this.touchPad);
		if ((x + this.touchPad) >= p.x && (x - this.touchPad) <= (p.x + p.width) && (y + this.touchPad) >= p.y && (y - this.touchPad) <= (p.y + p.height)) {
			if(this.selectable === true){
				this.selected = true;
				if(this.selectFunction){
					this.selectFunction();
				}
			}
			var s = p.select(x - p.x, y - p.y, ax, ay)
			if (s) {
				//console.log("sub panel returned true from select")
				return s;
			}
		}
	}
	return false;
};

Panel.prototype.hover = function (x, y, ax, ay) {
	//console.log("panel select", x, y)
	for (var i=0; i < this.subPanels.length; i++) {
		var p = this.subPanels[i];
	//	console.log("i", i, "name", p.name, "px py", p.x, p.y);
		if (x >= p.x && x <= (p.x + p.width) && y >= p.y && y <= (p.y + p.height)) {
			var s = p.hover(x - p.x, y - p.y, ax, ay)
			if (s) {
				//console.log("sub panel returned true from select")
				return s;
			}
		}
	}
	return false;
};

Panel.prototype.dblClick = function (x, y) {

	// console.log("PANEL DOUBLECLICK x", x, "y", y)
	for (var i=0; i < this.subPanels.length; i++) {
		var p = this.subPanels[i];
		// console.log("i", i, "name", p.name, "px py", p.x, p.y);
		// console.log("i", i, "name", p.name, "px py", p.x, p.y, "\nx y ", x, y);
		if (x >= p.x && x <= (p.x + p.width) && y >= (p.y - p.height) && y <= (p.y + p.height)) {
			//console.log("\nPANEL p.height", p.height, "p.width", p.width)
			//console.log("PANEL  x", x, "y", y)
			//console.log("PANEL  p.x", p.x, "p.y", p.y)
			//console.log("name", p.name)
			var s = p.dblClick(x-p.x, y-p.y)
			// console.log("S", s)
			if (s) {
				console.log("sub panel returned true from select")
				return s;
			}
		}
	}
	return false;
	// this.selected = this.panel.dblClick(rx, ry);
}