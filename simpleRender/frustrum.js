function Frustrum() {
	var i
	this.planes = []
	for (i=0; i < 6; i++) {
		this.planes[i] = {c:0, n:[0, 0, 0]}
	}
	this.v = []
	for (i=0; i < 8; i++) {
		this.v[i] = []
	}
	this.lbb = []
}

Frustrum.prototype.frustrumFromMatrix = function (matrix) {
    var planes = this.planes;
    // Left clipping plane
    planes[0].n[0] = matrix[3] + matrix[0];
    planes[0].n[1] = matrix[7] + matrix[4];
    planes[0].n[2] = matrix[11] + matrix[8];
    planes[0].c = matrix[15] + matrix[12];
    // Right clipping plane
    planes[1].n[0] = matrix[3] - matrix[0];
    planes[1].n[1] = matrix[7] - matrix[4];
    planes[1].n[2] = matrix[11] - matrix[8];
    planes[1].c = matrix[15] - matrix[12];
    // Top clipping plane
    planes[2].n[0] = matrix[3] - matrix[1];
    planes[2].n[1] = matrix[7] - matrix[5];
    planes[2].n[2] = matrix[11] - matrix[9];
    planes[2].c = matrix[15] - matrix[13];
    // Bottom clipping plane
    planes[3].n[0] = matrix[3] + matrix[1];
    planes[3].n[1] = matrix[7] + matrix[5];
    planes[3].n[2] = matrix[11] + matrix[9];
    planes[3].c = matrix[15] + matrix[13];
    // Near clipping plane
    planes[4].n[0] = matrix[3] + matrix[2];
    planes[4].n[1] = matrix[7] + matrix[6];
    planes[4].n[2] = matrix[11] + matrix[10];
    planes[4].c = matrix[15] + matrix[14];
}

Frustrum.prototype.planeDistance = function (plane, p) {
	return plane.n[0]*p[0] + plane.n[1]*p[1] + plane.n[2]*p[2] + plane.c;
}

Frustrum.prototype.inside = function (bb) {
	var v = this.v;
	var index, i, j, k, p, out;
	var planes = this.planes;

	index = 0
	for (i=2; i < 6; i += 3) {
		for (j=1; j < 6; j += 3) {
			for (k=0; k < 6; k += 3) {
				p = v[index++]
				p[0] = bb[k]
				p[1] = bb[j]
				p[2] = bb[i]
			}
		}
	}

	for (i=0; i < 5; i++) {
		out = 0
		for (j=0; j < 8; j++) {
			if (this.planeDistance(planes[i], v[j]) < 0) {
				out++
			}
		}
		if (out == 8) {
			return false
		}
	}
	return true
}

Frustrum.prototype.interpBoundingBox = function (out, bb1, bb2, ratio) {
	var i;
	for (i=0; i < 6; i++) {
		out[i] = bb1[i]*(1.0 - ratio) + bb2[i]*ratio;
	}
}

Frustrum.prototype.projectToGround = function (out, lightVector, point) {
	var d = -point[1]/lightVector[1];
	out[0] = d*lightVector[0] + point[0];
	out[1] = d*lightVector[1] + point[1];
	out[2] = d*lightVector[2] + point[2];
}

Frustrum.prototype.addShadow = function (bb, lightVector) {
	var v = this.v
	var lbb = this.lbb
	var p = v[0]
	var i

	p[0] = bb[0]
	p[1] = bb[4]
	p[2] = bb[2]

	p = v[1]
	p[0] = bb[3]
	p[1] = bb[4]
	p[2] = bb[2]

	p = v[2]
	p[0] = bb[3]
	p[1] = bb[4]
	p[2] = bb[5]

	p = v[3]
	p[0] = bb[0]
	p[1] = bb[4]
	p[2] = bb[5]

	for (i=0; i < 6; i++) {
		lbb[i] = bb[i]
	}
	p = v[4]
	for (i=0; i < 4; i++) {
		this.projectToGround(p, lightVector, v[i])
		if (p[0] <lbb[0]) {
			lbb[0] = p[0]
		} else if (p[0] > lbb[3]) {
			lbb[3] = p[0]
		}
		if (p[1] <lbb[1]) {
			lbb[1] = p[1]
		} else if (p[1] > lbb[4]) {
			lbb[4] = p[1]
		}
		if (p[2] <lbb[2]) {
			lbb[2] = p[2]
		} else if (p[2] > lbb[5]) {
			lbb[5] = p[2]
		}
	}
	return lbb
}

Frustrum.prototype.insideWithShadow = function (bb, lightVector) {
	var lbb = this.addShadow(bb, lightVector)
	return this.inside(lbb)
}