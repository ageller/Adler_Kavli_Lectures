layout(triangles) in;
layout(triangle_strip, max_vertices = 4) out;

uniform mat4 uv_projectionMatrix;
uniform mat4 uv_modelViewMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_normalMatrix;

uniform int uv_simulationtimeDays;
uniform float uv_simulationtimeSeconds;
uniform float uv_fade;

uniform float simBindRealtime;
uniform float simUseTime;
uniform float simRealtimestart;
uniform float simRealtimeend;
uniform float simdtmin;


//to fragment (defined below)
out vec3 cameraPosition;
out float sunTemp;
out float starRadius;
out vec2 texcoord;
out vec4 fPosition;
out float RHe;
out float RConv;
out float univYr;


// axis should be normalized
mat3 rotationMatrix(vec3 axis, float angle)
{
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
}

void drawSprite(vec4 position, float radius, float rotation)
{
    vec3 objectSpaceUp = vec3(0, 0, 1);
    vec3 objectSpaceCamera = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
    vec3 cameraDirection = normalize(objectSpaceCamera - position.xyz);
    vec3 orthogonalUp = normalize(objectSpaceUp - cameraDirection * dot(cameraDirection, objectSpaceUp));
    vec3 rotatedUp = rotationMatrix(cameraDirection, rotation) * orthogonalUp;
    vec3 side = cross(rotatedUp, cameraDirection);
    texcoord = vec2(-1., 1.);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side + rotatedUp), 1);
	EmitVertex();
    texcoord = vec2(-1., -1.);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (-side - rotatedUp), 1);
	EmitVertex();
    texcoord = vec2(1, 1);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side + rotatedUp), 1);
	EmitVertex();
    texcoord = vec2(1, -1.);
	gl_Position = uv_modelViewProjectionMatrix * vec4(position.xyz + radius * (side - rotatedUp), 1);
	EmitVertex();
	EndPrimitive();
}

void drawQuad()
{
	
    texcoord = vec2(-1., 1);
	gl_Position = vec4(-1., 1., 0., 1.);
	fPosition = gl_Position;
	EmitVertex();
	
    texcoord = vec2(-1., -1.);	
	gl_Position = vec4(-1.,-1.,0.,1.);
	fPosition = gl_Position;
	EmitVertex();
	
    texcoord = vec2(1., 1.);
	gl_Position = vec4(1.,1.,0.,1.);
	fPosition = gl_Position;
	EmitVertex();
	
	texcoord = vec2(1, -1.);
	gl_Position = vec4(1.,-1.,0.,1.);
	fPosition = gl_Position;
	EmitVertex();
	EndPrimitive();
}


void main()
{

	sunTemp = 1000.;
	starRadius = 1.;
	vec4 pos = vec4(0., 0., 0., 1.);
	vec3 cameraPosition = (uv_modelViewInverseMatrix * pos).xyz;
	float distance = length(cameraPosition);
	
//////////////////////////////////////////////////////////////
//define the time 
	//each Uniview year represents one Myr
	float dayfract = uv_simulationtimeSeconds/(24.0*3600.0);//0.5*2.0*3.14*(time)/(sqrt(a.x*a.x*a.x/3347937656.835192));
	//float yrs = 365. + 6./24. +  9./1440. +  9./86400. ; //sidereal year
	//float yrs = 365. + 5./24. + 48./1440. + 46./86400. ; //solar year
	float yrs = 365.2425;
	float years_0 = 1970. + (uv_simulationtimeDays + dayfract)/yrs;
	univYr = clamp(years_0,0.0,13800.0); 
		
		
	float timeend = simRealtimeend;
	float timestart = simRealtimestart;
	float simTime = gl_in[0].gl_Position.x;
	float usedt = max(gl_in[1].gl_Position.z, simdtmin);
	float cosmoTime = simUseTime;     

	if (simBindRealtime == 1.){
		cosmoTime = univYr;
	} 


//////////////////////////////////////////////////////////////

    if ((cosmoTime >= simTime && cosmoTime < (simTime + usedt)) || (simTime >= timeend && cosmoTime >= timeend) || (simTime <= timestart && cosmoTime <= timestart)) {

	//get the temperature and radius
		sunTemp = mix(gl_in[0].gl_Position.z, gl_in[2].gl_Position.y, (cosmoTime-simTime)/usedt);
		starRadius = mix(gl_in[0].gl_Position.y, gl_in[2].gl_Position.x, (cosmoTime-simTime)/usedt);
		RHe = mix( floor(gl_in[1].gl_Position.x)/10000. , mod(gl_in[1].gl_Position.x, 1) * 10., (cosmoTime-simTime)/usedt) ;
		RConv = mix( floor(gl_in[1].gl_Position.y)/10000. , mod(gl_in[1].gl_Position.y, 1) * 10., (cosmoTime-simTime)/usedt) ;


		starRadius = min(starRadius, 10000.)*6.95508; //My input file gives it in RSun. The conf file says this should be in units of 10^8 m
		

		//drawQuad(); //this is what was intended, but that won't work with blending.  I need to draw a sprite that is the proper size of the screen at the correct z!
		drawSprite(pos, (distance/1.), 0.);
	}

}
