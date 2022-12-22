particle_textures = [];
//particle System for the app
particleSystem = {
  effects: [],
  uniqueEffects: [],
  namedEffects: [],
  ribbonAttributes: ["pos", "rgba", "next", "prev", "uvs", "dimension"],
  ribbonAttributes3D: ["pos", "rgba", "uvs"],
  cpuAttributes: ["uvs", "spriteCorners", "rgba", "pos"],
  gpuAttributes: ["longevity", "birth", "uvs", "spriteCorners", "velocity",
    "spread", "rgba", "endRGBA", "rotation", "scales"],
  ribbonAttributesGPU: ["longevity", "birth", "uvs", "velocity",
    "spread", "rgba", "endRGBA", "scales", "direction"],
  defaultTexture: false,
  drawBB: false,
}

particleSystem.getMatrices = function (viewMatrix, projMatrix, parent, emitterMatrix) {
  var rv = [];
  displaceMatrix(viewMatrix, [0, 0, 0.025]);
  parent.projectionMatrix.set(projMatrix);
  parent.viewMatrix.set(viewMatrix);
  multiplyMat(parent.viewMatrix, parent.modelMatrix, parent.scratchMatrix);
  if (emitterMatrix) {
    multiplyMat(parent.viewMatrix, emitterMatrix, parent.scratchMatrix, true);
  }
  rv[0] = parent.viewMatrix;

  multiplyMat(parent.projectionMatrix, parent.viewMatrix, parent.scratchMatrix);
  rv[1] = parent.projectionMatrix;
  displaceMatrix(viewMatrix, [0, 0, -0.025]);
  if (vrMultiview && vrMultiview.isActive) {
    let viewMatrix1 = vrMultiview.views[1].viewMatrix;
    let projMatrix1 = vrMultiview.views[1].projectionMatrix;
    displaceMatrix(viewMatrix1, [0, 0, 0.025]);
    parent.projectionMatrix1.set(projMatrix1);
    parent.viewMatrix1.set(viewMatrix1);
    multiplyMat(parent.viewMatrix1, parent.modelMatrix, parent.scratchMatrix);
    if (emitterMatrix) {
      multiplyMat(parent.viewMatrix1, emitterMatrix, parent.scratchMatrix, true);
    }
    rv[2] = parent.viewMatrix1;

    multiplyMat(parent.projectionMatrix1, parent.viewMatrix1, parent.scratchMatrix);
    rv[3] = parent.projectionMatrix1;
    displaceMatrix(viewMatrix1, [0, 0, -0.025]);
  }
  return rv;
}

particleSystem.applyTexture = function (texture, locations) {
  var ps = particleSystem;
  var gl = ps.gl;
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(locations.texturemap, 0);
}

particleSystem.disableAttributes = function (attributes, set) {
  var ps = particleSystem;
  var gl = ps.gl;
  var len = set.length;
  for (var i = 0; i < len; i++) {
    gl.disableVertexAttribArray(attributes[set[i]]);
  }
}

particleSystem.enableAttributes = function (attributes, set, check) {
  var ps = particleSystem;
  var gl = ps.gl;
  var len = set.length;
  for (var i = 0; i < len; i++) {
    gl.enableVertexAttribArray(attributes[set[i]]);
  }
}

angle = function (x1, y1, z1, x2, y2, z2) {
  return (Math.acos(x1 * x2 + y1 * y2 + z1 * z2) * 360) / (Math.PI * 2);
};

/*
    purpose: establish a new particle effect in the app
    @param o: a dictionary containing some information about the particle effect
*/
function ParticleEffect(o) {
  this.emitters = o.emitters || [];
  this.scratchMatrix = new Float32Array(16);
  this.projectionMatrix = new Float32Array(16);
  this.viewMatrix = new Float32Array(16);
  if (vrMultiview) {
    this.projectionMatrix1 = new Float32Array(16);
    this.viewMatrix1 = new Float32Array(16);
  }
  this.modelMatrix = new Float32Array(16);
  this.position = o.position || [0, 0, 0];
  this.direction = o.direction || [0, 0, 0];
  this.normal = o.normal || [0, 0, 0];
  this.scale = o.scale || [1, 1, 1];
  this.modifyModelMatrix(this.position, this.direction, this.normal, this.scale);
  this.startTime = false;
}

function copyEffect(src) {
  var effect = new ParticleEffect({})
  for (var key in src['emitters']) {
    var e = src["emitters"][key];
    if (e.type === "cpu") {
      effect.addEmitter(e);
    } else {
      effect.addGPUEmitter(e);
    }
  }
  return effect;
}

ParticleEffect.prototype.findAttachedVariable = function () {
  var ps = particleSystem;
  var v = this.attachedVariable;
  if (v.length < 3) {
    return;
  }
  var x = v[0] * 1;
  var y = v[1] * 1;
  var z = v[2] * 1;
  for (var i = 0; i < this.emitters.length; i++) {
    if (this.emitters[i].type === "cpu") {
      ps.updatePosition(this.emitters[i], [x, y, z]);
    } else {
      this.modifyModelMatrix([x, y, z], this.direction, this.normal, this.scale);
    }
  }
}

ParticleEffect.prototype.findAttachedPosition = function () {
  var ps = particleSystem;
  var obj = this.attachedObject;
  var anim = obj.animationdata[0];
  var anim2 = obj.animationdata[1];
  var vdt = anim.vdt;
  var vdt2 = anim.vdt;
  var index1 = this.tIndices[0];
  var index2 = this.tIndices[1];
  var index3 = this.tIndices[2];
  var index4 = this.tIndices[3];
  var vert1 = [vdt[index1 * 3], vdt[index1 * 3 + 1], vdt[index1 * 3 + 2]];
  var vert2 = [vdt[index2 * 3], vdt[index2 * 3 + 1], vdt[index2 * 3 + 2]];
  var vert3 = [vdt[index3 * 3], vdt[index3 * 3 + 1], vdt[index3 * 3 + 2]];
  var vert4 = [vdt[index4 * 3], vdt[index4 * 3 + 1], vdt[index4 * 3 + 2]];
  var xVec = [vert1[0], vert2[0], vert3[0], vert4[0]];
  var yVec = [vert1[1], vert2[1], vert3[1], vert4[1]];
  var zVec = [vert1[2], vert2[2], vert3[2], vert4[2]];
  var vert1 = [vdt2[index1 * 3], vdt2[index1 * 3 + 1], vdt2[index1 * 3 + 2]];
  var vert2 = [vdt2[index2 * 3], vdt2[index2 * 3 + 1], vdt2[index2 * 3 + 2]];
  var vert3 = [vdt2[index3 * 3], vdt2[index3 * 3 + 1], vdt2[index3 * 3 + 2]];
  var vert4 = [vdt2[index4 * 3], vdt2[index4 * 3 + 1], vdt2[index4 * 3 + 2]];
  var xVec2 = [vert1[0], vert2[0], vert3[0], vert4[0]];
  var yVec2 = [vert1[1], vert2[1], vert3[1], vert4[1]];
  var zVec2 = [vert1[2], vert2[2], vert3[2], vert4[2]];
  var ratio = app.ratio;
  xVec = vec3FloatAdd(xVec, vec3FloatScale(ratio, vec3FloatSub(xVec2, xVec)));
  yVec = vec3FloatAdd(yVec, vec3FloatScale(ratio, vec3FloatSub(yVec2, yVec)));
  zVec = vec3FloatAdd(zVec, vec3FloatScale(ratio, vec3FloatSub(zVec2, zVec)));
  var x = vec3FloatDot(this.attachedBarycentric, xVec);
  var y = vec3FloatDot(this.attachedBarycentric, yVec);
  var z = vec3FloatDot(this.attachedBarycentric, zVec);
  for (var i = 0; i < this.emitters.length; i++) {
    if (this.emitters[i].type === "cpu") {
      ps.updatePosition(this.emitters[i], [x, y, z]);
    } else {
      this.modifyModelMatrix([x, y, z], this.direction, this.normal, this.scale);
    }
  }

}

ParticleEffect.prototype.modifyColor = function (rgb) {
  var eLen = this.emitters.length;
  for (var i = 0; i < eLen; i++) {
    var e = this.emitters[i];
    e.ucolor = rgb;
  }
}

ParticleEffect.prototype.attachToObject = function (objectIndex, tet, offsetFlag) {
  var obj = feDrawables.objects[objectIndex];
  var anim = obj.animationdata[0];
  var vdt = anim.vdt;
  var tdt = anim.tdt;
  var tet = tet || 0;

  var index1 = tdt[tet * 4];
  var index2 = tdt[tet * 4] + 1;
  var index3 = tdt[tet * 4] + 2;
  var index4 = tdt[tet * 4] + 3;

  var verts = [];
  verts.push(vdt[index1 * 3], vdt[index1 * 3 + 1], vdt[index1 * 3 + 2]);
  verts.push(vdt[index2 * 3], vdt[index2 * 3 + 1], vdt[index2 * 3 + 2]);
  verts.push(vdt[index3 * 3], vdt[index3 * 3 + 1], vdt[index3 * 3 + 2]);
  verts.push(vdt[index4 * 3], vdt[index4 * 3 + 1], vdt[index4 * 3 + 2]);

  this.tIndices = [index1, index2, index3, index4];
  this.attachedObject = obj;
  offsetFlag = offsetFlag || 0;
  this.attachedBarycentric = calcBarycentric(verts, offsetFlag);
}

ParticleEffect.prototype.modifyModelMatrix = function (pos, direction, normal, scale) {
  var ps = particleSystem;
  this.pos = pos || [0, 0, 0];
  this.direction = direction || [0, 0, 0];
  this.normal = normal || [0, 0, 0];
  this.scale = scale || [1, 1, 1];
  translateMatrix(this.modelMatrix, this.pos);
  var scaleMat = new Float32Array(16);
  var scratch = new Float32Array(16);
  scaleMatrix(scaleMat, this.scale);
  multiplyMat(this.modelMatrix, scaleMat, scratch);
  this.modelMatrix = ps.rotatedMatrix(this.direction, this.modelMatrix);
  this.modelMatrix = ps.perpendicularMatrix(this.normal, this.modelMatrix);
}

particleSystem.rotatedMatrix = function (direction, modelMatrix) {
  var s1 = new Float32Array(16);
  var s2 = new Float32Array(16);
  // below code checks whether a given rotation exists and properly rotates the particle effect/s model matrix appropriately
  if (direction[1] != 0) { //y rotation matrix
    yRotationMatrix(s1, direction[1]);
    multiplyMat(modelMatrix, s1, s2);
  }
  if (direction[0] != 0) { //x rotation matrix
    xRotationMatrix(s1, direction[0]);
    multiplyMat(modelMatrix, s1, s2);
  }
  if (direction[2] != 0) { //z rotation matrix
    zRotationMatrix(s1, direction[2]);
    multiplyMat(modelMatrix, s1, s2);
  }
  return modelMatrix;
}

particleSystem.perpendicularMatrix = function (normals, modelMatrix) {

  if (normals[0] === 0 && normals[1] === 0 && normals[2] === 0) {
    return modelMatrix
  }

  function checkYAxis(normals) {
    if (Math.abs(normals[1]) > 0.98) {
      return true;
    }
    else {
      return false;
    }
  }

  var tan0 = [];
  tan0 = Vec3_cross(tan0, normals, [0, 1, 0]);
  if (Vec3_dot(tan0, tan0) < 0.001) {
    tan0 = Vec3_cross(tan0, normals, [1, 0, 0]);
  }

  var nVec0 = [];
  var nVec1 = [];
  nVec0 = Vec3_normalize(nVec0, tan0);
  var tempVec = [];
  tempVec = Vec3_cross(tempVec, normals, nVec0);
  nVec1 = Vec3_normalize(nVec1, tempVec);
  if (checkYAxis(normals) === true) {
    modelMatrix[0] = nVec1[0];
    modelMatrix[4] = nVec1[1];
    modelMatrix[8] = nVec1[2];
    modelMatrix[1] = nVec0[0];
    modelMatrix[5] = nVec0[1];
    modelMatrix[9] = nVec0[2];
  } else {
    modelMatrix[0] = nVec0[0];
    modelMatrix[4] = nVec0[1];
    modelMatrix[8] = nVec0[2];
    modelMatrix[1] = nVec1[0];
    modelMatrix[5] = nVec1[1];
    modelMatrix[9] = nVec1[2];
  }
  modelMatrix[2] = normals[0];
  modelMatrix[6] = normals[1];
  modelMatrix[10] = normals[2];
  modelMatrix[15] = 1.0;
  modelMatrix[3] = 0;
  modelMatrix[7] = 0;
  modelMatrix[11] = 0;
  return modelMatrix;
}

/*
    @purpose: initialize the particle system in the app
    @param gl: the webgl context of the app
*/
particleSystem.init = function (gl, editFlag) {
  var ps = particleSystem;
  ps.gl = gl;
  ps.setupShaders();
  ps.editFlag = editFlag || false;
  ps.paused = false;
  ps.effects[0] = new ParticleEffect({}); //default particle texture if there are none
}

particleSystem.removeEffects = function (remove) {
  var ps = particleSystem;
  var toRemove = remove.split(" ");
  for (var i = 0; i < toRemove.length; i++) {
    for (var j = 0; j < ps.effects.length; j++) {
      var effect = ps.effects[j];
      if (effect.identifier === toRemove[i]) {
        effect.kill();
        break;
      }
    }
  }
}


particleSystem.playGameEffect = function (effectTable) {
  var ps = particleSystem;
  var id = effectTable.uniqueID;
  var pos = effectTable.translation || [0, 0, 0];
  var normal = effectTable.normal || [0, 0, 0];
  var direction = effectTable.direction || [0, 0, 0];
  var scale = effectTable.scale || [1, 1, 1];
  var rgb = effectTable.rgb || [1, 1, 1];
  var hideIndex = effectTable.hideIndex || 0;
  if (hideIndex !== 0 && (playerNumber < 1 || hideIndex === playerNumber)) {
    return;
  }
  var attached = false;
  var objectIndex = false;
  if (effectTable.objectIndex) {
    objectIndex = effectTable.objectIndex - 1;
    attached = true;
  }
  if (ps.uniqueEffects[id]) {
    if (attached === false) {
      var effect = copyEffect(ps.uniqueEffects[id]);
      effect.modifyColor(rgb);
      effect.identifier = effectTable.effect_name;
      effect.modifyModelMatrix(pos, direction, normal, scale);
      ps.effects.push(effect);
    } else {
      var offsetFlag = effectTable.offsetFlag || 0;
      var tetRange = effectTable.tetRange || [0, 0];
      var count = (tetRange[1] + 1) - tetRange[0];
      for (var i = 0; i < count; i++) {
        var tetIndex = tetRange[0] + i;
        var effect = copyEffect(ps.uniqueEffects[id]);
        effect.modifyColor(rgb);
        effect.identifier = effectTable.effect_name;
        effect.modifyModelMatrix(pos, direction, normal, scale);
        effect.attachToObject(objectIndex, tetIndex, offsetFlag);
        ps.effects.push(effect);
      }
    }
  }
}

particleSystem.loadLibraryEffect = function (effectTable) {
  var ps = particleSystem;
  var effect = new ParticleEffect({});
  for (var key in effectTable) {
    if (effectTable[key]) {
      var emitter = effectTable[key];
      if (emitter.type) {
        if (emitter.type === "cpu") {
          effect.addEmitter(emitter);
        } else {
          effect.addGPUEmitter(emitter);
        }
        emitter.hidden = false;
      }
    }
  }
  ps.effects[0] = effect;
}

particleSystem.playLocalEffect = function (name, coord, direction, normal, scale, rgb) {
  var ps = particleSystem;
  var id = ps.namedEffects[name];
  var coord = coord || [0, 0, 0];
  var normal = normal || [0, 0, 0];
  var direction = direction || [0, 0, 0];
  var scale = scale || [1, 1, 1];
  var rgb = rgb || [1, 1, 1];
  ps.playGameEffect({ uniqueID: id, translation: coord, direction: direction, normal: normal, scale: scale, rgb: rgb });
}

particleSystem.loadGameEffect = function (effectTable) {
  var ps = particleSystem;
  var id = effectTable.uniqueID;
  var pos = effectTable.translation;
  var normal = effectTable.normal;
  var direction = effectTable.direction;
  var scale = effectTable.scale;
  var transform = { position: pos, normal: normal, direction: direction, scale: scale };
  if (!ps.uniqueEffects[id]) {
    var effect = new ParticleEffect(transform);
    for (var key in effectTable) {
      if (effectTable[key]) {
        var emitter = effectTable[key];
        if (emitter.type) {
          if (emitter.type === "cpu") {
            effect.addEmitter(emitter);
          } else {
            effect.addGPUEmitter(emitter);
          }
          emitter.hidden = false;
        }
      }
    }
    ps.uniqueEffects[id] = effect;
    effect.identifier = effectTable.effect_name
    if (effectTable.name) {
      ps.namedEffects[effectTable.name] = id;
    }
    ps.effects.push(effect);
  }
}

/*
    @purpose: load up and return a texture from the server
    @param emitter: an emitter with a texture name to load
    @return: webgl texture if the emitter has one to load, otherwise false
*/
particleSystem.loadTexture = function (emitter) {
  if (emitter && emitter.textureName && typeof (PROJECT) !== 'undefined') {
    return loadTexture(app.gl, '/particleEditor/projects/' + PROJECT + '/' + emitter.textureName);
  }
  return false;
}

/*
    @purpose: load an effect in from the server based on a table with emitter information
    @param effectTable: the dictionary of emitters being passed in as an effect
    @param override: a flag indicating whether or not the primary effect in the system should be replaced

*/
particleSystem.loadEffect = function (effectTable, override) {
  var ps = particleSystem;
  override = override || false;
  var effect = new ParticleEffect({});
  if (override === true) { // replace the primary effect of the app
    ps.effects[0] = effect;
  } else {
    ps.effects.push(effect);
  }
  for (var key in effectTable) {
    if (effectTable[key]) {
      var emitter = effectTable[key];
      if (emitter.type === "cpu") {
        effect.addEmitter(emitter);
        if (emitter.textureName) {
          effect.emitters[effect.emitters.length - 1].textureName = emitter.textureName;
          var newTexture = loadTexture(app.gl, '/particleEditor/projects/' + PROJECT + '/' + emitter.textureName); //load texture call used to get our texture from the server
          effect.emitters[effect.emitters.length - 1].texture = newTexture;
        }
      } else {
        effect.addGPUEmitter(emitter);
        if (emitter.textureName) {
          effect.emitters[effect.emitters.length - 1].textureName = emitter.textureName;
          var newTexture = loadTexture(app.gl, '/particleEditor/projects/' + PROJECT + '/' + emitter.textureName); //load texture call used to get our texture from the server
          effect.emitters[effect.emitters.length - 1].texture = newTexture;
        }
      }
      emitter.hidden = false;
    }
  }
  particleHandler.markModified();
}

particleSystem.calcDistance = function (p1, p2) {
  var distance = Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) +
    (p1[1] - p2[1]) * (p1[1] - p2[1]) +
    (p1[2] - p2[2]) * (p1[2] - p2[2]));
  return distance;
}


particleSystem.updatePosition = function (emitter, coord) {
  var ps = particleSystem;
  emitter.emissionTraveled += ps.calcDistance(emitter.position, coord);
  emitter.x = coord[0];
  emitter.y = coord[1];
  emitter.z = coord[2];
  emitter.position = coord;
}

particleSystem.updateRotation = function (emitter, rotation) {
  emitter.matRotX = rotation[0];
  emitter.matRotY = rotation[1];
  emitter.matRotZ = rotation[2];
  emitter.updateMatrix();
}

particleSystem.updateScale = function (emitter, scale) {
  emitter.matScaleX = scale[0];
  emitter.matScaleY = scale[1];
  emitter.matScaleZ = scale[2];
  emitter.updateMatrix();
}

/*
    @purpose: set up shaders for the different types of particle emitters which might exist in the app
*/
particleSystem.setupShaders = function () {
  var ps = particleSystem;
  var gl = ps.gl;

  function vDefs(str) {
    return vrMultiview ? vrMultiview.addVertexDefines(str) : str;
  }
  function fDefs(str) {
    return vrMultiview ? vrMultiview.addFragmentDefines(str) : str;
  }

  //GPU SHADERS
  ps.particleShader = createProgram(gl, vDefs(ps.vertex_GPU), fDefs(ps.gpuFragmentCode)); //standard GPU, non looping billboard particle shader
  ps.particleShaderNA = createProgram(gl, vDefs(ps.vertex_GPU_NA), fDefs(ps.gpuFragmentCode)); //GPU, non looping non billboard particle shader
  ps.particleShaderYL = createProgram(gl, vDefs(ps.vertex_GPU_LOOP), fDefs(ps.gpuFragmentCode)); //GPU, looping billboard particle shader
  ps.particleShaderYLNA = createProgram(gl, vDefs(ps.vertex_GPU_LOOP_NA), fDefs(ps.gpuFragmentCode)); //GPU, looping non billboard particle shader
  ps.ribbonShaderGPU_RIB_NA = createProgram(gl, vDefs(ps.vertex_GPU_RIB_NA), fDefs(ps.gpuFragmentCode)); //GPU, non looping non billboard ribbon shader
  ps.ribbonShaderGPU_RIB_YLNA = createProgram(gl, vDefs(ps.vertex_GPU_LOOP_RIB_NA), fDefs(ps.gpuFragmentCode)); //GPU, looping non billboard ribbon shader
  ps.ribbonShaderGPU_RIB_YL = createProgram(gl, vDefs(ps.vertex_GPU_LOOP_RIB), fDefs(ps.gpuFragmentCode)); //GPU, looping billboard ribbon shader
  ps.ribbonShaderGPU_RIB = createProgram(gl, vDefs(ps.vertex_GPU_RIB), fDefs(ps.gpuFragmentCode)); //GPU, non looping billboard ribbon shader
  //CPU SHADERS
  ps.particleShaderCPU = createProgram(gl, vDefs(ps.vertex_CPU), fDefs(ps.cpuFragmentCode)); //CPU, billboard particle shader
  ps.particleShaderCPU_NA = createProgram(gl, vDefs(ps.vertex_CPU_NA), fDefs(ps.cpuFragmentCode)); //CPU, non billboard particle shader
  ps.ribbonShader = createProgram(gl, vDefs(ps.vertex_CPU_RIB), fDefs(ps.cpuFragmentCode)); //CPU, billboard ribbon shader
  ps.ribbonShaderNA = createProgram(gl, vDefs(ps.vertex_CPU_RIB_NA), fDefs(ps.cpuFragmentCode)); //CPU, non billboard ribbon shader
  ps.ribbonShader3D = createProgram(gl, vDefs(ps.vertexCode_Ribbon3D), fDefs(ps.cpuFragmentCode)); //CPU, ribbon with 3D direction

  //locations and attributes for the particle shaders
  var locationsNL = {};
  var locationsNLNA = {};
  var locationsYL = {};
  var locationsYLNA = {};
  var locationsCPU = {};
  var locationsCPU_NA = {};
  var locationsRibbon = {};
  var locationsRibbonNA = {};
  var locationsRibbon3D = {};
  var locationsRibbonYLNA = {};
  var locationsRibbonYL = {};
  var locationsRibbonNLNA = {};
  var locationsRibbonNL = {};

  var attributesNL = {};
  var attributesNLNA = {};
  var attributesYL = {};
  var attributesYLNA = {};
  var attributesCPU = {};
  var attributesCPU_NA = {};
  var attributesRibbon = {};
  var attributesRibbonNA = {};
  var attributesRibbonYLNA = {};
  var attributesRibbonYL = {};
  var attributesRibbonNLNA = {};
  var attributesRibbonNL = {};
  var attributesRibbon3D = {};

  ps.locationsNL = locationsNL;
  ps.locationsNLNA = locationsNLNA;
  ps.locationsYL = locationsYL;
  ps.locationsYLNA = locationsYLNA;
  ps.locationsCPU = locationsCPU;
  ps.locationsCPU_NA = locationsCPU_NA;
  ps.locationsRibbon = locationsRibbon;
  ps.locationsRibbonNA = locationsRibbonNA;
  ps.locationsRibbon3D = locationsRibbon3D;
  ps.locationsRibbonYL = locationsRibbonYL;
  ps.locationsRibbonYLNA = locationsRibbonYLNA;
  ps.locationsRibbonNL = locationsRibbonNL;
  ps.locationsRibbonNLNA = locationsRibbonNLNA;

  ps.attributesNL = attributesNL;
  ps.attributesNLNA = attributesNLNA;
  ps.attributesYL = attributesYL;
  ps.attributesYLNA = attributesYLNA;
  ps.attributesCPU = attributesCPU;
  ps.attributesCPU_NA = attributesCPU_NA;
  ps.attributesRibbon = attributesRibbon;
  ps.attributesRibbonNA = attributesRibbonNA;
  ps.attributesRibbon3D = attributesRibbon3D;
  ps.attributesRibbonYL = attributesRibbonYL;
  ps.attributesRibbonYLNA = attributesRibbonYLNA;
  ps.attributesRibbonNL = attributesRibbonNL;
  ps.attributesRibbonNLNA = attributesRibbonNLNA;

  function setupRibbonAttributesAndLocationsGPU(attributes, locations, shader) {
    attributes.longevity = gl.getAttribLocation(shader, "emitterLife");
    attributes.birth = gl.getAttribLocation(shader, "birth");
    attributes.uvs = gl.getAttribLocation(shader, "uvs");
    attributes.spread = gl.getAttribLocation(shader, "emitterSpread");
    attributes.velocity = gl.getAttribLocation(shader, "velocity");
    attributes.rgba = gl.getAttribLocation(shader, "rgba");
    attributes.endRGBA = gl.getAttribLocation(shader, "endRgba");
    attributes.scales = gl.getAttribLocation(shader, "scale");
    attributes.direction = gl.getAttribLocation(shader, "direction");

    locations.timeStamp = gl.getUniformLocation(shader, "timeStamp");
    locations.rowNum = gl.getUniformLocation(shader, "rowNum");
    locations.colNum = gl.getUniformLocation(shader, "colNum");
    locations.alphaUniform = gl.getUniformLocation(shader, "initAlpha");
    locations.emitterPos = gl.getUniformLocation(shader, "emitterPos");
    locations.drag = gl.getUniformLocation(shader, "drag");
    locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
    if (vrMultiview) {
      locations.mvp_matrix1 = gl.getUniformLocation(shader, "mvpMatrix1");
    }
    locations.texturemap = gl.getUniformLocation(shader, "texturemap");
    locations.ucolor = gl.getUniformLocation(shader, "ucolor");
    locations.view = gl.getUniformLocation(shader, "viewport");
  }

  function setupRibbonAttributesAndLocations(attributes, locations, shader, billboard) {
    attributes.pos = gl.getAttribLocation(shader, "current");
    attributes.prev = gl.getAttribLocation(shader, "prev");
    attributes.next = gl.getAttribLocation(shader, "next");
    attributes.uvs = gl.getAttribLocation(shader, "uvs")
    attributes.rgba = gl.getAttribLocation(shader, "rgba")
    attributes.dimension = gl.getAttribLocation(shader, "dimension")

    locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
    if (vrMultiview) {
      locations.mvp_matrix1 = gl.getUniformLocation(shader, "mvpMatrix1");
    }
    locations.texturemap = gl.getUniformLocation(shader, "texturemap");
    locations.ucolor = gl.getUniformLocation(shader, "ucolor");
    locations.view = gl.getUniformLocation(shader, "viewport");
  }

  function setupAttributesAndLocationsGPU(attributes, locations, shader) {
    attributes.longevity = gl.getAttribLocation(shader, "emitterLife");
    attributes.birth = gl.getAttribLocation(shader, "birth");
    attributes.uvs = gl.getAttribLocation(shader, "uvs");
    attributes.spriteCorners = gl.getAttribLocation(shader, "spriteCorner");
    attributes.spread = gl.getAttribLocation(shader, "emitterSpread");
    attributes.velocity = gl.getAttribLocation(shader, "velocity");
    attributes.rgba = gl.getAttribLocation(shader, "rgba");
    attributes.endRGBA = gl.getAttribLocation(shader, "endRgba");
    attributes.rotation = gl.getAttribLocation(shader, "rotation");
    attributes.scales = gl.getAttribLocation(shader, "scale");

    locations.timeStamp = gl.getUniformLocation(shader, "timeStamp");
    locations.rowNum = gl.getUniformLocation(shader, "rowNum");
    locations.colNum = gl.getUniformLocation(shader, "colNum");
    locations.alphaUniform = gl.getUniformLocation(shader, "initAlpha");
    locations.emitterPos = gl.getUniformLocation(shader, "emitterPos");
    locations.drag = gl.getUniformLocation(shader, "drag");
    locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
    locations.mv_matrix = gl.getUniformLocation(shader, "mvMatrix");
    if (vrMultiview) {
      locations.mvp_matrix1 = gl.getUniformLocation(shader, "mvpMatrix1");
      locations.mv_matrix1 = gl.getUniformLocation(shader, "mvMatrix1");
    }
    locations.texturemap = gl.getUniformLocation(shader, "texturemap");
    locations.ucolor = gl.getUniformLocation(shader, "ucolor");
  }

  function setupAttributesAndLocationsCPU(attributes, locations, shader, billboard) {
    attributes.uvs = gl.getAttribLocation(shader, "uvs");
    attributes.spriteCorners = gl.getAttribLocation(shader, "rotatedCorner");
    attributes.rgba = gl.getAttribLocation(shader, "rgba");
    attributes.pos = gl.getAttribLocation(shader, "position");

    locations.mvp_matrix = gl.getUniformLocation(shader, "mvpMatrix");
    if (vrMultiview) {
      locations.mvp_matrix1 = gl.getUniformLocation(shader, "mvpMatrix1");
    }
    locations.texturemap = gl.getUniformLocation(shader, "texturemap");
    locations.ucolor = gl.getUniformLocation(shader, "ucolor");
    if (billboard && billboard === true) {
      locations.mv_matrix = gl.getUniformLocation(shader, "mvMatrix");
      if (vrMultiview) {
        locations.mv_matrix1 = gl.getUniformLocation(shader, "mvMatrix1");
      }
    }
  }

  // CPU SHADERS FOUND BELOW
  // particle quad, always facing user
  setupAttributesAndLocationsCPU(attributesCPU, locationsCPU, ps.particleShaderCPU, true);
  // particle quad, not always facing user
  setupAttributesAndLocationsCPU(attributesCPU_NA, locationsCPU_NA, ps.particleShaderCPU_NA, true);
  // particle ribbon, always facing user
  setupRibbonAttributesAndLocations(attributesRibbon, locationsRibbon, ps.ribbonShader);
  // particle ribbon, not always facing user
  setupRibbonAttributesAndLocations(attributesRibbonNA, locationsRibbonNA, ps.ribbonShaderNA);
  // particle ribbon, with 3D direction
  setupRibbonAttributesAndLocations(attributesRibbon3D, locationsRibbon3D, ps.ribbonShader3D);

  // GPU SHADERS FOUND BELOW
  // non loooped while always facing user
  setupAttributesAndLocationsGPU(attributesNL, locationsNL, ps.particleShader);
  // non looped without always facing user
  setupAttributesAndLocationsGPU(attributesNLNA, locationsNLNA, ps.particleShaderNA);
  // looped while always facing user
  setupAttributesAndLocationsGPU(attributesYL, locationsYL, ps.particleShaderYL);
  // looped without always facing user
  setupAttributesAndLocationsGPU(attributesYLNA, locationsYLNA, ps.particleShaderYLNA);
  // particle ribbon, always facing user
  setupRibbonAttributesAndLocationsGPU(attributesRibbonNLNA, locationsRibbonNLNA, ps.ribbonShaderGPU_RIB_NA);
  // particle ribbon, not always facing user
  setupRibbonAttributesAndLocationsGPU(attributesRibbonNL, locationsRibbonNL, ps.ribbonShaderGPU_RIB);
  // particle ribbon, always facing user
  setupRibbonAttributesAndLocationsGPU(attributesRibbonYL, locationsRibbonYL, ps.ribbonShaderGPU_RIB_YL);
  // particle ribbon, not always facing user
  setupRibbonAttributesAndLocationsGPU(attributesRibbonYLNA, locationsRibbonYLNA, ps.ribbonShaderGPU_RIB_YLNA);
}

/*
    @purpose: add a GPU particle emitter to the particle system
    @param o: dictionary of information to be used when creating the emitter
*/
ParticleEffect.prototype.addGPUEmitter = function (o) {
  var emitter = new GpuEmitter(o, this);
  emitter.transform = {
    model_translate: [emitter.x, emitter.y, emitter.z],
    model_rotate: [0, 0, 0],
    model_scale: [1, 1, 1],
    transformChanged: function () { }
  };
  emitter.type = "gpu";
  this.emitters.push(emitter);
}

/*
    @purpose: add a CPU particle emitter to the particle system
    @param o: dictionary of information to be used when creating the emitter
*/
ParticleEffect.prototype.addEmitter = function (o) {
  var emitter = new ParticleEmitter(o, this);
  emitter.transform = {
    model_translate: [emitter.x, emitter.y, emitter.z],
    model_rotate: [0, 0, 0],
    model_scale: [1, 1, 1],
    transformChanged: function () { }
  };
  emitter.type = "cpu";
  this.emitters.push(emitter);
}

/*
  @purpose: ensure a particle effect finishes its current draw cycle before it is removed from the app
*/
ParticleEffect.prototype.fazeOut = function () {
  for (var i = 0; i < this.emitters.length; i++) {
    this.emitters[i].looping = false;
  }
}

/*
  @purpose: immediately remove a particle effect from a app
*/
ParticleEffect.prototype.kill = function () {
  for (var i = 0; i < this.emitters.length; i++) {
    this.emitters[i].dead = true;
  }
}

/*
    @purpose: update data for the particles of an emitter and draw once updated
    @param viewMatrix: the viewMatrix of the app's camera
    @param projMatrix: the projectionMatrix of the app's camera
*/
ParticleEffect.prototype.updateAndDraw = function (viewMatrix, projMatrix, index) {
  var ps = particleSystem;
  var time = window.performance.now() / 1000;
  if (this.startTime === false) {
    this.startTime = time;
  }
  var clockTime = 0;
  if (ps.paused === false) {
    clockTime = time - this.startTime;
  } else { //clockTime should not change if currently paused
    var wouldHaveBeen = time - this.startTime;
    clockTime = this.lastTime;
    var diff = wouldHaveBeen - clockTime;
    this.startTime += diff;
  }
  clockTime = clockTime;
  var visible = 0; // keep track of emitters currently visible in the app
  var visibleParticles = 0; // keep track of particles currently visible in the app
  var allDead = true;
  var eLen = this.emitters.length;
  for (var i = 0; i < eLen; i++) {
    if (this.emitters[i].hidden === false) { //only update and draw if the emitters are visible
      visible++;
      if (this.emitters[i].type === "cpu") {
        //if(particleAssistant){
          //particleAssistant.postMessage([particleSystem]);
          //particleAssistant.updateEmitter(particleSystem, this.emitters[i], clockTime)
        //}else{
          this.emitters[i].updateParticles(clockTime);
        //}
      }
      if (this.emitters[i].dead === false) {
        allDead = false;
      }
      this.emitters[i].draw(viewMatrix, projMatrix, clockTime, this);
      visibleParticles += this.emitters[i].particlesDrawn;
    }
  }
  ps.emittersDrawn += visible;
  ps.emittersPresent += eLen;
  ps.visibleParticles += visibleParticles;
  if (allDead === true) {
    return true;
  }


  this.lastTime = clockTime;
  return false;
}

/*
    @purpose:overarching code to update and draw all the different particle emitters contained within the individual system effects
    @param viewMatrix: the viewMatrix of the app's camera
    @param projMatrix: the projectionMatrix of the app's camera
*/
particleSystem.manageSystem = function (viewMatrix, projMatrix) {
  var ps = particleSystem;
  var gl = ps.gl;
  gl.disable(gl.CULL_FACE);
  var effects = [];
  ps.emittersDrawn = 0;
  ps.emittersPresent = 0;
  ps.visibleParticles = 0;
  var eLen = ps.effects.length;
  for (var i = 0; i < eLen; i++) {
    if (ps.effects[i].attachedBarycentric) {
      ps.effects[i].findAttachedPosition();
    }
    if (ps.effects[i].attachedVariable) {
      ps.effects[i].findAttachedVariable();
    }
    var remove = ps.effects[i].updateAndDraw(viewMatrix, projMatrix, i);
    if (remove === false || ps.editFlag === true) {
      effects.push(ps.effects[i]);
    }
  }
  ps.effects = effects;
  gl.enable(gl.CULL_FACE);
}

/*
  @purpose: clear all drawn particles within the game app
*/
particleSystem.clearParticles = function () {
  var ps = particleSystem;
  ps.effects = [];
}

// simple code to calculate a random value between two values
function calcRandom(min, max) {
  return Math.random() * (max - min) + min;
}

/*
    @purpose: generate a vector of random values for two vectors
    @param mode: the mode for a given value
    @param vel1 and vel2: two vectors which will be used to generate random values
    @return: a 3 tuple vector of random values
*/
function handleInitialVector(mode, vel1, vel2) {
  if (mode === 'Constant') {
    return vel1;
  } else {
    var xVel = calcRandom(vel1[0], vel2[0]);
    var yVel = calcRandom(vel1[1], vel2[1]);
    var zVel = calcRandom(vel1[2], vel2[2]);
    return [xVel, yVel, zVel];
  }
}

/*
    @purpose: determine colors for a gpu emitter
    @return: an array of 3 tuple vectors containing rgb information
*/
GpuEmitter.prototype.determineColors = function () {
  var colors = [];
  if (this.rgb1Mode === 'Constant') {
    colors[0] = [this.red1, this.green1, this.blue1];
    colors[1] = [this.endRed1, this.endGreen1, this.endBlue1];
  } else if (this.rgb1Mode === "randConstant") {
    var red = calcRandom(this.red1, this.red2);
    var green = calcRandom(this.green1, this.green2);
    var blue = calcRandom(this.blue1, this.blue2);
    var red2 = calcRandom(this.endRed1, this.endRed2);
    var green2 = calcRandom(this.endGreen1, this.endGreen2);
    var blue2 = calcRandom(this.endBlue1, this.endBlue2);
    colors[0] = [red, green, blue];
    colors[1] = [red2, green2, blue2];
  }
  return colors;
}

// determine the transparency value given two sets of beginning and end transparency values
function determineAlphas(mode, start1, start2, end1, end2) {
  if (mode === "Constant") {
    return [start1, end1];
  } else if (mode === "randConstant") {
    return [calcRandom(start1, start2), calcRandom(end1, end2)];
  }
}

/*
    @purpose: determine the starting and ending dimensions for an emitter's particles
    @return: a 4 tuple vector containing width and height information
*/
GpuEmitter.prototype.determineDimensions = function () {
  var dimensions = [];
  if (this.xScale1Mode == "Constant") {
    dimensions[0] = this.startWidth1;
    dimensions[1] = this.startLength1;
    dimensions[2] = this.endWidth1;
    dimensions[3] = this.endLength1;
  } else if (this.xScale1Mode == "randConstant") {
    dimensions[0] = calcRandom(this.startWidth1, this.startWidth2);
    dimensions[1] = calcRandom(this.startLength1, this.startLength2);
    dimensions[2] = calcRandom(this.endWidth1, this.endWidth2);
    dimensions[3] = calcRandom(this.endLength1, this.endLength2);
  }
  return dimensions;
}

/*
    @purpose: determine the starting and ending rotation values for an emitter's particles
    @purpose: a 2 tuple vector containing beginning and ending rotation values
*/
GpuEmitter.prototype.determineRotations = function () {
  var rotations = [];
  if (this.rot1Mode == "Constant") {
    rotations[0] = this.startRot1
    rotations[1] = this.endRot1;
  } else if (this.rot1Mode == "randConstant") {
    rotations[0] = calcRandom(this.startRot1, this.startRot2);
    rotations[1] = calcRandom(this.endRot1, this.endRot2);
  }
  return rotations;
}

/*
    @purpose: restart the chosen particle effect within the system
    @param index: the index of the effect to restart
*/
particleSystem.restart = function (index) {
  var ps = particleSystem;
  index = index || 0;
  ps.paused = false;
  ps.effects[index].startTime = false;
  ps.effects[index].lastTime = false;
}

/*
    @purpose: calculate the number of particles and emission rates for a particle effect over time
*/
GpuEmitter.prototype.calcNumParticles = function () {
  this.numParticles = Math.ceil((this.emitterLife / this.emissionInterval) * this.emitRate);

  var numEmissions = Math.ceil(this.emitterLife / this.emissionInterval);
  var changeInRate = Math.floor((this.emitRate - this.endRate) / numEmissions) * -1;
  this.numParticles = this.emitRate;
  this.emitRates = [];
  this.emitRates.push(this.emitRate);
  for (var i = 0; i < numEmissions; i++) {
    this.emitRates.push((this.emitRate + changeInRate * i));
    this.numParticles += (this.emitRate + changeInRate * i)
  }
}

/*
    @purpose: assign dictionary values from one object to another
    @param o: the dictionary's values to assign from
    @param container: the dictionary's values to assign to
*/
function initValues(o, container) {

  function checkBool(o, variable, flip) {
    var flag = flip || true;
    if (o[variable] === false)
      flag = !flag;
    return flag;
  }

  function checkValueExists(val, defVal) {
    if (typeof (val) === "undefined") {
      val = defVal;
    }
    if (val !== false) {
      return parseFloat(val);
    } else {
      return defVal;
    }
  }

  container.hidden = false;
  container.startTime = false;
  container.emissionTime = o.emissionTime || 0;
  container.x = o.x || 0;
  container.y = o.y || 0;
  container.z = o.z || 0;
  container.position = [container.x, container.y, container.z];
  container.rowNum = o.rowNum || 1;
  container.colNum = o.colNum || 1;
  container.defaultUV = o.defaultUV || [0, 0, 1, 0, 1, 1, 0, 1];

  container.emissionInterval = o.emissionInterval || 1;
  if (container.emissionInterval <= 0) {
    container.emissionInterval = .067;
  }

  container.xVel1Mode = o.xVel1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.rgb1Mode = o.rgb1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.alpha1Mode = o.alpha1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.xScale1Mode = o.xScale1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.rot1Mode = o.rot1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.rate1Mode = o.rate1Mode || 'Constant'; // Constant, randConstant, Curve, randCurve
  container.maxDistance = o.maxDistance || -1;

  container.startRate1 = o.startRate1 || 1;
  container.startRate2 = o.startRate2 || 1;
  container.endRate1 = o.endRate1 || 1;
  container.endRate2 = o.endRate2 || 1;

  container.emitterLife = o.emitterLife || 6;
  container.xVel1 = o.xVel1 || 0;
  container.yVel1 = o.yVel1 || 0;
  container.zVel1 = o.zVel1 || 0;
  container.xVel2 = o.xVel2 || 0;
  container.yVel2 = o.yVel2 || 0;
  container.zVel2 = o.zVel2 || 0;

  container.velocity = [container.xVel1, container.yVel1, container.zVel1];
  container.velocity2 = [container.xVel2, container.yVel2, container.zVel2];

  container.xVelCurve = o.xVelCurve || false;
  container.yVelCurve = o.yVelCurve || false;
  container.zVelCurve = o.zVelCurve || false;
  container.xVel2Curve = o.xVel2Curve || false;
  container.yVel2Curve = o.yVel2Curve || false;
  container.zVel2Curve = o.zVel2Curve || false;
  container.rot1Curve = o.rot1Curve || false;
  container.rot2Curve = o.rot2Curve || false;
  container.alpha1Curve = o.alpha1Curve || false;
  container.alpha2Curve = o.alpha2Curve || false;
  container.red1Curve = o.red1Curve || false;
  container.green1Curve = o.green1Curve || false;
  container.blue1Curve = o.blue1Curve || false;
  container.red2Curve = o.red2Curve || false;
  container.green2Curve = o.green2Curve || false;
  container.blue2Curve = o.blue2Curve || false;
  container.xScaleCurve = o.xScaleCurve || false;
  container.yScaleCurve = o.yScaleCurve || false;
  container.xScale2Curve = o.xScale2Curve || false;
  container.yScale2Curve = o.yScale2Curve || false;
  container.rate1Curve = o.rate1Curve || false;
  container.rate2Curve = o.rate2Curve || false;

  container.startXSpread = checkValueExists(o.startXSpread, .05);
  container.startYSpread = checkValueExists(o.startXSpread, 0);
  container.startZSpread = checkValueExists(o.startXSpread, .05);

  container.startXVelSpread = checkValueExists(o.startXVelSpread, 0);
  container.startYVelSpread = checkValueExists(o.startYVelSpread, 0);
  container.startZVelSpread = checkValueExists(o.startZVelSpread, 0);
  container.maxPercentLifetime = 0.00001;

  container.spriteLife = o.spriteLife || -1

  container.accel1 = o.accel1 || 0;
  container.accel2 = o.accel2 || 0;
  container.accel3 = o.accel3 || 0;

  container.red1 = checkValueExists(o.red1, 1);
  container.green1 = checkValueExists(o.green1, 1);
  container.blue1 = checkValueExists(o.blue1, 1);
  container.red2 = checkValueExists(o.red2, 1);
  container.green2 = checkValueExists(o.green2, 1);
  container.blue2 = checkValueExists(o.blue2, 1);
  container.endRed1 = checkValueExists(o.endRed1, 1);
  container.endGreen1 = checkValueExists(o.endGreen1, 1);
  container.endBlue1 = checkValueExists(o.endBlue1, 1);
  container.endRed2 = checkValueExists(o.endRed2, 1);
  container.endGreen2 = checkValueExists(o.endGreen2, 1);
  container.endBlue2 = checkValueExists(o.endBlue2, 1);

  container.alpha = o.alpha || 1;
  container.startAlpha1 = o.startAlpha1 || 1;
  container.startAlpha2 = o.startAlpha2 || 1;
  container.endAlpha1 = o.endAlpha1 || 0;
  container.endAlpha2 = o.endAlpha2 || 0;

  container.startWidth1 = o.startWidth1 || 1;
  container.startWidth2 = o.startWidth2 || 1;
  container.startLength1 = o.startLength1 || 1;
  container.startLength2 = o.startLength2 || 1;
  container.endWidth1 = o.endWidth1 || 0;
  container.endWidth2 = o.endWidth2 || 0;
  container.endLength1 = o.endLength1 || 0;
  container.endLength2 = o.endLength2 || 0;

  container.startRot1 = o.startRot1 || 0;
  container.startRot2 = o.startRot2 || 0;

  container.endRot1 = o.endRot1 || 0;
  container.endRot2 = o.endRot2 || 0;
  container.textureName = o.textureName || false;

  container.matPosX = checkValueExists(o.matPosX, 0);
  container.matPosY = checkValueExists(o.matPosY, 0);
  container.matPosZ = checkValueExists(o.matPosZ, 0);
  container.matRotX = checkValueExists(o.matRotX, 0);
  container.matRotY = checkValueExists(o.matRotY, 0);
  container.matRotZ = checkValueExists(o.matRotZ, 0);
  container.matNormX = checkValueExists(o.matNormX, 0);
  container.matNormY = checkValueExists(o.matNormY, 0);
  container.matNormZ = checkValueExists(o.matNormZ, 0);
  container.matScaleX = checkValueExists(o.matScaleX, 1);
  container.matScaleY = checkValueExists(o.matScaleY, 1);
  container.matScaleZ = checkValueExists(o.matScaleZ, 1);

  container.ucolor = [1, 1, 1];
  container.looping = checkBool(o, "looping");
  container.billboards = checkBool(o, "billboards");
  container.ribbon = checkBool(o, "ribbon", true);
  container.emissionDistance = checkValueExists(o.emissionDistance, 0);
  container.emissionTraveled = 0;
  if (typeof o.ribbon === "undefined") {
    container.ribbon = false;
  }
  container.trailLength = o.trailLength || 0;
  container.trailMultiplier = o.trailMultiplier || 1;
  container.trailVariance = o.trailVariance || 0;
  container.texture = particleSystem.loadTexture(o) || particleSystem.getTexture();
  if (particle_textures && container.textureName) {
    if (particle_textures[container.textureName]) {
      container.texture = particle_textures[container.textureName];
    }
  }
}

particleSystem.defaultTextureString = `
ctx.fillStyle="white";
ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
`;

/*
    @purpose: return a default particle texture for effect emitters not yet given new textures
*/
particleSystem.getTexture = function () {
  var ps = particleSystem;
  if (ps.defaultTexture === false) {
    var red = 255;
    var blue = 255;
    var green = 255;
    var colorStr = "rgba(" + red + "," + green + "," + blue + ",1)";
    var str = ps.defaultTextureString.replace("white", colorStr);
    str = str.replace("white", colorStr);
    ps.defaultTexture = drawCanvasTexture(str, 256, 256);
  }
  return ps.defaultTexture;
}

function initializeBuffer() {
  var buffer = gl.createBuffer();
  return buffer;
}

function assignGPUBuffer(buffer, bufferType, data, attribute, stride, type) {
  var gl_type;
  var DataType;
  doPointer = true;
  if (type === "float") {
    DataType = Float32Array;
    gl_type = "FLOAT"
  }
  else if (type === "u_int") {
    DataType = Uint16Array;
    doPointer = false;
  }
  gl.bindBuffer(gl[bufferType], buffer);
  gl.bufferData(gl[bufferType], data, gl.DYNAMIC_DRAW);
  if (doPointer === true) {
    gl.vertexAttribPointer(attribute, stride, gl[gl_type], false, 0, 0);
  }
}

function assignBuffer(buffer, bufferType, data, attribute, stride, type) {
  var gl_type;
  var DataType;
  doPointer = true;
  if (type === "float") {
    DataType = Float32Array;
    gl_type = "FLOAT"
  }
  else if (type === "u_int") {
    DataType = Uint16Array;
    doPointer = false;
  }
  gl.bindBuffer(gl[bufferType], buffer);
  gl.bufferData(gl[bufferType], new DataType(data), gl.DYNAMIC_DRAW);
  if (doPointer === true) {
    gl.vertexAttribPointer(attribute, stride, gl[gl_type], false, 0, 0);
  }

}

/*
    @purpose: new cpu particle emitter object
    @param o: dictionary of values to be assigned to the new particle emitter
    @param parent: the parent effect which contains the emitters
*/
function ParticleEmitter(o, parent) {
  initValues(o, this);
  var ps = particleSystem;
  this.updateMatrix();
  this.rebirth();
  this.dead = false;
  this.paused = false;
  this.index = parent.emitters.length;

  this.indicesBuffer = initializeBuffer();
  this.currBuffer = initializeBuffer();
  this.prevBuffer = initializeBuffer();
  this.nextBuffer = initializeBuffer();
  this.rgbaBuffer = initializeBuffer();
  this.uvsBuffer = initializeBuffer();
  this.dimensionsBuffer = initializeBuffer();
  this.cornersBuffer = initializeBuffer();
  this.posBuffer = initializeBuffer();
}

ParticleEmitter.prototype.updateMatrix = function () {
  this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var matrixPos = [this.matPosX, this.matPosY, this.matPosZ];
  var matrixRot = [this.matRotX, this.matRotY, this.matRotZ];
  var matrixNorm = [this.matNormX, this.matNormY, this.matNormZ];
  var matrixScale = [this.matScaleX, this.matScaleY, this.matScaleZ];
  this.modifyModelMatrix({ normal: matrixNorm, direction: matrixRot, pos: matrixPos, scale: matrixScale });
}

ParticleEmitter.prototype.modifyModelMatrix = function (o) {
  var ps = particleSystem;
  var pos = o.pos || [0, 0, 0];
  var scale = o.scale || [1, 1, 1];
  var direction = o.direction || [0, 0, 0];
  direction[0] *= Math.PI / 180;
  direction[1] *= Math.PI / 180;
  direction[2] *= Math.PI / 180;
  var normal = o.normal || [0, 0, 0];
  translateMatrix(this.modelMatrix, pos);
  var scaleMat = new Float32Array(16);
  var scratch = new Float32Array(16);
  scaleMatrix(scaleMat, scale);
  multiplyMat(this.modelMatrix, scaleMat, scratch);
  this.modelMatrix = ps.rotatedMatrix(direction, this.modelMatrix);
  this.modelMatrix = ps.perpendicularMatrix(normal, this.modelMatrix);
}



/*
    @purpose: reinitializes the particles within an emitter and begins generating them over again
*/
ParticleEmitter.prototype.rebirth = function () {
  this.particles = [];
  this.indices = [];
  this.toDraw = [];
  this.lastEmitted = false;
  this.startTime = false;
  if (this.rate1Mode === "randConstant") {
    this.emitRate = Math.floor(calcRandom(this.startRate1, this.startRate2));
    this.endRate = Math.floor(calcRandom(this.endRate1, this.endRate2));
  } else if (this.rate1Mode === "Constant") {
    this.emitRate = this.startRate1;
    this.endRate = this.endRate1;
  }
}

/*
    @purpose: creates arrays for a given gpu particle emitter which are used when drawn
*/
GpuEmitter.prototype.createArrays = function () {
  if (this.rate1Mode === "randConstant") {
    this.emitRate = Math.floor(calcRandom(this.startRate1, this.startRate2));
    this.endRate = Math.floor(calcRandom(this.endRate1, this.endRate2));
  } else if (this.rate1Mode === "Constant") {
    this.emitRate = this.startRate1;
    this.endRate = this.endRate1;
  }
  this.dead = false;
  this.calcNumParticles();
  this.lifetimes = [];
  this.births = [];
  this.spriteEnds = [];
  this.textureCoords = [];
  this.vertexIndices = [];
  this.velocities = [];
  this.posSpreads = [];
  this.rgba = [];
  this.endRgba = [];
  this.scales = [];
  this.rotations = [];
  this.spriteCorners = [-1, -1, 1, -1, 1, 1, -1, 1];
  this.uvSet = this.defaultUV;
  if (this.ribbon) {
    this.uvSet = [1, 0, 1, 1, 0, 0, 0, 1];
  }

  this.velocity = [this.xVel1, this.yVel1, this.zVel1];
  this.velocity2 = [this.xVel2, this.yVel2, this.zVel2];

  var emissionSets = Math.floor(this.emitterLife / this.emissionInterval) + 1;
  var indexCount = 0;
  this.latestTime = 0;
  this.directions = [];
  var endVal = 1;
  var vertCount = 4;
  for (var i = 0; i < emissionSets; i++) {
    for (var k = 0; k < this.emitRates[i]; k++) {
      var lifetime = this.emitterLife;
      if (this.ribbon === false) {
        lifetime = this.emitterLife * (Math.random() + .5);
        if (this.spriteLife !== -1) {
          lifetime = this.spriteLife * (Math.random() + .5);
        }
      }
      if (lifetime > this.emitterLife) {
        lifetime = this.emitterLife;
      }
      var birth = i * this.emissionInterval;
      var xSpread = calcRandom(this.startXSpread * -1, this.startXSpread);
      var ySpread = calcRandom(this.startYSpread * -1, this.startYSpread);
      var zSpread = calcRandom(this.startZSpread * -1, this.startZSpread);

      var velocity = handleInitialVector(this.xVel1Mode, this.velocity, this.velocity2);
      var alphas = determineAlphas(this.alpha1Mode, this.startAlpha1, this.startAlpha2, this.endAlpha1, this.endAlpha2);
      var alphaBegin = alphas[0];
      var alphaEnd = alphas[1];

      var colors = this.determineColors();
      var colorBegin = colors[0];
      var colorEnd = colors[1];

      var dimensions = this.determineDimensions();
      var startWidth = dimensions[0] / 2;
      var startLength = dimensions[1] / 2;
      var endWidth = dimensions[2] / 2;
      var endLength = dimensions[3] / 2;

      var rotations = this.determineRotations();
      var beginRot = rotations[0];
      var endRot = rotations[1];

      var timeSoFar = birth + lifetime;
      if (timeSoFar > this.latestTime) {
        this.latestTime = timeSoFar;
      }
      for (var j = 0; j < vertCount; j++) {
        this.lifetimes.push(lifetime);
        this.births.push(birth);
        this.spriteEnds.push(this.spriteCorners[j * 2]);
        this.spriteEnds.push(this.spriteCorners[j * 2 + 1]);
        this.textureCoords.push(this.uvSet[j * 2]);
        this.textureCoords.push(this.uvSet[j * 2 + 1]);
        this.velocities.push(velocity[0]);
        this.velocities.push(velocity[1]);
        this.velocities.push(velocity[2]);
        this.posSpreads.push(xSpread);
        this.posSpreads.push(ySpread);
        this.posSpreads.push(zSpread);
        this.directions.push(endVal);
        this.rgba.push(colorBegin[0]);
        this.rgba.push(colorBegin[1]);
        this.rgba.push(colorBegin[2]);
        this.rgba.push(alphaBegin);
        this.endRgba.push(colorEnd[0]);
        this.endRgba.push(colorEnd[1]);
        this.endRgba.push(colorEnd[2]);
        this.endRgba.push(alphaEnd);
        this.scales.push(startWidth);
        this.scales.push(startLength);
        this.scales.push(endWidth);
        this.scales.push(endLength);
        this.rotations.push(beginRot);
        this.rotations.push(endRot);
        this.vertexIndices.push(indexCount * 4);
        this.vertexIndices.push(indexCount * 4 + 1);
        this.vertexIndices.push(indexCount * 4 + 2);
        this.vertexIndices.push(indexCount * 4);
        this.vertexIndices.push(indexCount * 4 + 2);
        this.vertexIndices.push(indexCount * 4 + 3);
        endVal *= -1;
        if (this.ribbon) {
          this.lifetimes.push(lifetime);
          this.births.push(birth);
          this.spriteEnds.push(this.spriteCorners[j * 2]);
          this.spriteEnds.push(this.spriteCorners[j * 2 + 1]);
          this.textureCoords.push(this.uvSet[j * 2]);
          this.textureCoords.push(this.uvSet[j * 2 + 1]);
          this.velocities.push(velocity[0]);
          this.velocities.push(velocity[1]);
          this.velocities.push(velocity[2]);
          this.posSpreads.push(xSpread);
          this.posSpreads.push(ySpread);
          this.posSpreads.push(zSpread);
          this.directions.push(endVal);
          this.rgba.push(colorBegin[0]);
          this.rgba.push(colorBegin[1]);
          this.rgba.push(colorBegin[2]);
          this.rgba.push(alphaBegin);
          this.endRgba.push(colorEnd[0]);
          this.endRgba.push(colorEnd[1]);
          this.endRgba.push(colorEnd[2]);
          this.endRgba.push(alphaEnd);
          this.scales.push(startWidth);
          this.scales.push(startLength);
          this.scales.push(endWidth);
          this.scales.push(endLength);
          this.rotations.push(beginRot);
          this.rotations.push(endRot);
          this.vertexIndices.push(indexCount * 4);
          this.vertexIndices.push(indexCount * 4 + 1);
          this.vertexIndices.push(indexCount * 4 + 2);
          this.vertexIndices.push(indexCount * 4);
          this.vertexIndices.push(indexCount * 4 + 2);
          this.vertexIndices.push(indexCount * 4 + 3);
        }
        endVal *= -1;
      }
      indexCount++;
    }
  }
  this.lifetimes = new Float32Array(this.lifetimes);
  this.births = new Float32Array(this.births);
  this.spriteEnds = new Float32Array(this.spriteEnds);
  this.textureCoords = new Float32Array(this.textureCoords);
  this.vertexIndices = new Float32Array(this.vertexIndices);
  this.velocities = new Float32Array(this.velocities);
  this.posSpreads = new Float32Array(this.posSpreads);
  this.rgba = new Float32Array(this.rgba);
  this.endRgba = new Float32Array(this.endRgba);
  this.scales = new Float32Array(this.scales);
  this.rotations = new Float32Array(this.rotations);
  this.directions = new Float32Array(this.directions);
}

/*
    @purpose: new gpu particle emitter object
    @param o: dictionary of values to be assigned to the new particle emitter
    @param parent: the parent effect which contains the emitters
*/
function GpuEmitter(o, parent) {
  initValues(o, this);
  this.parent = parent;
  this.index = parent.emitters.length;
  var ps = particleSystem;
  this.updateMatrix();
  this.createArrays();

  this.lifeBuffer = initializeBuffer();
  this.birthBuffer = initializeBuffer();
  this.uvsBuffer = initializeBuffer();
  this.velocityBuffer = initializeBuffer();
  this.spreadBuffer = initializeBuffer();
  this.rgbaBuffer = initializeBuffer();
  this.endRGBABuffer = initializeBuffer();
  this.scalesBuffer = initializeBuffer();
  this.rotationBuffer = initializeBuffer();
  this.spriteBuffer = initializeBuffer();
  this.directionsBuffer = initializeBuffer();
  this.emittedBuffer = initializeBuffer();
}


GpuEmitter.prototype.updateMatrix = function () {
  this.modelMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var matrixPos = [this.matPosX, this.matPosY, this.matPosZ];
  var matrixRot = [this.matRotX, this.matRotY, this.matRotZ];
  var matrixNorm = [this.matNormX, this.matNormY, this.matNormZ];
  var matrixScale = [this.matScaleX, this.matScaleY, this.matScaleZ];
  this.modifyModelMatrix({ normal: matrixNorm, direction: matrixRot, pos: matrixPos, scale: matrixScale });
}

//simple code to calculate magnitude given an x,y,z coordinate set
function calculateMagnitude(x, y, z) {
  return Math.sqrt(x ^ 2 + y ^ 2 + z ^ 2);
}

GpuEmitter.prototype.modifyModelMatrix = function (o) {
  var ps = particleSystem;
  var pos = o.pos || [0, 0, 0];
  var scale = o.scale || [1, 1, 1];
  var direction = o.direction || [0, 0, 0];
  direction[0] *= Math.PI / 180;
  direction[1] *= Math.PI / 180;
  direction[2] *= Math.PI / 180;
  var normal = o.normal || [0, 0, 0];
  translateMatrix(this.modelMatrix, pos);
  var scaleMat = new Float32Array(16);
  var scratch = new Float32Array(16);
  scaleMatrix(scaleMat, scale);
  multiplyMat(this.modelMatrix, scaleMat, scratch);
  this.modelMatrix = ps.rotatedMatrix(direction, this.modelMatrix);
  this.modelMatrix = ps.perpendicularMatrix(normal, this.modelMatrix);
}

/*
    @purpose: calculate the number of particles which have been emitted given a passed in clockTime
    @param clockTime: the current time of emission
    @return: a set of indices to be drawn, ensures only certain particles are drawn
*/
GpuEmitter.prototype.calcEmitted = function (clockTime) {
  var indicesToDraw = [];
  var k = 0;
  var index = 0;
  var len = this.lifetimes.length;
  for (var i = 0; i < len; i += 4) {
    var time = this.lifetimes[i] + this.births[i];
    var x = this.velocities[i * 3] * (clockTime - this.births[i]);
    var y = this.velocities[i * 3 + 1] * (clockTime - this.births[i]);
    var z = this.velocities[i * 3 + 2] * (clockTime - this.births[i]);
    var dist = calculateMagnitude(x, y, z);
    if (this.births[i] <= clockTime && clockTime <= time && (dist < this.maxDistance + 1 || this.maxDistance === -1)) {
      indicesToDraw[index] = i;
      indicesToDraw[index + 1] = i + 1;
      indicesToDraw[index + 2] = i + 2;
      indicesToDraw[index + 3] = i;
      indicesToDraw[index + 4] = i + 2;
      indicesToDraw[index + 5] = i + 3;
      index += 6;
    }
  }
  return indicesToDraw;
}

//simpel code to calculate and return vector data given two passed in vectors
function calculateDelta(src, dest) {
  var delta = [];
  var len = src.length;
  for (var i = 0; i < len; i++) {
    delta[i] = (dest[i] - src[i]);
  }
  return delta;
}

// simple code to determine a random value between two if necessary
function determineValue(mode, option1, option2) {
  if (mode === "randConstant") {
    return calcRandom(option1, option2) || 0;
  }
  return option1 || 0;
}

/*
    @purpose: a new particle to be updated and drawn by its parent emitter
    @param o: dictionary information to pass in to the new particle instances, used to determine initial values
        for particles going forward
    @param time: current time of emission
*/
function Particle(o, time) {
  this.parent = o;
  this.index = o.particles.length;
  this.birth = time;
  this.dead = false;
  this.members = [];
  this.trailLength = o.trailLength;
  this.trailMultiplier = o.trailMultiplier;
  this.trailVariance = o.trailVariance;
  this.lifetime = o.emitterLife * (Math.random() + .5);
  this.drag = [o.accel1, o.accel2, o.accel3];
  if (o.spriteLife !== -1) {
    this.lifetime = o.spriteLife * (Math.random() + .5);
  }
  if (this.lifetime > o.emitterLife) {
    this.lifetime = o.emitterLife;
  }
  var velocity = [o.xVel1, o.yVel1, o.zVel1];
  var velocity2 = [o.xVel2, o.yVel2, o.zVel2];
  var xSpread = calcRandom(o.startXSpread * -1, o.startXSpread);
  var ySpread = calcRandom(o.startYSpread * -1, o.startYSpread);
  var zSpread = calcRandom(o.startZSpread * -1, o.startZSpread);
  var position = [o.x, o.y, o.z];
  this.position = [position[0] + xSpread, position[1] + ySpread, position[2] + zSpread];
  if (o.xVel1Mode.search("Constant") >= 0) {
    this.velocity = handleInitialVector(o.xVel1Mode, velocity, velocity2);
  } else {
    if (o.xVel1Mode.search("rand") >= 0) {
      this.velCurveSet = [];
      for (var i = 0; i < 3; i++) {
        var val = Math.random();
        if (val <= .5) {
          this.velCurveSet[i] = 0;
        } else {
          this.velCurveSet[i] = 1;
        }
      }
    } else {
      this.velCurveSet = [0, 0, 0];
    }
  }

  var xVelSpread = calcRandom(o.startXVelSpread * -1, o.startXVelSpread);
  var yVelSpread = calcRandom(o.startYVelSpread * -1, o.startYVelSpread);
  var zVelSpread = calcRandom(o.startZVelSpread * -1, o.startZVelSpread);
  this.velocity = [this.velocity[0] + xVelSpread, this.velocity[1] + yVelSpread, this.velocity[2] + zVelSpread];

  if (o.alpha1Mode.search("Constant") >= 0) {
    this.alpha = o.alpha;
    var alphas = determineAlphas(o.alpha1Mode, o.startAlpha1, o.startAlpha2, o.endAlpha1, o.endAlpha2);
    this.alphaDelta = calculateDelta([alphas[0]], [alphas[1]], this.lifetime)[0];
  } else {
    if (o.alpha1Mode.search('rand') >= 0) {
      this.transpSet = [];
      var val = Math.random();
      if (val <= .5) {
        this.transpSet[0] = 0;
      } else {
        this.transpSet[0] = 1;

      }
    } else {
      this.transpSet = [0];
    }
    this.alphaDelta = 1.0;
  }

  if (o.rot1Mode.search("Constant") >= 0) {
    this.rotation = determineValue(o.rot1Mode, o.startRot1, o.startRot2);
    var endRot = determineValue(o.rot1Mode, o.endRot1, o.endRot2);
    this.rotationDelta = calculateDelta([this.rotation], [endRot], this.lifetime)[0];
  } else {
    if (o.rot1Mode.search("rand") >= 0) {
      this.rotationSet = [];
      var val = Math.random();
      if (val <= .5) {
        this.rotationSet[0] = 0;
      } else {
        this.rotationSet[0] = 1;
      }
    } else {
      this.rotationSet = [0];
    }
    this.rotation = 0;
  }

  if (o.xScale1Mode.search("Constant") >= 0) {
    this.scaleX = o.startWidth1
    this.scaleY = o.startLength1
    var endX = o.endWidth1;
    var endY = o.endLength1;
    if (o.xScale1Mode.search("rand") >= 0) {
      this.scaleX = calcRandom(o.startWidth1, o.startWidth2);
      this.scaleY = calcRandom(o.startLength1, o.startLength2);
      endX = calcRandom(o.endWidth1, o.endWidth2);
      endY = calcRandom(o.endLength1, o.endLength2);
    }
    var deltas = calculateDelta([this.scaleX, this.scaleY], [endX, endY], this.lifetime);
    this.deltaScaleX = deltas[0];
    this.deltaScaleY = deltas[1];
  } else {
    if (o.xScale1Mode.search("rand") >= 0) {
      this.scaleSet = [];
      for (var i = 0; i < 2; i++) {
        var val = Math.random();
        if (val <= .5) {
          this.scaleSet[i] = 0;
        } else {
          this.scaleSet[i] = 1;
        }
      }
    } else {
      this.scaleSet = [0, 0];
    }
  }

  if (o.rgb1Mode.search("Constant") >= 0) {
    this.rgb = handleInitialVector(o.rgb1Mode, [o.red1, o.green1, o.blue1], [o.red2, o.green2, o.blue2]);
    var endRGB = handleInitialVector(o.rgb1Mode, [o.endRed1, o.endGreen1, o.endBlue1], [o.endRed2, o.endGreen2, o.endBlue2]);
    this.rgbDelta = calculateDelta(this.rgb, endRGB, this.lifetime);
  } else {
    if (o.rgb1Mode.search("rand") >= 0) {
      this.rgbSet = [];
      for (var i = 0; i < 3; i++) {
        var val = Math.random();
        if (val <= .5) {
          this.rgbSet[i] = 0;
        } else {
          this.rgbSet[i] = 1;
        }
      }
    } else {
      this.rgbSet = [0, 0, 0];
    }
    this.rgb = [1, 1, 1];
    this.rgbDelta = [0, 0, 0];
  }

  this.ribbon3D = o.ribbonDirX != null && o.ribbonDirY != null && o.ribbonDirZ != null;
  this.ribbonDirX = o.ribbonDirX;
  this.ribbonDirY = o.ribbonDirY;
  this.ribbonDirZ = o.ribbonDirZ;
  if (this.ribbon3D) {
    this.lifetime = o.emitterLife;
  }
}

/*
    @purpose: code to calculate bezier point values
    @param startPt: the beginning of the particle curve
    @param endPt: the ending of the particle curve
    @param ctrlPt: the control point used to determine how values move along the curve
    @param timeStamp: the current time stamp in the curve
    @param scale: the scaling value to multiply the bezier pt by
    @return: a value found along the bezier curve
*/
function calcBezierPt(startPt, endPt, ctrlPt, timeStamp, scale) {
  return ((1 - timeStamp) * (1 - timeStamp) * startPt + 2 * (1 - timeStamp) * timeStamp * ctrlPt + Math.pow(timeStamp, 2) * endPt) * scale;
}


function calculateThroughoutCurve(startPt, endPt, time, scale) {
  var ctrlPt = (endPt + startPt) / 2;
  return calcBezierPt(startPt, endPt, ctrlPt, time, scale);
}

function calculateStartCurve(startPt, endPt, time, scale) {
  var ctrlPt = (endPt + startPt) * .75;
  return calcBezierPt(startPt, endPt, ctrlPt, time, scale);
}

function calculateEndCurve(startPt, endPt, time, scale) {
  var ctrlPt = (endPt + startPt) * .25;
  return calcBezierPt(startPt, endPt, ctrlPt, time, scale);
}

/*
    @purpose: code to find a value along a curve for a given field
    @param field: the field whose curve value is to be found
    @param currTime: the current time of emission in the particle emitter
    @param canBeNegative: flag indicating whether values can go negative
*/
ParticleEmitter.prototype.findCurveValue = function (field, currTime, canBeNegative) {
  canBeNegative = canBeNegative || false;
  var curveEntry = this[field];
  if (!currTime || currTime === false || !curveEntry) {
    return 0;
  }
  var points = curveEntry.points;
  if (!curveEntry.points) {
    return 0;
  }
  var graphX = currTime;
  var startX = points[0].xPerc;
  var endX = points[1].xPerc;
  var startY = points[0].yPerc;
  var endY = points[1].yPerc;

  var diffPerc = endX - startX;
  var heightDiff = endY - startY;
  var scale = curveEntry.scale;

  var rv = 0;

  var incr = 1
  if (curveEntry.endingCurve == 'repeat') {
    incr = 2
  }
  var pLen = points.length - 1;
  for (var i = 0; i < pLen; i += incr) {
    startX = points[i].xPerc;
    endX = points[i + 1].xPerc;
    startY = points[i].yPerc;
    endY = points[i + 1].yPerc;
    if (graphX > startX && graphX < endX) {
      break;
    } else if (graphX <= startX && i == 0) {
      rv = startY * scale;
    } else if (graphX >= endX && i == pLen) {
      rv = endY * scale;
    }
  }

  var pointDiff = endX - startX;
  var heightDiff = endY - startY;

  if (curveEntry.curve === "none") {
    var diff = graphX - startX;
    rv = (startY + (diff / pointDiff) * heightDiff) * scale;
  } else if (curveEntry.curve === "throughout") {
    var diff = graphX - startX;
    rv = calculateThroughoutCurve(startY, endY, (diff / pointDiff), scale);
  } else if (curveEntry.curve === "start") {
    var diff = graphX - startX;
    rv = calculateStartCurve(startY, endY, (diff / pointDiff), scale);
  } else if (curveEntry.type === "end") {
    var diff = graphX - startX;
    rv = calculateEndCurve(startY, endY, (diff / pointDiff), scale);
  }

  if (canBeNegative === true) {
    var mid = .5 * scale;
    rv = (mid - rv) * -2;
  }

  return rv;
}

/*
    @purpose: calculate emitter's velocity value along a curve
    @param emitter: the emitter whose curve value is to be found
    @param time: the current time of emission
    @param velCurveSet: vector containing information about which curve each value is associated with
    @return: vector of values representing curve velocity
*/
function calcCurveVelocity(emitter, time, velCurveSet) {
  var xVel, yVel, zVel;
  var xString = 'xVelCurve';
  var yString = 'yVelCurve';
  var zString = 'zVelCurve';
  if (velCurveSet[0] !== 0)
    xString = 'xVel2Curve';
  if (velCurveSet[1] !== 0)
    yString = 'yVel2Curve';
  if (velCurveSet[2] !== 0)
    zString = 'zVel2Curve';

  xVel = emitter.findCurveValue(xString, time, true) || 0;
  yVel = emitter.findCurveValue(yString, time, true) || 0;
  zVel = emitter.findCurveValue(zString, time, true) || 0;
  return [xVel, yVel, zVel];
}

/*
    @purpose: calculate emitter's width and height values along a curve
    @param emitter: the emitter whose curve value is to be found
    @param time: the current time of emission
    @param scaleSet: vector containing information about which curve each value is associated with
    @return: vector of values representing curve width and height
*/
function calcCurveScale(emitter, time, scaleSet) {
  var xScale, yScale;
  var xString = 'xScaleCurve';
  var yString = 'yScaleCurve';
  if (scaleSet[0] !== 0)
    xString = 'xScale2Curve';
  if (scaleSet[1] !== 0)
    yString = 'yScale2Curve';
  xScale = emitter.findCurveValue(xString, time, true) || 0;
  yScale = emitter.findCurveValue(yString, time, true) || 0;
  return [xScale, yScale];
}

/*
    @purpose: calculate emitter's transparency value along a curve
    @param emitter: the emitter whose curve value is to be found
    @param time: the current time of emission
    @param alphaSet: vector containing information about which curve each value is associated with
    @return: value indicating the current transparency value for an emitter
*/
function calcCurveAlpha(emitter, time, alphaSet) {
  var alpha;
  var alphaString = 'alpha1Curve';
  if (alphaSet[0] !== 0)
    alphaString = 'alpha2Curve';
  alpha = emitter.findCurveValue(alphaString, time, true) || 0;
  return alpha
}

/*
    @purpose: calculate emitter's color values along a curve
    @param emitter: the emitter whose curve value is to be found
    @param time: the current time of emission
    @param rgbSet: vector containing information about which curve each value is associated with
    @return: vector of color information for the emitter curve
*/
function calcCurveRGB(emitter, time, rgbSet) {
  var red, blue, green;
  var redString = 'red1Curve';
  var greenString = 'green1Curve';
  var blueString = 'blue1Curve';
  if (rgbSet[0] !== 0)
    redString = 'red2Curve';
  if (rgbSet[1] !== 0)
    greenString = 'green2Curve';
  if (rgbSet[2] !== 0)
    blueString = 'blue2Curve';
  red = emitter.findCurveValue(redString, time, true) || 0;
  green = emitter.findCurveValue(greenString, time, true) || 0;
  blue = emitter.findCurveValue(blueString, time, true) || 0;
  return [red, blue, green];
}

/*
    @purpose: calculate emitter's rotation value along a curve
    @param emitter: the emitter whose curve value is to be found
    @param time: the current time of emission
    @param rotationSet: vector containing information about which curve each value is associated with
    @return: value indicating the current rotation value for an emitter
*/
function calcCurveRotation(emitter, time, rotationSet) {
  var rotation;
  var rotString = 'rot1Curve';
  if (rotationSet[0] !== 0)
    rotString = 'rot2Curve';
  rotation = emitter.findCurveValue(rotString, time, true) || 0;
  return [rotation];
}

/*
    @purpose: calculae the current trail for a particle sprite
    @param uvSet: the current uvs which will be displayed by the particle
    @param percent: the portion of the effect which has already occured
*/
Particle.prototype.calcTrail = function (uvSet, percent) {
  var ps = particleSystem;
  var pos = [];
  var rgba = [];
  var uvs = [];
  var corners = [];
  var count = this.members.length;
  var pCount = this.position.length;
  var rgbCount = this.rgbVal.length;
  var cCount = this.corners.length;
  for (var i = 0; i < pCount; i++) {
    pos.push(this.positionVal[i]);
  }
  for (var i = 0; i < rgbCount; i++) {
    rgba.push(this.rgbVal[i]);
  }
  rgba.push(this.alphaVal);
  uvs.push(uvSet[0]);
  uvs.push(uvSet[1]);
  uvs.push(uvSet[2]);
  uvs.push(uvSet[3]);
  uvs.push(uvSet[4]);
  uvs.push(uvSet[5]);
  uvs.push(uvSet[6]);
  uvs.push(uvSet[7]);
  for (var i = 0; i < cCount; i++) {
    corners.push(this.corners[i]);
  }

  if (!ps.paused) {
    if (this.members.length >= this.trailLength * this.trailMultiplier) {
      this.members = this.members.slice(1);
    }
    var negRad = this.trailVariance * -.1;
    var locPos = pos.slice();
    var locPosLen = locPos.length;
    for (var i = 0; i < locPosLen; i++) {
      var rad = calcRandom(negRad, this.trailVariance)
      locPos[i] += rad;
    }
    var rgbaVal = rgba.slice();
    rgbaVal[3] *= .5
    var member = { pos: locPos, rgba: rgbaVal, uvs: uvs.slice(), corners: corners.slice(), percent: percent };
    this.members.push(member);
  }

  if (this.members.length > 1) {
    var percents = [];
    var mLen = this.members.length - 1;
    var actingMembers = 0;
    for (var i = 0; i < mLen; i += this.trailMultiplier) {
      this.parent.dimensions.push(Math.abs(this.dim));
      this.parent.dimensions.push(Math.abs(this.dim));
      actingMembers++;
      var p = this.members[i];

      for (var j = 0; j < p.pos.length; j++) {
        pos.push(p.pos[j]);
      }
      for (var j = 0; j < p.rgba.length; j++) {
        rgba.push(p.rgba[j]);
      }
      percents.push(p.percent);
      uvs.push(p.uvs[0]);
      uvs.push(p.uvs[1]);
      uvs.push(p.uvs[2]);
      uvs.push(p.uvs[3]);
      uvs.push(p.uvs[4]);
      uvs.push(p.uvs[5]);
      uvs.push(p.uvs[6]);
      uvs.push(p.uvs[7]);
      for (var j = 0; j < p.corners.length; j++) {
        corners.push(p.corners[j]);
      }
    }
    this.parent.memberCounts.push(actingMembers);
  }
  return [pos, rgba, uvs, corners];
}


/*
    @purpose: animate a single particle given a passed in time parameter
    @param time: the curent time of emission for a particle's lifetime
*/
Particle.prototype.animate = function (time) {
  var percent = time / this.lifetime;

  var width;
  var length;
  this.positionVal = [];
  if (this.parent.xVel1Mode.search("Curve") >= 0) {
    this.velocity = calcCurveVelocity(this.parent, percent, this.velCurveSet);
    this.positionVal[0] = this.position[0] + (this.drag[0] * time + this.velocity[0]);
    this.positionVal[1] = this.position[1] + (this.drag[1] * time + this.velocity[1]);
    this.positionVal[2] = this.position[2] + (this.drag[2] * time + this.velocity[2]);
  } else {
    this.positionVal[0] = this.position[0] + (this.drag[0] * time + this.velocity[0]) * time;
    this.positionVal[1] = this.position[1] + (this.drag[1] * time + this.velocity[1]) * time;
    this.positionVal[2] = this.position[2] + (this.drag[2] * time + this.velocity[2]) * time;
  }

  if (this.parent.rot1Mode.search("Curve") >= 0) {
    this.rotationDelta = calcCurveRotation(this.parent, percent, this.rotationSet);
  }
  if (this.parent.xScale1Mode.search("Curve") >= 0) {
    var scales = calcCurveScale(this.parent, percent, this.scaleSet);
    width = scales[0];
    length = scales[1];
  } else {
    width = this.scaleX + this.deltaScaleX * percent;
    length = this.scaleY + this.deltaScaleY * percent;
  }
  if (this.parent.alpha1Mode.search("Curve") >= 0) {
    this.alphaDelta = calcCurveAlpha(this.parent, percent, this.transpSet);
  }
  if (this.parent.rgb1Mode.search("Curve") >= 0) {
    this.rgbDelta = calcCurveRGB(this.parent, percent, this.rgbSet);
  }

  function xRot(x, y, angle) {
    return x * Math.cos(angle) - y * Math.sin(angle);
  }

  function yRot(x, y, angle) {
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  this.corners = [];

  var angle = this.rotation + this.rotationDelta * percent;
  angle *= Math.PI / 180;
  width /= 2;
  length /= 2;
  this.dim = width;
  this.parent.dimensions.push(Math.abs(width));
  this.parent.dimensions.push(Math.abs(width));
  this.corners.push(xRot(-1 * width, -1 * length, angle));
  this.corners.push(yRot(-1 * width, -1 * length, angle));
  this.corners.push(xRot(width, -1 * length, angle));
  this.corners.push(yRot(width, -1 * length, angle));
  this.corners.push(xRot(width, length, angle));
  this.corners.push(yRot(width, length, angle));
  this.corners.push(xRot(-1 * width, length, angle));
  this.corners.push(yRot(-1 * width, length, angle));
  this.alpha = this.alpha || 1;
  this.alphaVal = 0;
  this.alphaVal = this.alpha + this.alphaDelta * percent;

  this.rgbVal = [];
  this.rgbVal[0] = this.rgb[0] + this.rgbDelta[0] * percent;
  this.rgbVal[1] = this.rgb[1] + this.rgbDelta[1] * percent;
  this.rgbVal[2] = this.rgb[2] + this.rgbDelta[2] * percent;

  for (var i = 0; i < this.rgb.length; i++) {
    if (this.rgb[i] < 0) {
      this.rgb[i] = 0;
    } else if (this.rgb[i] > 1) {
      this.rgb[i] = 1;
    }
  }

  if (this.alpha < 0) {
    this.alpha = 0;
  } else if (this.alpha > 1) {
    this.alpha = 1;
  }
}



ParticleEmitter.prototype.emitOverTime = function (time) {
  var ps = particleSystem;
  var percent = false;

  if (this.lastEmitted === false || (time > this.lastEmitted + this.emissionInterval && this.emissionTraveled >= this.emissionDistance)) {
    percent = time / this.emitterLife;
    if (this.looping === true) {
      percent %= 1.0;
    }

    if (percent < 1.2) {
      this.handleEmission(percent, time);
      this.lastEmitted = time;
      this.emissionTraveled = 0;
    }
    var aliveParticles = [];
    for (var i = 0; i < this.particles.length; i++) {
      if (this.particles[i].dead === false || ps.editFlag === true) {
        aliveParticles.push(this.particles[i]);
      }
    }
    this.particles = aliveParticles;
  }
  return percent;
}

ParticleEmitter.prototype.forceEmission = function () {
  this.lastEmitted = false;
}

ParticleEmitter.prototype.pause = function (doRemoveParticles) {
  this.paused = true;
  if (doRemoveParticles) {
    this.particles.length = 0;
    this.toDraw.length = 0;
  }
}

ParticleEmitter.prototype.resume = function () {
  this.paused = false;
}

ParticleEmitter.prototype.handleEmission = function (percent, time) {
  function findRate(start, end, percent) {
    return start * percent + (1.0 - percent) * end;
  }
  var currRate = findRate(this.emitRate, this.endRate, percent);

  if (this.rate1Mode.search("Curve") >= 0) {
    currRate = Math.floor(this.findCurveValue("rate1Curve", percent));
    if (this.rate1Mode.search("rand") >= 0) {
      var rate2 = Math.floor(this.findCurveValue("rate2Curve", percent));
      currRate = Math.floor(calcRandom(currRate, rate2));
    }
  }

  for (var i = 0; i < currRate; i++) {
    var newParticle = new Particle(this, time);
    this.particles.push(newParticle);
  }
}

ParticleEmitter.prototype.calcBoundingBox = function(){
  var minX = 1e6; //upper limit of 1000000
  var minY = 1e6; //upper limit of 1000000
  var minZ = 1e6; //upper limit of 1000000
  var maxX = -1e6; //lower limit of -1000000
  var maxY = -1e6; //lower limit of -1000000
  var maxZ = -1e6; //lower limit of -1000000

  function greater(a, b) { //function which returns the greater of two values
    return (a > b) ? a : b;
  }
  function lesser(a, b) { //function which returns the lesser of two values
    return (a < b) ? a : b;
  }
  var pos = this.positionsToDraw;
  var len = pos.length;
  for (var i = 0; i < len; i+=3) {
    var omx = pos[i];
    var omy = pos[i+1];
    var omz = pos[i+2];
    var oMx = pos[i]
    var oMy = pos[i+1];
    var oMz = pos[i+2];

    minX = lesser(minX, omx);
    minY = lesser(minY, omy);
    minZ = lesser(minZ, omz);
    maxX = greater(maxX, oMx);
    maxY = greater(maxY, oMy);
    maxZ = greater(maxZ, oMz);
  }
  return [minX, minY, minZ, maxX, maxY, maxZ];
}

/*
    @purpose: update all particles for a given emitter based on how far into an emitter's emission lifecycle the system currently is
    @param time: a value indicating the clockTime for a given emitter
*/
ParticleEmitter.prototype.updateParticles = function (time) {
  var ps = particleSystem;
  if (this.paused || time < this.emissionTime) {
    return;
  }
  
  this.toDraw = []; 

  var percent = percent = this.emitOverTime(time);

  for (var i = 0; i < this.particles.length; i++) {
    if (this.particles[i].birth < time && this.particles[i].birth + this.particles[i].lifetime > time) {
      this.toDraw.push(this.particles[i]);
    } else if (this.particles[i].birth + this.particles[i].lifetime < time) {
      this.particles[i].dead = true;
    }
  }
  if (this.ribbon3D) {
    // add particle at current position
    var newParticle = new Particle(this, time);
    this.toDraw.push(newParticle);

    let p = this.toDraw[0];
    let percent = (time - p.birth) / p.lifetime;
    this.maxPercentLifetime = Math.max(percent, this.maxPercentLifetime);
  }

  if (this.looping === false && percent > 1.2 && ps.editFlag === false) {
    this.dead = true;
  }

  this.positionsToDraw = [];
  this.colors = [];
  this.spriteCorners = [];
  this.uvSet = [];
  this.indices = [];

  function calcUVCoord(percent, rowNum, colNum, uvSet) {
    var squares = rowNum * colNum;
    var offset = Math.floor(squares * percent);

    var offsetY = Math.floor(offset % rowNum) / rowNum;
    var offsetX = Math.floor(offset / colNum) / colNum;

    var x1 = uvSet[0];
    var y1 = uvSet[1];
    var x2 = uvSet[2];
    var y2 = uvSet[3];
    var x3 = uvSet[4];
    var y3 = uvSet[5];
    var x4 = uvSet[6];
    var y4 = uvSet[7];

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

  var count = 0;
  this.dimensions = [];
  this.memberCounts = [];
  for (var j = 0; j < this.toDraw.length; j++) {
    var p = this.toDraw[j];
    p.animate(time - p.birth);
    var percent = 1.0 - ((time - p.birth) / p.lifetime);
    var uvSet = calcUVCoord(percent, this.colNum, this.rowNum, this.defaultUV);
    if (p.trailLength > 0) {
      var res = p.calcTrail(uvSet, percent);
      var pos = res[0];
      var rgba = res[1];
      var uvs = res[2];
      var corners = res[3];
      for (var i = 0; i < pos.length; i += 3) {
        for (var k = 0; k < 4; k++) {
          this.positionsToDraw.push(pos[i]);
          this.positionsToDraw.push(pos[i + 1]);
          this.positionsToDraw.push(pos[i + 2]);
        }
      }
      for (var i = 0; i < rgba.length; i += 4) {
        for (var k = 0; k < 4; k++) {
          this.colors.push(rgba[i]);
          this.colors.push(rgba[i + 1]);
          this.colors.push(rgba[i + 2]);
          this.colors.push(rgba[i + 3]);
        }
      }
      for (var i = 0; i < uvs.length; i++) {
        this.uvSet.push(uvs[i]);
      }
      for (var i = 0; i < corners.length; i++) {
        this.spriteCorners.push(corners[i]);
      }
      var num = uvs.length / 8;
      for (var i = 0; i < num; i++) {
        var index = count * 4;
        this.indices.push(index);
        this.indices.push(index + 1);
        this.indices.push(index + 2);
        this.indices.push(index);
        this.indices.push(index + 2);
        this.indices.push(index + 3);
        count++;
      }
    } else {
      for (var k = 0; k < 4; k++) {
        for (var pos = 0; pos < p.position.length; pos++) {
          this.positionsToDraw.push(p.positionVal[pos]);
        }
        for (var rgb = 0; rgb < p.rgbVal.length; rgb++) {
          this.colors.push(p.rgbVal[rgb]);
        }
        this.colors.push(p.alphaVal);
      }
      if (p.ribbon3D) {
        // make two positions along 3D direction to orient the ribbon
        let lastPosIndex = this.positionsToDraw.length - 12;
        this.positionsToDraw[lastPosIndex] -= p.ribbonDirX * p.scaleY * 0.5;
        this.positionsToDraw[lastPosIndex + 1] -= p.ribbonDirY * p.scaleY * 0.5;
        this.positionsToDraw[lastPosIndex + 2] -= p.ribbonDirZ * p.scaleY * 0.5;
        this.positionsToDraw[lastPosIndex + 3] += p.ribbonDirX * p.scaleY * 0.5;
        this.positionsToDraw[lastPosIndex + 4] += p.ribbonDirY * p.scaleY * 0.5;
        this.positionsToDraw[lastPosIndex + 5] += p.ribbonDirZ * p.scaleY * 0.5;
        let u = (1.0 - percent) / this.maxPercentLifetime;
        this.uvSet.push(u);
        this.uvSet.push(0.0);
        this.uvSet.push(u);
        this.uvSet.push(1.0);
      }
      else {
        this.uvSet.push(uvSet[0]);
        this.uvSet.push(uvSet[1]);
        this.uvSet.push(uvSet[2]);
        this.uvSet.push(uvSet[3]);
        this.uvSet.push(uvSet[4]);
        this.uvSet.push(uvSet[5]);
        this.uvSet.push(uvSet[6]);
        this.uvSet.push(uvSet[7]);
      }
      for (var c = 0; c < p.corners.length; c++) {
        this.spriteCorners.push(p.corners[c]);
      }
      var index = j * 4;
      this.indices.push(index);
      this.indices.push(index + 1);
      this.indices.push(index + 2);
      this.indices.push(index);
      this.indices.push(index + 2);
      this.indices.push(index + 3);
    }
  }
  if (ps.drawBB) {
    this.boundingBox = this.calcBoundingBox();
  }
}

ParticleEmitter.prototype.drawRibbon = function (mvp_matrix, mvp_matrix1) {
  var ps = particleSystem;
  var gl = ps.gl;
  var locations;
  var attributes;

  if (this.ribbon3D) {
    gl.useProgram(ps.ribbonShader3D);
    locations = ps.locationsRibbon3D;
    attributes = ps.attributesRibbon3D;
  } else {
    gl.useProgram(ps.ribbonShaderNA);
    locations = ps.locationsRibbonNA;
    attributes = ps.attributesRibbonNA;
  }

  if (!this.texture) {
    return;
  }

  var cLen = this.colors.length;
  var pLen = this.positionsToDraw.length;
  var uvLen = this.uvSet.length;
  var p = this.positionsToDraw;
  var c = this.colors;
  var u = this.uvSet;

  this.rgba = [];
  this.prev = [];
  this.current = [];
  this.next = [];
  this.uvs = [];

  var loc = [];
  if (this.ribbon3D) {
    // draw all vertices of tri strip, not using prev and next
    for (var i = 0; i < pLen; i += 12) {
      var x1 = p[i];
      var y1 = p[i + 1];
      var z1 = p[i + 2];
      var x2 = p[i + 3];
      var y2 = p[i + 4];
      var z2 = p[i + 5];
      loc.push(x1, y1, z1, 1);
      loc.push(x2, y2, z2, 1);
    }
    if (loc.length < 16) {
      return;
    }
    var num = loc.length;
    for (var i = 0; i < num; i++) {
      this.current.push(loc[i]);
    }
    for (var i = 0; i < cLen; i += 16) {
      this.rgba.push(c[i], c[i + 1], c[i + 2], c[i + 3]);
      this.rgba.push(c[i], c[i + 1], c[i + 2], c[i + 3]);
    }
    var size = num / 4;
    for (var i = 0; i < size * 4; i += 4) {
      this.uvs.push(u[i], u[i + 1], u[i + 2], u[i + 3]);
    }
  }
  else {
    for (var i = 0; i < pLen; i += 12) {
      var x = p[i];
      var y = p[i + 1];
      var z = p[i + 2];
      loc.push(x, y, z, -1);
      loc.push(x, y, z, 1);
    }
    if (loc.length < 24) {
      return;
    }
    var num = loc.length - 16;
    for (var i = 0; i < num; i++) {
      this.prev.push(loc[i]);
      this.current.push(loc[i + 8]);
      this.next.push(loc[i + 16]);
    }
    for (var i = 0; i < cLen; i += 16) {
      this.rgba.push(c[i], c[i + 1], c[i + 2], c[i + 3]);
      this.rgba.push(c[i], c[i + 1], c[i + 2], c[i + 3]);
      this.rgba.push(c[i], c[i + 1], c[i + 2], c[i + 3]);
    }
    var size = num / 4;
    for (var i = 0; i < size * 8; i += 8) {
      this.uvs.push(u[i + 2], u[i + 3], u[i + 4], u[i + 5], u[i], u[i + 1], u[i + 6], u[i + 7]);
    }
  }
  
  ps.applyTexture(this.texture, locations);
  gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
  if (vrMultiview && vrMultiview.isActive) {
    gl.uniformMatrix4fv(locations.mvp_matrix1, false, mvp_matrix1);
  }
  gl.uniform3fv(locations.ucolor, this.ucolor);
  gl.uniform2fv(locations.view, [autoResFullWidth, autoResFullHeight]);

  assignBuffer(this.currBuffer, "ARRAY_BUFFER", this.current, attributes.pos, 4, "float");
  assignBuffer(this.rgbaBuffer, "ARRAY_BUFFER", this.rgba, attributes.rgba, 4, "float");
  assignBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.uvs, attributes.uvs, 2, "float");
  if (this.ribbon3D) {
    ps.enableAttributes(attributes, ps.ribbonAttributes3D);
  }
  else {
    assignBuffer(this.prevBuffer, "ARRAY_BUFFER", this.prev, attributes.prev, 4, "float");
    assignBuffer(this.nextBuffer, "ARRAY_BUFFER", this.next, attributes.next, 4, "float");
    assignBuffer(this.dimensionsBuffer, "ARRAY_BUFFER", this.dimensions, attributes.dimension, 1, "float");
    ps.enableAttributes(attributes, ps.ribbonAttributes);
  }


  if (this.memberCounts.length === 0) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, size);
  } else {
    var drawn = 0;
    var mcl = this.memberCounts.length;
    for (var i = 0; i < mcl; i++) {
      var members = this.memberCounts[i] + 1;
      var toDraw = (members * 2) - 2;
      gl.drawArrays(gl.TRIANGLE_STRIP, drawn, toDraw);
      drawn += toDraw + 2;
    }
  }
  if (this.ribbon3D) {
    ps.disableAttributes(attributes, ps.ribbonAttributes3D);
  }
  else {
    ps.disableAttributes(attributes, ps.ribbonAttributes);
  }
  this.particlesDrawn = size;
}

/*
    @purpose: draw all particles for a given cpu particle emitter
    @param viewMatrix: the current view matrix of the app's camera
    @param projMatrix: the current projection matrix of the app's camera
    @param time: the current clockTime of the particle emitter
    @param: the effect's parent which contains important matrix information for proper drawing
*/
ParticleEmitter.prototype.draw = function (viewMatrix, projMatrix, time, parent) {
  var ps = particleSystem;
  var gl = ps.gl;
  var locations, attributes;
  if (this.toDraw.length < 1 || (ps.drawBB && app.viewFrustrum.inside(this.boundingBox))) {
    return;
  }

  var rv = ps.getMatrices(viewMatrix, projMatrix, parent, this.modelMatrix);
  var modelViewMatrix = rv[0];
  var mvp_matrix = rv[1];
  var modelViewMatrix1 = vrMultiview ? rv[2] : null;
  var mvp_matrix1 = vrMultiview ? rv[3] : null;

  if (this.ribbon) {
    this.drawRibbon(mvp_matrix, mvp_matrix1);
  } else {
    if (this.billboards) {
      gl.useProgram(ps.particleShaderCPU);
      locations = ps.locationsCPU;
      attributes = ps.attributesCPU;
    } else {
      gl.useProgram(ps.particleShaderCPU_NA);
      locations = ps.locationsCPU_NA;
      attributes = ps.attributesCPU_NA;
    }

    ps.applyTexture(this.texture, locations);
    gl.uniform3fv(locations.ucolor, this.ucolor);
    gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
    if (this.billboards) {
      gl.uniformMatrix4fv(locations.mv_matrix, false, modelViewMatrix);
    }
    if (vrMultiview && vrMultiview.isActive) {
      gl.uniformMatrix4fv(locations.mvp_matrix1, false, mvp_matrix1);
      if (this.billboards) {
        gl.uniformMatrix4fv(locations.mv_matrix1, false, modelViewMatrix1);
      }
    }

    assignBuffer(this.posBuffer, "ARRAY_BUFFER", this.positionsToDraw, attributes.pos, 3, "float");
    assignBuffer(this.cornersBuffer, "ARRAY_BUFFER", this.spriteCorners, attributes.spriteCorners, 2, "float");
    assignBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.uvSet, attributes.uvs, 2, "float");
    assignBuffer(this.rgbaBuffer, "ARRAY_BUFFER", this.colors, attributes.rgba, 4, "float");
    assignBuffer(this.indicesBuffer, "ELEMENT_ARRAY_BUFFER", this.indices, false, 0, "u_int");
    ps.enableAttributes(attributes, ps.cpuAttributes);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    ps.disableAttributes(attributes, ps.cpuAttributes);
    this.particlesDrawn = this.indices.length / 6;
    if(ps.drawBB && this.boundingBox){
      if(!this.drawBoundingBox){
        this.drawBoundingBox = new DrawBoundingBox(gl)
      }
      app.scratchMatrix.set(app.projectionMatrix)
      multiplyMat(app.scratchMatrix, app.modelMatrix, app.scratchMatrix2)
      this.drawBoundingBox.draw(gl, this.boundingBox, [1,0,0,1], app.scratchMatrix)
    }
  }
}

GpuEmitter.prototype.determineShader = function () {
  var ps = particleSystem;
  var gl = ps.gl;
  var loop = this.looping;
  var billboard = this.billboards;
  var ribbon = this.ribbon;
  var rv = [];
  if (loop === true) {
    if (billboard === true) {
      if (ribbon === true) {
        gl.useProgram(ps.ribbonShaderGPU_RIB_YL);
        rv[0] = ps.locationsRibbonYL;
        rv[1] = ps.attributesRibbonYL;
      } else {
        gl.useProgram(ps.particleShaderYL);
        rv[0] = ps.locationsYL;
        rv[1] = ps.attributesYL;
      }
    } else {
      if (ribbon === true) {
        gl.useProgram(ps.ribbonShaderGPU_RIB_YLNA);
        rv[0] = ps.locationsRibbonYLNA;
        rv[1] = ps.attributesRibbonYLNA;
      } else {
        gl.useProgram(ps.particleShaderYLNA);
        rv[0] = ps.locationsYLNA;
        rv[1] = ps.attributesYLNA;
      }
    }
  } else {
    if (billboard === true) {
      if (ribbon === true) {
        gl.useProgram(ps.ribbonShaderGPU_RIB);
        rv[0] = ps.locationsRibbonNL;
        rv[1] = ps.attributesRibbonNL;
      } else {
        gl.useProgram(ps.particleShader);
        rv[0] = ps.locationsNL;
        rv[1] = ps.attributesNL;
      }
    } else {
      if (ribbon === true) {
        gl.useProgram(ps.ribbonShaderGPU_RIB_NA);
        rv[0] = ps.locationsRibbonNLNA;
        rv[1] = ps.attributesRibbonNLNA;
      } else {
        gl.useProgram(ps.particleShaderNA);
        rv[0] = ps.locationsNLNA;
        rv[1] = ps.attributesNLNA;
      }
    }
  }
  return rv;
}


/*
    @purpose: draw all particles for a given gpu particle emitter
    @param viewMatrix: the current view matrix of the app's camera
    @param projMatrix: the current projection matrix of the app's camera
    @param time: the current clockTime of the particle emitter
    @param: the effect's parent which contains important matrix information for proper drawing
*/
GpuEmitter.prototype.draw = function (viewMatrix, projMatrix, time, parent) {
  var ps = particleSystem;
  var gl = ps.gl;
  var rv = this.determineShader();
  var attributes = rv[1];
  var locations = rv[0];

  if (time <= this.emissionTime) {
    return;
  }

  var clockTime = time;
  if (this.looping === false) {
    if (clockTime > this.latestTime) {
      this.dead = true;
      return;
    }
  }
  var emittedSoFar = 0;
  if (this.looping === false) {
    emittedSoFar = this.calcEmitted(clockTime);
  } else {
    if (this.ribbon === true) {
      emittedSoFar = this.calcEmitted(clockTime % this.latestTime);
    } else {
      emittedSoFar = this.vertexIndices;
    }
  }


  var rv = ps.getMatrices(viewMatrix, projMatrix, parent, this.modelMatrix);
  var modelViewMatrix = rv[0];
  var mvp_matrix = rv[1];
  var modelViewMatrix1 = vrMultiview ? rv[2] : null;
  var mvp_matrix1 = vrMultiview ? rv[3] : null;


  ps.applyTexture(this.texture, locations);
  gl.uniform3fv(locations.ucolor, this.ucolor);
  gl.uniformMatrix4fv(locations.mvp_matrix, false, mvp_matrix);
  if (vrMultiview && vrMultiview.isActive) {
    gl.uniformMatrix4fv(locations.mvp_matrix1, false, mvp_matrix1);
  }
  gl.uniform3fv(locations.emitterPos, this.position);
  gl.uniform3fv(locations.drag, [this.accel1, this.accel2, this.accel3]);
  gl.uniform1f(locations.timeStamp, clockTime);
  gl.uniform1f(locations.rowNum, this.rowNum);
  gl.uniform1f(locations.colNum, this.colNum);
  gl.uniform1f(locations.alphaUniform, this.alpha);
  if (this.ribbon === true) {
    gl.uniform2fv(locations.view, [autoResFullWidth, autoResFullHeight]);
  } else {
    gl.uniformMatrix4fv(locations.mv_matrix, false, modelViewMatrix);
    if (vrMultiview && vrMultiview.isActive) {
      gl.uniformMatrix4fv(locations.mv_matrix1, false, modelViewMatrix1);
    }
  }

  emittedSoFar = new Uint16Array(emittedSoFar);
  assignGPUBuffer(this.lifeBuffer, "ARRAY_BUFFER", this.lifetimes, attributes.longevity, 1, "float");
  assignGPUBuffer(this.birthBuffer, "ARRAY_BUFFER", this.births, attributes.birth, 1, "float");
  assignGPUBuffer(this.uvsBuffer, "ARRAY_BUFFER", this.textureCoords, attributes.uvs, 2, "float");
  assignGPUBuffer(this.velocityBuffer, "ARRAY_BUFFER", this.velocities, attributes.velocity, 3, "float");
  assignGPUBuffer(this.spreadBuffer, "ARRAY_BUFFER", this.posSpreads, attributes.spread, 3, "float");
  assignGPUBuffer(this.rgbaBuffer, "ARRAY_BUFFER", this.rgba, attributes.rgba, 4, "float");
  assignGPUBuffer(this.endRGBABuffer, "ARRAY_BUFFER", this.endRgba, attributes.endRGBA, 4, "float");
  assignGPUBuffer(this.scalesBuffer, "ARRAY_BUFFER", this.scales, attributes.scales, 4, "float");
  if (this.ribbon === false) {
    assignGPUBuffer(this.rotationBuffer, "ARRAY_BUFFER", this.rotations, attributes.rotation, 2, "float");
    assignGPUBuffer(this.spriteBuffer, "ARRAY_BUFFER", this.spriteEnds, attributes.spriteCorners, 2, "float");
    assignGPUBuffer(this.emittedBuffer, "ELEMENT_ARRAY_BUFFER", emittedSoFar, false, 0, "u_int");

    ps.enableAttributes(attributes, ps.gpuAttributes);
    gl.drawElements(gl.TRIANGLES, emittedSoFar.length, gl.UNSIGNED_SHORT, 0);
    ps.disableAttributes(attributes, ps.gpuAttributes);
    this.particlesDrawn = emittedSoFar.length / 6;
  } else {
    assignGPUBuffer(this.directionsBuffer, "ARRAY_BUFFER", this.directions, attributes.direction, 1, "float");
    var size = (emittedSoFar.length / 6);
    var start = emittedSoFar[0];
    size *= 4;
    ps.enableAttributes(attributes, ps.ribbonAttributesGPU);
    gl.drawArrays(gl.TRIANGLE_STRIP, start, size);
    ps.disableAttributes(attributes, ps.ribbonAttributesGPU);
    this.particlesDrawn = size;
  }
}

//common particle shader code found below
particleSystem.commonVertexCode_GPU =
  `#define PI 3.1415926538

uniform float timeStamp;
uniform float initAlpha;
uniform vec3 emitterPos;
uniform vec3 drag;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif
$MODEL
attribute float emitterLife;
attribute float birth;
attribute vec2 uvs;
attribute vec2 spriteCorner;
attribute vec2 rotation;
attribute vec4 rgba;
attribute vec4 endRgba;
attribute vec4 scale;
attribute vec3 velocity;
attribute vec3 emitterSpread;

varying float inverseTime;
varying vec2 textVarying;
varying vec4 rgbaVarying;

float linearProgression(float val1, float val2, float time, float inverseTime){
    return inverseTime * val1 + time * val2;
}

void main (void) {

  $TIME

  vec4 position = vec4(emitterPos + emitterSpread + (time * ((drag*time)+velocity)) ,1.0);

  float width = linearProgression(scale.y, scale.w, time, inverseTime);
  float length = linearProgression(scale.x, scale.z, time, inverseTime);
  float angle = linearProgression(rotation.x, rotation.y, time, inverseTime);
  angle = angle * PI/180.0;

  vec2 rotatedCorner = vec2(1.0,1.0);
  rotatedCorner.x = spriteCorner.x*width * cos(angle) - spriteCorner.y*length *sin(angle);
  rotatedCorner.y = spriteCorner.x*width * sin(angle) + spriteCorner.y*length *cos(angle);

  $FINAL

  #ifdef VR_MULTIVIEW
  mat4 mvpMat = gl_ViewID_OVR == 0u? mvpMatrix : mvpMatrix1;
  gl_Position = mvpMat * final;
  #else
  gl_Position = mvpMatrix * final;
  #endif

  vec3 color = inverseTime*rgba.rgb + time*endRgba.rgb;
  float alpha = linearProgression(rgba.a, endRgba.a, time, inverseTime);
  rgbaVarying = vec4(color,initAlpha+alpha);
  textVarying = uvs;
}
`

particleSystem.commonVertexCode_CPU =
  `
precision mediump float;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif
$MODEL
attribute vec3 position;
attribute vec2 rotatedCorner;
attribute vec2 uvs;
attribute vec4 rgba;

varying vec2 textVarying;
varying vec4 rgbaVarying;

void main (){
  $CORNER
  vec4 final = vec4(corner,1.0);
  #ifdef VR_MULTIVIEW
  mat4 mvpMat = gl_ViewID_OVR == 0u? mvpMatrix : mvpMatrix1;
  gl_Position = mvpMat * final;
  #else
  gl_Position = mvpMatrix * final;
  #endif

  rgbaVarying = rgba;
  textVarying = uvs;
}
`

particleSystem.commonVertexCode_Ribbon_GPU =
  `
precision mediump float;
uniform float timeStamp;
uniform float initAlpha;
uniform vec3 emitterPos;
uniform vec3 drag;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif
uniform vec2 viewport;

attribute float emitterLife;
attribute float birth;
attribute float direction;
attribute vec2 uvs;
attribute vec4 rgba;
attribute vec4 endRgba;
attribute vec4 scale;
attribute vec3 velocity;
attribute vec3 emitterSpread;

varying float inverseTime;
varying vec2 textVarying;
varying vec4 rgbaVarying;

float pi = 3.141592653589793;

vec4 matTransform(vec3 coord){
#ifdef VR_MULTIVIEW
  mat4 mvpMat = gl_ViewID_OVR == 0u? mvpMatrix : mvpMatrix1;
  return mvpMat * vec4(coord, 1.0);
#else
  return mvpMatrix * vec4(coord, 1.0);
#endif
}

vec2 project(vec4 coord){
  vec3 coord_normal = coord.xyz/coord.w;
  vec2 clip_pos = (coord_normal*0.5+0.5).xy;
  return clip_pos * viewport;
}

vec4 unproject(vec2 screen, float z, float w){
  vec2 clip_pos = screen/viewport;
  vec2 coord_normal = clip_pos*2.0-1.0;
  return vec4(coord_normal*w, z, w);
}

float linearProgression(float val1, float val2, float time, float inverseTime){
    return inverseTime * val1 + time * val2;
}

void main(){

  $TIME

  float prevTime = time - 0.025;
  float nextTime = time + 0.025;
  vec4 current = vec4(emitterPos + emitterSpread + (time * ((drag*time)+velocity)), 1.0);
  vec4 prev = vec4(emitterPos + emitterSpread + (prevTime * ((drag*prevTime)+velocity)), 1.0);
  vec4 next = vec4(emitterPos + emitterSpread + (nextTime * ((drag*nextTime)+velocity)), 1.0);

  float dimension = linearProgression(scale.x+scale.w, scale.y+scale.z, time, inverseTime);

  vec2 sPrev = project(matTransform(prev.xyz));
  vec2 sNext = project(matTransform(next.xyz));

  vec4 dCurrent = matTransform(current.xyz);
  vec2 sCurrent = project(dCurrent);

  vec2 normal1 = normalize(sPrev - sCurrent);
  vec2 normal2 = normalize(sCurrent - sNext);
  vec2 normal = normalize(normal1 + normal2);

  float angle = atan(normal.x, normal.y)+pi*0.5;
  $DIRECTION
  vec2 pos = sCurrent + dir * dimension * 100.0;
  gl_Position = unproject(pos, dCurrent.z, dCurrent.w);
  vec3 color = inverseTime*rgba.rgb + time*endRgba.rgb;
  float alpha = linearProgression(rgba.a, endRgba.a, time, inverseTime);
  textVarying = uvs;
  rgbaVarying = vec4(color,initAlpha+alpha);
}
`

particleSystem.commonVertexCode_Ribbon =
  `
precision mediump float;
varying vec2 textVarying;
varying vec4 rgbaVarying;

attribute vec4 prev;
attribute vec4 current;
attribute vec4 next;
attribute vec4 rgba;
attribute vec2 uvs;
attribute float dimension;
uniform vec2 viewport;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif

float pi = 3.141592653589793;

vec4 matTransform(vec3 coord){
#ifdef VR_MULTIVIEW
  mat4 mvpMat = gl_ViewID_OVR == 0u? mvpMatrix : mvpMatrix1;
  return mvpMat * vec4(coord, 1.0);
#else
  return mvpMatrix * vec4(coord, 1.0);
#endif
}

vec2 project(vec4 coord){
  vec3 coord_normal = coord.xyz/coord.w;
  vec2 clip_pos = (coord_normal*0.5+0.5).xy;
  return clip_pos * viewport;
}

vec4 unproject(vec2 screen, float z, float w){
  vec2 clip_pos = screen/viewport;
  vec2 coord_normal = clip_pos*2.0-1.0;
  return vec4(coord_normal*w, z, w);
}

void main(){
  vec2 sPrev = project(matTransform(prev.xyz));
  vec2 sNext = project(matTransform(next.xyz));

  vec4 dCurrent = matTransform(current.xyz);
  vec2 sCurrent = project(dCurrent);

  vec2 normal1 = normalize(sPrev - sCurrent);
  vec2 normal2 = normalize(sCurrent - sNext);
  vec2 normal = normalize(normal1 + normal2);

  float angle = atan(normal.x, normal.y)+pi*0.5;
  $DIRECTION
  vec2 pos = sCurrent + dir * dimension * 100.0;
  gl_Position = unproject(pos, dCurrent.z, dCurrent.w);
  textVarying = uvs;
  rgbaVarying = rgba;
}
`

particleSystem.vertexCode_Ribbon3D =
  `
precision mediump float;
varying vec2 textVarying;
varying vec4 rgbaVarying;

attribute vec4 prev;
attribute vec4 current;
attribute vec4 next;
attribute vec4 rgba;
attribute vec2 uvs;
attribute float dimension;
uniform vec2 viewport;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif

vec4 matTransform(vec3 coord){
#ifdef VR_MULTIVIEW
  mat4 mvpMat = gl_ViewID_OVR == 0u? mvpMatrix : mvpMatrix1;
  return mvpMat * vec4(coord, 1.0);
#else
  return mvpMatrix * vec4(coord, 1.0);
#endif
}

void main(){
  gl_Position = matTransform(current.xyz);
  textVarying = uvs;
  rgbaVarying = rgba;
}
`

particleSystem.gpuFragmentCode =
  `precision mediump float;

varying vec2 textVarying;
varying vec4 rgbaVarying;
varying float inverseTime;

uniform float rowNum;
uniform float colNum;
uniform sampler2D texturemap;
uniform vec3 ucolor;

void main (void) {
  float squares = rowNum * colNum;
  float offset = floor(squares * (1.0-inverseTime));
  float offsetX = floor(mod(offset, rowNum)) / rowNum;
  float offsetY = floor(offset / colNum) / colNum;

  vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
  textFlipped.x = textFlipped.x / rowNum + offsetX;
  textFlipped.y = textFlipped.y / colNum + offsetY;
  vec4 tcolor = texture2D(texturemap,textFlipped);

  vec4 ncolor = tcolor*rgbaVarying*vec4(ucolor.xyz, 1.0);
  float luminance = 0.299*ncolor.r+0.587*ncolor.g+0.114*ncolor.b;
  gl_FragColor = vec4(ncolor.r, ncolor.g,ncolor.b,luminance*ncolor.a*ncolor.a);
}
`

particleSystem.cpuFragmentCode =
  `
precision mediump float;
varying vec2 textVarying;
varying vec4 rgbaVarying;

uniform sampler2D texturemap;
uniform vec3 ucolor;

void main (void){
    vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
    vec4 tcolor = texture2D(texturemap,textFlipped);

    vec4 ncolor = tcolor*rgbaVarying*vec4(ucolor.xyz, 1.0);
    float luminance = 0.299*ncolor.r+0.587*ncolor.g+0.114*ncolor.b;
    gl_FragColor = vec4(ncolor.r, ncolor.g,ncolor.b,luminance*ncolor.a*ncolor.a);
}
`

// particle string substitution options
particleSystem.GPU_RIBBON_CODE_NA = `vec2 dir = vec2(1.0, 1.0)*direction;`;
particleSystem.GPU_RIBBON_CODE = `vec2 dir = vec2(sin(angle), cos(angle))*direction;`;

particleSystem.CPU_RIBBON_CODE_NA = `vec2 dir = vec2(1.0, 1.0)*current.w;`;
particleSystem.CPU_RIBBON_CODE = `vec2 dir = vec2(sin(angle), cos(angle))*current.w;`;
particleSystem.CPU_CODE_NA = `vec3 corner = vec3(rotatedCorner,1.0) + position.xyz;`;
particleSystem.CPU_CODE =
  `
#ifdef VR_MULTIVIEW
mat4 mvMat = gl_ViewID_OVR == 0u? mvMatrix : mvMatrix1;
#else
mat4 mvMat = mvMatrix;
#endif
vec3 axis1 = vec3(mvMat[0][0], mvMat[1][0], mvMat[2][0]);
vec3 axis2 = vec3(mvMat[0][1], mvMat[1][1], mvMat[2][1]);
vec3 corner = rotatedCorner.x*axis1 + rotatedCorner.y*axis2 + position.xyz;
`;
particleSystem.GPU_TIME_LOOP =
  `
float time = mod(timeStamp-birth,emitterLife);
time = 1.3 - (time/emitterLife);
inverseTime = clamp(time, 0.0, 1.0);
time= 1.0-inverseTime;
`;

particleSystem.GPU_TIME =
  `
float time = mod(timeStamp-birth,emitterLife);
time = time/emitterLife;
inverseTime = 1.0-time;
`;

particleSystem.GPU_POS_NA =
  `
vec3 corner = vec3(rotatedCorner,0.0);
vec4 final = vec4(corner+position.xyz,1.0);
`;

particleSystem.GPU_POS =
  `
#ifdef VR_MULTIVIEW
mat4 mvMat = gl_ViewID_OVR == 0u? mvMatrix : mvMatrix1;
#else
mat4 mvMat = mvMatrix;
#endif
vec3 axis1 = vec3(mvMat[0][0], mvMat[1][0], mvMat[2][0]);
vec3 axis2 = vec3(mvMat[0][1], mvMat[1][1], mvMat[2][1]);
vec3 corner = rotatedCorner.x*axis1 + rotatedCorner.y*axis2 + position.xyz;
vec4 final = vec4(corner,1.0);
`;

//particle string replacements
particleSystem.vertex_CPU_RIB_NA =
  particleSystem.commonVertexCode_Ribbon.replace("$DIRECTION", particleSystem.CPU_RIBBON_CODE_NA);

particleSystem.vertex_CPU_RIB =
  particleSystem.commonVertexCode_Ribbon.replace("$DIRECTION", particleSystem.CPU_RIBBON_CODE);

particleSystem.vertex_CPU_NA =
  particleSystem.commonVertexCode_CPU.replace("$MODEL", '').
    replace("$CORNER", particleSystem.CPU_CODE_NA);

particleSystem.vertex_CPU =
  particleSystem.commonVertexCode_CPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$CORNER", particleSystem.CPU_CODE);

particleSystem.vertex_GPU_LOOP_NA =
  particleSystem.commonVertexCode_GPU.replace("$MODEL", '').
    replace("$TIME", particleSystem.GPU_TIME_LOOP).replace("$FINAL", particleSystem.GPU_POS_NA);

particleSystem.vertex_GPU_LOOP =
  particleSystem.commonVertexCode_GPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$TIME", particleSystem.GPU_TIME_LOOP).replace("$FINAL", particleSystem.GPU_POS);

particleSystem.vertex_GPU_NA =
  particleSystem.commonVertexCode_GPU.replace("$MODEL", '').
    replace("$TIME", particleSystem.GPU_TIME).replace("$FINAL", particleSystem.GPU_POS_NA);

particleSystem.vertex_GPU =
  particleSystem.commonVertexCode_GPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$TIME", particleSystem.GPU_TIME).replace("$FINAL", particleSystem.GPU_POS);

particleSystem.vertex_GPU_LOOP_RIB =
  particleSystem.commonVertexCode_Ribbon_GPU.replace("$TIME", particleSystem.GPU_TIME_LOOP).
    replace("$DIRECTION", particleSystem.GPU_RIBBON_CODE);

particleSystem.vertex_GPU_LOOP_RIB_NA =
  particleSystem.commonVertexCode_Ribbon_GPU.replace("$TIME", particleSystem.GPU_TIME_LOOP).
    replace("$DIRECTION", particleSystem.GPU_RIBBON_CODE_NA);

particleSystem.vertex_GPU_RIB =
  particleSystem.commonVertexCode_Ribbon_GPU.replace("$TIME", particleSystem.GPU_TIME).
    replace("$DIRECTION", particleSystem.GPU_RIBBON_CODE);

particleSystem.vertex_GPU_RIB_NA =
  particleSystem.commonVertexCode_Ribbon_GPU.replace("$TIME", particleSystem.GPU_TIME).
    replace("$DIRECTION", particleSystem.GPU_RIBBON_CODE_NA);