var M83FragmentShader = `

precision mediump float;

varying vec3 vPosition;

uniform sampler2D tex;
uniform float MWalpha;
uniform float M83alpha;

void main()
{

    vec2 texcoord = vPosition.xy + vec2(0.5);
    gl_FragColor = texture2D(tex, texcoord);

    vec2 fromCenter = abs(vPosition.xy);
    float dist = length(fromCenter);
	
    gl_FragColor.a *= clamp((0.75 - dist) * MWalpha * M83alpha, 0., 1.);


    
}
`;