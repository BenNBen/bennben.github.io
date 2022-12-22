/*
	@Purpose: multiply matrices
*/

function matrixMultiply(matrix1, matrix2, scratch) {
	scratch.set(matrix1)

	function modifyMatrix(vec, index) {
		matrix1[index] = scratch[0] * vec[0] + scratch[4] * vec[1] + scratch[8] * vec[2] + scratch[12] * vec[3];
		matrix1[index + 1] = scratch[1] * vec[0] + scratch[5] * vec[1] + scratch[9] * vec[2] + scratch[13] * vec[3];
		matrix1[index + 2] = scratch[2] * vec[0] + scratch[6] * vec[1] + scratch[10] * vec[2] + scratch[14] * vec[3];
		matrix1[index + 3] = scratch[3] * vec[0] + scratch[7] * vec[1] + scratch[11] * vec[2] + scratch[15] * vec[3];
	}

	modifyMatrix([matrix2[0], matrix2[1], matrix2[2], matrix2[3]], 0);
	modifyMatrix([matrix2[4], matrix2[5], matrix2[6], matrix2[7]], 4);
	modifyMatrix([matrix2[8], matrix2[9], matrix2[10], matrix2[11]], 8);
	modifyMatrix([matrix2[12], matrix2[13], matrix2[14], matrix2[15]], 12);
}

function multiplyMat(matrix1, matrix2, scratch) {
	scratch.set(matrix1)

	function modifyMatrix(vec,index){
		matrix1[index] = scratch[0]*vec[0]+scratch[4]*vec[1]+scratch[8]*vec[2]+scratch[12]*vec[3];
		matrix1[index+1] = scratch[1]*vec[0]+scratch[5]*vec[1]+scratch[9]*vec[2]+scratch[13]*vec[3];
		matrix1[index+2] = scratch[2]*vec[0]+scratch[6]*vec[1]+scratch[10]*vec[2]+scratch[14]*vec[3];
		matrix1[index+3] = scratch[3]*vec[0]+scratch[7]*vec[1]+scratch[11]*vec[2]+scratch[15]*vec[3];
	}

	modifyMatrix([matrix2[0], matrix2[1], matrix2[2], matrix2[3]], 0);
	modifyMatrix([matrix2[4], matrix2[5], matrix2[6], matrix2[7]], 4);
	modifyMatrix([matrix2[8], matrix2[9], matrix2[10], matrix2[11]], 8);
	modifyMatrix([matrix2[12], matrix2[13], matrix2[14], matrix2[15]], 12);
}

function normalizeMatrix(normalMat, matrix) {
	var determinent = matrix[0]*(matrix[10]*matrix[5] - matrix[9]*matrix[6])
	 								- matrix[4]*(matrix[10]*matrix[1] - matrix[9]*matrix[2]) +
										matrix[8]*(matrix[6]*matrix[1] - matrix[5]*matrix[2]);

	normalMat[0] = (matrix[10]*matrix[5] - matrix[9]*matrix[6])/determinent;
	normalMat[3] = -(matrix[10]*matrix[1] - matrix[9]*matrix[2])/determinent;
	normalMat[6] = (matrix[6]*matrix[1] - matrix[5]*matrix[2])/determinent;
	normalMat[1] = -(matrix[10]*matrix[4] - matrix[8]*matrix[6])/determinent;
	normalMat[4] = (matrix[10]*matrix[0] - matrix[8]*matrix[2])/determinent;
	normalMat[7] = -(matrix[6]*matrix[0] - matrix[4]*matrix[2])/determinent;
	normalMat[2] = (matrix[9]*matrix[4] - matrix[8]*matrix[5])/determinent;
	normalMat[5] = -(matrix[9]*matrix[0] - matrix[8]*matrix[1])/determinent;
	normalMat[8] = (matrix[5]*matrix[0] - matrix[4]*matrix[1])/determinent;
}

function matrixTimesVector4(ovector, m, vector) {
	var v1 = vector[0];
	var v2 = vector[1];
	var v3 = vector[2];
	var v4 = vector[3];


	ovector[0] = m[0]*v1+m[4]*v2+m[8]*v3+m[12]*v4;
	ovector[1] = m[1]*v1+m[5]*v2+m[9]*v3+m[13]*v4;
	ovector[2] = m[2]*v1+m[6]*v2+m[10]*v3+m[14]*v4;
	ovector[3] = m[3]*v1+m[7]*v2+m[11]*v3+m[15]*v4;
}

function matrixTimesVector4offset(ovector, m, vector, outOffset, inOffset) {
	var v1 = vector[0 + inOffset];
	var v2 = vector[1 + inOffset];
	var v3 = vector[2 + inOffset];
	var v4 = vector[3 + inOffset];


	ovector[0 + outOffset] = m[0]*v1+m[4]*v2+m[8]*v3+m[12]*v4;
	ovector[1 + outOffset] = m[1]*v1+m[5]*v2+m[9]*v3+m[13]*v4;
	ovector[2 + outOffset] = m[2]*v1+m[6]*v2+m[10]*v3+m[14]*v4;
	ovector[3 + outOffset] = m[3]*v1+m[7]*v2+m[11]*v3+m[15]*v4;
}

function matrixTimesVector3(ovector, m, vector) {
	var v1 = vector[0];
	var v2 = vector[1];
	var v3 = vector[2];


	ovector[0] = m[0]*v1+m[4]*v2+m[8]*v3;
	ovector[1] = m[1]*v1+m[5]*v2+m[9]*v3;
	ovector[2] = m[2]*v1+m[6]*v2+m[10]*v3;
}

function matrixTimesVector3offset(ovector, m, vector, outOffset, inOffset) {
	var v1 = vector[0 + inOffset];
	var v2 = vector[1 + inOffset];
	var v3 = vector[2 + inOffset];


	ovector[0 + outOffset] = m[0]*v1+m[4]*v2+m[8]*v3 + m[12];
	ovector[1 + outOffset] = m[1]*v1+m[5]*v2+m[9]*v3 + m[13];
	ovector[2 + outOffset] = m[2]*v1+m[6]*v2+m[10]*v3 + m[14];
}


function translateMatrix(m, v) {
	m[0] = 1
	m[1] = 0
	m[2] = 0
	m[3] = 0

	m[4] = 0
	m[5] = 1
	m[6] = 0
	m[7] = 0

	m[8] = 0
	m[9] = 0
	m[10] = 1
	m[11] = 0

	m[12] = v[0]
	m[13] = v[1]
	m[14] = v[2]
	m[15] = 1
}

function displaceMatrix(m,v){
	m[12] += v[0]
	m[13] += v[1]
	m[14] += v[2]
}

function scaleMatrix(m, v) {
	m[0] = v[0]
	m[1] = 0
	m[2] = 0
	m[3] = 0

	m[4] = 0
	m[5] = v[1]
	m[6] = 0
	m[7] = 0

	m[8] = 0
	m[9] = 0
	m[10] = v[2]
	m[11] = 0

	m[12] = 0
	m[13] = 0
	m[14] = 0
	m[15] = 1
}

function quarternionRotationAndTranslation(matrix,quarternion,translation){
	var x = quarternion[0];
	var  y = quarternion[1];
	var z = quarternion[2];
	var w = quarternion[3];

	matrix[0] = 1 - 2 * (y * y + z * z);
	matrix[1] = 2 * (x * y + z * w)
	matrix[2] = 2 * (x * z - y * w)
	matrix[3] = 0;
	matrix[4] = 2 * (x * y - z * w)
	matrix[5] = 1 - 2 * (x * x + z * z)
	matrix[6] = 2 * (z * y + x * w)
	matrix[7] = 0;
	matrix[8] = 2 * (x * z + y * w)
	matrix[9] = 2 * (y * z - x * w)
	matrix[10] = 1 - 2 * (x * x + y * y)
	matrix[11] = 0;
	matrix[12] = translation[0]
	matrix[13] = translation[1]
	matrix[14] = translation[2]
	matrix[15] = 1;
}

function xRotationMatrix(m, a) {
	var cosa = Math.cos(a)
	var sina = Math.sin(a)


	m[0] = 1
	m[1] = 0
	m[2] = 0
	m[3] = 0

	m[4] = 0
	m[5] = cosa
	m[6] = sina
	m[7] = 0

	m[8] = 0
	m[9] = -sina
	m[10] = cosa
	m[11] = 0

	m[12] = 0
	m[13] = 0
	m[14] = 0
	m[15] = 1
}

function yRotationMatrix(m, a) {
	var cosa = Math.cos(a)
	var sina = Math.sin(a)

	m[0] = cosa
	m[1] = 0
	m[2] = -sina
	m[3] = 0

	m[4] = 0
	m[5] = 1
	m[6] = 0
	m[7] = 0

	m[8] = sina
	m[9] = 0
	m[10] = cosa
	m[11] = 0

	m[12] = 0
	m[13] = 0
	m[14] = 0
	m[15] = 1
}

function zRotationMatrix(m, a) {
	var cosa = Math.cos(a)
	var sina = Math.sin(a)

	m[0] = cosa
	m[1] = sina
	m[2] = 0
	m[3] = 0

	m[4] = -sina
	m[5] = cosa
	m[6] = 0
	m[7] = 0

	m[8] = 0
	m[9] = 0
	m[10] = 1
	m[11] = 0

	m[12] = 0
	m[13] = 0
	m[14] = 0
	m[15] = 1
}

function perspective(m, fovy, aspect, zNear, zFar) {
	var ymax = zNear*Math.tan(fovy*Math.PI/360)
	var ymin = -ymax
	var xmin = ymin*aspect
	var xmax = ymax*aspect

	var A = (xmax + xmin)/(xmax - xmin)
	var B = (ymax + ymin)/(ymax - ymin)
	var C = -(zFar + zNear)/(zFar - zNear)
	var D = -2*(zFar*zNear)/(zFar - zNear)
	var E = 2*zNear/(xmax - xmin)
	var F = 2*zNear/(ymax - ymin)

	m[0] = E
	m[1] = 0
	m[2] = A
	m[3] = 0

	m[4] = 0
	m[5] = F
	m[6] = B
	m[7] = 0

	m[8] = 0
	m[9] = 0
	m[10] = C
	m[11] = -1

	m[12] = 0
	m[13] = 0
	m[14] = D
	m[15] = 0
}

function ortho(m, minx, maxx, miny, maxy, minz, maxz) {

	m[0] = 2/(maxx - minx)
	m[4] = 0
	m[8] = 0
	m[12] = -(maxx + minx)/(maxx - minx)

	m[1] = 0
	m[5] = 2/(maxy - miny)
	m[9] = 0
	m[13] = -(maxy + miny)/(maxy - miny)

	m[2] = 0
	m[6] = 0
	m[10] = -2/(maxz - minz)
	m[14] = -(maxz + minz)/(maxz - minz)

	m[3] = 0
	m[7] = 0
	m[11] = 0
	m[15] = 1

}

function lookAt(matrix, eye, center, upVector) {
	var forward = new Float32Array(3)
	var side = new Float32Array(3)
	var up = new Float32Array(3)
	var tmp = new Float32Array(3)
	var m = new Float32Array(16)
	var et = new Float32Array(16)

	Vec3_normalize(forward, Vec3_sub(tmp, center, eye))
	console.log("forward "+forward[0]+" "+forward[1]+" "+forward[2])
	console.log("upVector "+upVector[0]+" "+upVector[1]+" "+upVector[2])
	Vec3_normalize(side, Vec3_cross(tmp, forward, upVector))
	console.log("tmp "+tmp[0]+" "+tmp[1]+" "+tmp[2])
	console.log("side "+side[0]+" "+side[1]+" "+side[2])
	Vec3_cross(up, side, forward)
	console.log("up "+up[0]+" "+up[1]+" "+up[2])

	matrix[0] = side[0]
	matrix[4] = side[1]
	matrix[8] = side[2]
	matrix[12] = 0

	matrix[1] = up[0]
	matrix[5] = up[1]
	matrix[9] = up[2]
	matrix[13] = 0

	matrix[2] = -forward[0]
	matrix[6] = -forward[1]
	matrix[10] = -forward[2]
	matrix[14] = 0

	matrix[3] = 0
	matrix[7] = 0
	matrix[11] = 0
	matrix[15] = 1

	et[0] = 1
	et[1] = 0
	et[2] = 0
	et[3] = 0

	et[4] = 0
	et[5] = 1
	et[6] = 0
	et[7] = 0

	et[8] = 0
	et[9] = 0
	et[10] = 1
	et[11] = 0

	et[12] = -eye[0]
	et[13] = -eye[1]
	et[14] = -eye[2]
	et[15] = 1
	multiplyMat(matrix, et, m)
}

function Vec3_cross(out, a, b) {
	out[0] = a[1]*b[2] - a[2]*b[1]
	out[1] = a[2]*b[0] - a[0]*b[2]
	out[2] = a[0]*b[1] - a[1]*b[0]
	return out
}

function Vec3_dot(a, b) {
	return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}

function Vec3_sub(out, b, a) {
	out[0] = b[0] - a[0]
	out[1] = b[1] - a[1]
	out[2] = b[2] - a[2]
	return out
}

function Vec3_add(out, b, a) {
	out[0] = b[0] + a[0]
	out[1] = b[1] + a[1]
	out[2] = b[2] + a[2]
	return out
}

function Vec3_normalize(out, v) {
	var mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
	out[0] = v[0]/mag
	out[1] = v[1]/mag
	out[2] = v[2]/mag
	return out
}

function Vec3_smul(out, s, v) {
	out[0] = v[0]*s;
	out[1] = v[1]*s;
	out[2] = v[2]*s;
	return out
}


// matrixinv.js -- invert a matrix using gaussian elimination

function matrixinv(im) {
	var i, j, k, dim, pe, mcount, ipr, pv;
	var m = [];
	var invm = [];
	var epsilon = 1e-9;

	var swap = function (a, b) {
		var t = m[a];
		m[a] = m[b];
		m[b] = t;
		t = invm[a];
		invm[a] = invm[b];
		invm[b] = t;
	};

	var findNonZero = function (a) {
		var i;
		var count = m.length;
		for (i=a; i < count; i++) {
			if (Math.abs(m[i][a]) > epsilon) {
				return i;
			}
		}
		return -1;
	};

	var show = function () {
	    var i,j;
		var count = m.length;
		console.log("---------------------");
	    for (i=0; i < count; i++) {
	        var str = "";
	        for (j=0; j < count; j++) {
	            str = str + " " + m[i][j];
	        }
	        console.log(str);
	    }
		console.log("---------------------");
	};

	dim = Math.sqrt(im.length);
	k = 0;
	for (i=0; i < dim; i++) {
		m[i] = [];
		invm[i] = [];
		for (j=0; j < dim; j++) {
			m[i][j] = im[k];
			k += 1;
			invm[i][j] = 0;
			if (i === j) {
				invm[i][j] = 1;
			}
		}
	}

	mcount = m.length;
	for (pe=0; pe < mcount; pe++) {

		// find a good row for the current pivot. swap rows if need be

		ipr = findNonZero(pe);
		if (ipr < 0) {
			console.log("NO PIVOT FOUND");
		}
		if (ipr !== pe) {
			swap(ipr, pe);
		}
		// divide all elements in each row by the pivot element in that row
		// unless it is already zero

		for (i=0; i < mcount; i++) {
			pv = m[i][pe];
			if (Math.abs(pv) > epsilon) {
				for (j=0; j < mcount; j++) {
					m[i][j] /= pv;
					invm[i][j] /= pv;
				}
			}
		}

		// subtract the pivot row from all other rows unless pivot element
		// in that row is already zero

		for (i=0; i < mcount; i++) {
			if ( i !== pe && Math.abs(m[i][pe]) > epsilon) {
				for (j=0; j < mcount; j++) {
					m[i][j] -= m[pe][j];
					invm[i][j] -= invm[pe][j];
				}
			}
		}
	}

		// divide vector element by pivot element in matching row for solution

	for (i=0; i < mcount; i++) {
		for (j=0; j < mcount; j++) {
			invm[i][j] /= m[i][i];
		}
	}

	var invma = new Float32Array(mcount*mcount);
	k = 0;
	for (i=0; i < mcount; i++) {
		for (j=0; j < mcount; j++) {
			invma[k] = invm[i][j];
			k += 1;
		}
	}
	return invma;
}

function dotProduct(vec1, vec2) {
	return vec1[0]*vec2[0] + vec1[1]*vec2[1] + vec1[2]*vec2[2]
}

function vecLength(vec) {
	return Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2])
}

// Returns angle in radians
function getVecAngle(vec1, vec2) {
	return Math.acos(dotProduct(vec1, vec2)/(vecLength(vec1)*vecLength(vec2)))
}

function copyMatrix(from, to){
	for (i=0; i<16; i++){
		to[i] = from[i]
	}
}
