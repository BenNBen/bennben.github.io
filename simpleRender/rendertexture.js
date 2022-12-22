// rendertexture.js -- create a color texture and attach it to a created render buffer

function createRenderTextureAndBuffer(gl, width, height, linear, pixelType, addDepth, addStencil) {

	let depthTextureExt = gl.getExtension("WEBGL_depth_texture")
	if (!depthTextureExt) {
		depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture")
	}

	let filter = gl.NEAREST;
	if (linear) {
		filter = gl.LINEAR;
	}

	if (pixelType == null) {
		pixelType = gl.UNSIGNED_BYTE;
	}

	if (addDepth == null) {
		addDepth = true;
	}

	if (addStencil == null) {
		addStencil = false;
	}

		// create a render buffer

	var frameBuffer = gl.createFramebuffer()
	
		// create a color texture
		
	var colorTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, colorTexture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, pixelType, null)
	
	var depthTexture = false

		// bind depth buffer and color texture to frame buffer
	
	let haveScene = (typeof scene !== "undefined" && scene !== false)
	let oldFrameBuffer = false
	if (haveScene) { 
		oldFrameBuffer = scene.bindFramebuffer(gl, frameBuffer) 
	}
	else {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
	}
	if (addDepth) {
		if (WEBGL2 || depthTextureExt) {
			depthTexture = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, depthTexture)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			if (addStencil) {
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, width, height, 0, gl.DEPTH_STENCIL, 
					WEBGL2 ? gl.UNSIGNED_INT_24_8 : depthTextureExt.UNSIGNED_INT_24_8_WEBGL, null)
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
			}
			else {
				gl.texImage2D(gl.TEXTURE_2D, 0, WEBGL2 ? gl.DEPTH_COMPONENT16 : gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
			}
		}
		else {
			var depthBuffer = gl.createRenderbuffer()
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)
		}
	}
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)
	gl.bindTexture(gl.TEXTURE_2D, null)
	if (haveScene) { 
		scene.bindFramebuffer(gl, oldFrameBuffer) 
	}
	return {texture:colorTexture, depthTexture:depthTexture, buffer:frameBuffer, width:width, height:height}
}

function destroyRenderTextureAndBuffer(gl, renderTex) {

	if (renderTex.texture) {
		gl.deleteTexture(renderTex.texture);
	}
	if (renderTex.depthTexture) {
		gl.deleteTexture(renderTex.depthTexture);
	}
	if (renderTex.buffer) {
		gl.deleteFramebuffer(renderTex.buffer);
	}

	renderTex.texture = false;
	renderTex.depthTexture = false;
	renderTex.buffer = false;	
}

// create color texture
function createRGBATexture(gl, width, height, linear, pixelType) {
	let filter = gl.NEAREST;
	if (linear) {
		filter = gl.LINEAR;
	}

	if (pixelType == null) {
		pixelType = gl.UNSIGNED_BYTE;
	}

	let colorTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, colorTexture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, pixelType, null)
	gl.bindTexture(gl.TEXTURE_2D, null)

	return colorTexture;
}

// create depth texture
function createDepthTexture(gl, width, height, linear, addStencil) {
	let depthTextureExt = gl.getExtension("WEBGL_depth_texture")
	if (!depthTextureExt) {
		depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture")
	}

	if (!depthTextureExt && !WEBGL2) {
		return null;
	}

	let filter = gl.NEAREST;
	if (linear) {
		filter = gl.LINEAR;
	}

	let depthTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_2D, depthTexture)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	if (addStencil) {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, width, height, 0, gl.DEPTH_STENCIL, 
			WEBGL2 ? gl.UNSIGNED_INT_24_8 : depthTextureExt.UNSIGNED_INT_24_8_WEBGL, null)
	}
	else {
		gl.texImage2D(gl.TEXTURE_2D, 0, WEBGL2 ? gl.DEPTH_COMPONENT16 : gl.DEPTH_COMPONENT, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
	}
	gl.bindTexture(gl.TEXTURE_2D, null)

	return depthTexture;
}

// create framebuffer object from textures, matching output of createRenderTextureAndBuffer
function createFramebuffer(gl, width, height, colorTexture, depthTexture, addDepth, addStencil) {

	if (addDepth == null) {
		addDepth = true;
	}

	if (addStencil == null) {
		addStencil = false;
	}
	
		// create a render buffer

	var frameBuffer = gl.createFramebuffer()

		// bind depth buffer and color texture to frame buffer

	let haveScene = (typeof scene !== "undefined" && scene !== false)
	let oldFrameBuffer = false
	if (haveScene) { 
		oldFrameBuffer = scene.bindFramebuffer(gl, frameBuffer) 
	}
	else {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
	}
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0)
	if (addDepth) {
		if (depthTexture) {
			if (addStencil) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)	
			}
			else {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
			}
		}
		else {
			var depthBuffer = gl.createRenderbuffer()
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height)
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)	
		}
	}
	if (haveScene) { 
		scene.bindFramebuffer(gl, oldFrameBuffer) 
	}
	return {texture:colorTexture, depthTexture:depthTexture, buffer:frameBuffer, width:width, height:height}
}

function createCubemapRenderTextureAndBuffer(gl, width, pixelType, addDepth) {

	let depthTextureExt = gl.getExtension("WEBGL_depth_texture")
	if (!depthTextureExt) {
		depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture")
	}

		// create a render buffer

	var frameBuffer = gl.createFramebuffer()

		// create a color texture
	
	var colorTexture = gl.createTexture()
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, colorTexture);
	//gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, width, width, 0, gl.RGBA, pixelType, null)	
	
	var depthTexture = false

	// bind depth buffer to frame buffer
	// color texture for each face bound at draw time
		
	let haveScene = (typeof scene !== "undefined" && scene !== false)
	let oldFrameBuffer = false
	if (haveScene) { 
		oldFrameBuffer = scene.bindFramebuffer(gl, frameBuffer) 
	}
	else {
		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
	}

	if (addDepth) {
		if (depthTextureExt || WEBGL2) {	
			depthTexture = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, depthTexture)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			gl.texImage2D(gl.TEXTURE_2D, 0, WEBGL2 ? gl.DEPTH_COMPONENT16 : gl.DEPTH_COMPONENT, width, width, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0)
		}
		else {
			var depthBuffer = gl.createRenderbuffer()
			gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, width)
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer)
		}
	}
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null)
	if (haveScene) { 
		scene.bindFramebuffer(gl, oldFrameBuffer) 
	}
	return {texture:colorTexture, depthTexture:depthTexture, buffer:frameBuffer, width:width}
}

