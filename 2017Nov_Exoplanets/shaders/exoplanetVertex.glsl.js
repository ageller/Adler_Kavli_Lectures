var exoplanetVertexShader = `

varying vec3 vPosition;

uniform float size;

void main()
{
        vPosition = position;

        vec3 vPos = position;
        vPos.xy *= size;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( vPos, 1.0 );
}

`;