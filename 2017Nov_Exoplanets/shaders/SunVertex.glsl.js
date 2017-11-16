var SunVertexShader = `

varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 cameraCenter;

void main()
{
	vNormal = normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	vPosition = (modelViewMatrix * vec4( position + cameraCenter, 1.0 )).xyz;

}

`;