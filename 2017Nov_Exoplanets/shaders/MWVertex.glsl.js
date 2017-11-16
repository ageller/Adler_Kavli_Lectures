var MWVertexShader = `

varying vec3 vPosition;

uniform float size;
uniform float dfac;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
	vPosition = position;

	vec2 fromCenter = abs(vPosition.xy);
   	float dist = length(fromCenter);
  	
	gl_PointSize =  size * ( 100.0 / length( modelViewMatrix * vec4( position, 1.0 ))) * rand(position.xy);

	if (dfac > 0.){
		gl_PointSize *= (1. - pow(dist, dfac));
	}

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;