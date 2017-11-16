var myFragmentShader = `

precision mediump float;

varying vec3 vPosition;

uniform vec4 color;

void main()
{
    gl_FragColor = color;
    
}
`;