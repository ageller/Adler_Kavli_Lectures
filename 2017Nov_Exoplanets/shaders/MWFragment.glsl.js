var MWFragmentShader = `

precision mediump float;

varying vec3 vPosition;

uniform vec4 color;
uniform float radius;
uniform float MWalpha;

void main()
{
	//for individual points
    vec2 fromCenter = abs(gl_PointCoord - vec2(0.5));
    float dist = 2.*length(fromCenter) ;

    gl_FragColor = color;
    gl_FragColor.a *= (1. - dist);

	//from the Center of the Galaxy
	if (radius > 0.){
		fromCenter = abs(vPosition.xy);
	   	dist = length(fromCenter)/radius;

	   	if (dist < 1.){
	   		gl_FragColor.rg += (1. - dist)*0.2;
	   		gl_FragColor.b -= (1. - dist)*0.2;

	   	}
  	}

  	gl_FragColor.a *= MWalpha;
}
`;