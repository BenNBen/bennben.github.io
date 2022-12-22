// particleShaders.js

particleShaders = {};

//common particle shader code found below
particleShaders.commonVertexCode_GPU =
`
$VERSION
#define PI 3.1415926538

uniform float timeStamp;
uniform float initAlpha;
uniform vec3 emitterPos;
uniform vec3 drag;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif
$MODEL
$ATTR float emitterLife;
$ATTR float birth;
$ATTR vec2 uvs;
$ATTR vec2 spriteCorner;
$ATTR vec2 rotation;
$ATTR vec4 rgba;
$ATTR vec4 endRgba;
$ATTR vec4 scale;
$ATTR vec3 velocity;
$ATTR vec3 emitterSpread;

$VARY float inverseTime;
$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

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

particleShaders.commonVertexCode_CPU =
  `
$VERSION
precision mediump float;
uniform mat4 mvpMatrix;
#ifdef VR_MULTIVIEW
uniform mat4 mvpMatrix1;
#endif
$MODEL
$ATTR vec3 position;
$ATTR vec2 rotatedCorner;
$ATTR vec2 uvs;
$ATTR vec4 rgba;

$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

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

particleShaders.commonVertexCode_Ribbon_GPU =
  `
$VERSION
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

$ATTR float emitterLife;
$ATTR float birth;
$ATTR float direction;
$ATTR vec2 uvs;
$ATTR vec4 rgba;
$ATTR vec4 endRgba;
$ATTR vec4 scale;
$ATTR vec3 velocity;
$ATTR vec3 emitterSpread;

$VARY float inverseTime;
$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

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

particleShaders.commonVertexCode_Ribbon =
  `
$VERSION
precision mediump float;
$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

$ATTR vec4 prev;
$ATTR vec4 current;
$ATTR vec4 next;
$ATTR vec4 rgba;
$ATTR vec2 uvs;
$ATTR float dimension;
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

particleShaders.vertexCode_Ribbon3D =
  `
$VERSION
precision mediump float;
$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

$ATTR vec4 prev;
$ATTR vec4 current;
$ATTR vec4 next;
$ATTR vec4 rgba;
$ATTR vec2 uvs;
$ATTR float dimension;
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

particleShaders.gpuFragmentCode =
  `
$VERSION
precision mediump float;

$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;
$VARY float inverseTime;

uniform float rowNum;
uniform float colNum;
uniform sampler2D texturemap;
uniform vec3 ucolor;

$COLOR_VAR
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
  $COLOR_OUT
}
`

particleShaders.cpuFragmentCode =
  `
$VERSION
precision mediump float;
$VARY vec2 textVarying;
$VARY vec4 rgbaVarying;

uniform sampler2D texturemap;
uniform vec3 ucolor;

$COLOR_VAR
void main (void){
    vec2 textFlipped = vec2(textVarying.x,1.0-1.0*textVarying.y);
    vec4 tcolor = texture2D(texturemap,textFlipped);

    vec4 ncolor = tcolor*rgbaVarying*vec4(ucolor.xyz, 1.0);
    float luminance = 0.299*ncolor.r+0.587*ncolor.g+0.114*ncolor.b;
    $COLOR_OUT
}
`

// particle string substitution options
particleShaders.WEBGL1_VERSION = '';
particleShaders.WEBGL2_VERSION = '#version 300 es';

particleShaders.WEBGL1_ATTR = 'attribute';
particleShaders.WEBGL2_ATTR= 'in';

particleShaders.WEBGL1_VERTEX_VARYING = 'varying';
particleShaders.WEBGL2_VERTEX_VARYING = 'out';

particleShaders.WEBGL1_FRAGMENT_VARYING = 'varying';
particleShaders.WEBGL2_FRAGMENT_VARYING = 'in';

particleShaders.WEBGL1_FRAGMENT_VARIABLE = '\n';
particleShaders.WEBGL2_FRAGMENT_VARIABLE = 'out vec4 outputColor;\n';

particleShaders.WEBGL1_FRAGMENT_COLOR = 'gl_FragColor = vec4(ncolor.r, ncolor.g,ncolor.b,luminance*ncolor.a*ncolor.a);';
particleShaders.WEBGL2_FRAGMENT_COLOR = 'outputColor = vec4(ncolor.r, ncolor.g,ncolor.b,luminance*ncolor.a*ncolor.a);';

particleShaders.GPU_RIBBON_CODE_NA = `vec2 dir = vec2(1.0, 1.0)*direction;`;
particleShaders.GPU_RIBBON_CODE = `vec2 dir = vec2(sin(angle), cos(angle))*direction;`;

particleShaders.CPU_RIBBON_CODE_NA = `vec2 dir = vec2(1.0, 1.0)*current.w;`;
particleShaders.CPU_RIBBON_CODE = `vec2 dir = vec2(sin(angle), cos(angle))*current.w;`;
particleShaders.CPU_CODE_NA = `vec3 corner = vec3(rotatedCorner,1.0) + position.xyz;`;
particleShaders.CPU_CODE =
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
particleShaders.GPU_TIME_LOOP =
  `
float time = mod(timeStamp-birth,emitterLife);
time = 1.3 - (time/emitterLife);
inverseTime = clamp(time, 0.0, 1.0);
time= 1.0-inverseTime;
`;

particleShaders.GPU_TIME =
  `
float time = mod(timeStamp-birth,emitterLife);
time = time/emitterLife;
inverseTime = 1.0-time;
`;

particleShaders.GPU_POS_NA =
  `
vec3 corner = vec3(rotatedCorner,0.0);
vec4 final = vec4(corner+position.xyz,1.0);
`;

particleShaders.GPU_POS =
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
particleShaders.vertex_CPU_RIB_NA =
  particleShaders.commonVertexCode_Ribbon.replace("$DIRECTION", particleShaders.CPU_RIBBON_CODE_NA);

particleShaders.vertex_CPU_RIB =
  particleShaders.commonVertexCode_Ribbon.replace("$DIRECTION", particleShaders.CPU_RIBBON_CODE);

particleShaders.vertex_CPU_NA =
  particleShaders.commonVertexCode_CPU.replace("$MODEL", '').
    replace("$CORNER", particleShaders.CPU_CODE_NA);

particleShaders.vertex_CPU =
  particleShaders.commonVertexCode_CPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$CORNER", particleShaders.CPU_CODE);

particleShaders.vertex_GPU_LOOP_NA =
  particleShaders.commonVertexCode_GPU.replace("$MODEL", '').
    replace("$TIME", particleShaders.GPU_TIME_LOOP).replace("$FINAL", particleShaders.GPU_POS_NA);

particleShaders.vertex_GPU_LOOP =
  particleShaders.commonVertexCode_GPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$TIME", particleShaders.GPU_TIME_LOOP).replace("$FINAL", particleShaders.GPU_POS);

particleShaders.vertex_GPU_NA =
  particleShaders.commonVertexCode_GPU.replace("$MODEL", '').
    replace("$TIME", particleShaders.GPU_TIME).replace("$FINAL", particleShaders.GPU_POS_NA);

particleShaders.vertex_GPU =
  particleShaders.commonVertexCode_GPU.replace("$MODEL",
    "uniform mat4 mvMatrix;\n" +
    "#ifdef VR_MULTIVIEW\n" +
    "uniform mat4 mvMatrix1;\n" +
    "#endif\n"
  ).
    replace("$TIME", particleShaders.GPU_TIME).replace("$FINAL", particleShaders.GPU_POS);

particleShaders.vertex_GPU_LOOP_RIB =
  particleShaders.commonVertexCode_Ribbon_GPU.replace("$TIME", particleShaders.GPU_TIME_LOOP).
    replace("$DIRECTION", particleShaders.GPU_RIBBON_CODE);

particleShaders.vertex_GPU_LOOP_RIB_NA =
  particleShaders.commonVertexCode_Ribbon_GPU.replace("$TIME", particleShaders.GPU_TIME_LOOP).
    replace("$DIRECTION", particleShaders.GPU_RIBBON_CODE_NA);

particleShaders.vertex_GPU_RIB =
  particleShaders.commonVertexCode_Ribbon_GPU.replace("$TIME", particleShaders.GPU_TIME).
    replace("$DIRECTION", particleShaders.GPU_RIBBON_CODE);

particleShaders.vertex_GPU_RIB_NA =
  particleShaders.commonVertexCode_Ribbon_GPU.replace("$TIME", particleShaders.GPU_TIME).
    replace("$DIRECTION", particleShaders.GPU_RIBBON_CODE_NA);

function changeWEBGL(){
    __shaders = Object.keys(particleShaders);
    var version = particleShaders.WEBGL1_VERSION;
    var attr = particleShaders.WEBGL1_ATTR;
    var vert = particleShaders.WEBGL1_VERTEX_VARYING;
    var frag = particleShaders.WEBGL1_FRAGMENT_VARYING
    var frag_var = particleShaders.WEBGL1_FRAGMENT_VARIABLE;
    var frag_color = particleShaders.WEBGL1_FRAGMENT_COLOR;
    if (__WEB_GL_TYPE === 2){
        version = particleShaders.WEBGL2_VERSION;
        attr = particleShaders.WEBGL2_ATTR;
        vert = particleShaders.WEBGL2_VERTEX_VARYING;
        frag = particleShaders.WEBGL2_FRAGMENT_VARYING
        frag_var = particleShaders.WEBGL2_FRAGMENT_VARIABLE;
        frag_color = particleShaders.WEBGL2_FRAGMENT_COLOR;
    }
    console.log("VERSION", version, attr, vert, frag)

    for(var i =0;i<__shaders.length;i++){
        shader = particleShaders[__shaders[i]];
        if (__shaders[i].includes("Fragment")){
            shader = shader.replace("$VERSION", version).replaceAll("$ATTR", attr).replaceAll("$VARY", frag);
            shader = shader.replace("$COLOR_VAR", frag_var).replace("$COLOR_OUT", frag_color);
            console.log("SHADER", shader)
        }else{
            shader = shader.replace("$VERSION", version).replaceAll("$ATTR", attr).replaceAll("$VARY", vert);
        }
    }
    
}