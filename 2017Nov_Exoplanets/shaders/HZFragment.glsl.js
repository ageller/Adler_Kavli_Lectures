var HZFragmentShader = `

precision mediump float;

varying vec3 vPosition;

uniform float ain;
uniform float aout;
uniform vec4 color;
uniform float SSalpha;

void main()
{
    gl_FragColor = color;
    gl_FragColor.a *= SSalpha;

    vec2 fromCenter = abs(vPosition.xy);
    float dist = length(fromCenter);
    if (dist > aout || dist < ain){
		discard;
    }
    
}
`;