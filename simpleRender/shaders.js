WIRE_GEO_VERTEX =
    `precision highp float;
uniform mat4 mvp_matrix;
attribute vec3 position;
void main()
{
	gl_Position = mvp_matrix*vec4(position, 1.0);
}`;

WIRE_GEO_FRAGMENT =
    `precision highp float;
uniform vec4 color;
void main(){
	gl_FragColor = color;
}`;
