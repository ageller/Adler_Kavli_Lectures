const float rotationSpeed = -360.0 / 2211840;

uniform mat4 uv_projectionMatrix;
uniform mat4 uv_modelViewMatrix;
uniform mat4 uv_modelViewInverseMatrix;
uniform mat4 uv_modelViewProjectionMatrix;
uniform mat4 uv_projectionInverseMatrix;

uniform float uv_simulationtimeSeconds;
uniform float uv_timeSeconds;
uniform float uv_fade;


//from geometry
in float starRadius;
in float sunTemp;
in vec2 texcoord;
in float RHe;
in float RConv;
in float univYr;

//previously from vertex, but now calculated here
float distance;
vec3 cameraPosition;
vec3 rayDirection;

out vec4 fragColor;

uniform sampler2D bb;
uniform float alpha;

uniform float limbDarkening;
uniform float brightness;
uniform float convectionFrequency;
uniform float convectionAmount;
uniform float coronaFalloff;

uniform float perturbationAmount = 0.4;
uniform float perturbationFrequency = 0.5;

uniform vec3 starDarkestColor = vec3(0, 0, 0);
uniform vec3 starColor = vec3(1, 0.5, 0.4);

//exagerate the color a bit
uniform float sTeff;
uniform float Teffac;
float useTemp = clamp( (sunTemp - sTeff) * Teffac + sTeff, 1100., 19000.);
vec3 compensatedStarColor = texture(bb,vec2(clamp(((useTemp - 1000.)/19000.),0.,1.),0.5)).rgb * brightness;

//vec3 starDarkestColor = texture(bb, vec2(1., 0.5)).rgb;

float starRadiusSquared = pow(starRadius, 2.0);

// at what distance from the star center to start fading out
float fadeStart = starRadius * 800;

// at what distance it's completely faded out
float fadeEnd = starRadius * 100000;

// where to fade in the black background
vec2 blackOut = vec2(1, 5) * starRadius;


// cut plane along the y axis
uniform float cutPlane = 0;

uniform vec3 ColorLayerConv;
uniform vec3 ColorLayerRad;
uniform vec3 ColorLayerHe;

uniform float simCoronaTimeFac;
uniform float simSurfaceTimeFac;

uniform float drawSun;
uniform float drawCorona;

//////////////////////////////////////////////////////////////////////
// noise functions from https://github.com/ashima/webgl-noise
// inlined since USES doesn't support multiple source files currently
//////////////////////////////////////////////////////////////////////


//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0; }

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0; }

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float permute(float x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

float taylorInvSqrt(float r)
{
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec4 grad4(float j, vec4 ip)
{
    const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
    vec4 p,s;

    p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
    p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
    s = vec4(lessThan(p, vec4(0.0)));
    p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;

    return p;
}

// (sqrt(5) - 1)/4 = F4, used once below
const float F4 = 0.309016994374947451;

float snoise(vec4 v)
{
    const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4
                          0.276393202250021,  // 2 * G4
                          0.414589803375032,  // 3 * G4
                          -0.447213595499958); // -1 + 4 * G4

// First corner
    vec4 i  = floor(v + dot(v, vec4(F4)) );
    vec4 x0 = v -   i + dot(i, C.xxxx);

// Other corners

// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)
    vec4 i0;
    vec3 isX = step( x0.yzw, x0.xxx );
    vec3 isYZ = step( x0.zww, x0.yyz );
    i0.x = isX.x + isX.y + isX.z;
    i0.yzw = 1.0 - isX;
    i0.y += isYZ.x + isYZ.y;
    i0.zw += 1.0 - isYZ.xy;
    i0.z += isYZ.z;
    i0.w += 1.0 - isYZ.z;

    // i0 now contains the unique values 0,1,2,3 in each channel
    vec4 i3 = clamp( i0, 0.0, 1.0 );
    vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );
    vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );

    vec4 x1 = x0 - i1 + C.xxxx;
    vec4 x2 = x0 - i2 + C.yyyy;
    vec4 x3 = x0 - i3 + C.zzzz;
    vec4 x4 = x0 + C.wwww;

// Permutations
    i = mod289(i);
    float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x);
    vec4 j1 = permute( permute( permute( permute (
                                             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))
                                         + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))
                                + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))
                       + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));

// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope
// 7*7*6 = 294, which is close to the ring size 17*17 = 289.
    vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;

    vec4 p0 = grad4(j0,   ip);
    vec4 p1 = grad4(j1.x, ip);
    vec4 p2 = grad4(j1.y, ip);
    vec4 p3 = grad4(j1.z, ip);
    vec4 p4 = grad4(j1.w, ip);

// Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    p4 *= taylorInvSqrt(dot(p4,p4));

// Mix contributions from the five corners
    vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
    vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);
    m0 = m0 * m0;
    m1 = m1 * m1;
    return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 )))
                    + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;

}


///////////////////////////
// end of noise functions
///////////////////////////


// the ray is assumed to start in (0, 0, 0).
// rayDirection should be normalized.
// sphereCenter should be relative to the start of the ray.
// intersections is on the form vec2(fist intersection, second intersection)
bool raySphereIntersection(vec3 rayDirection, vec3 sphereCenter, float sphereRadiusSquared, out vec2 intersections)
{
    float raydotcenter = dot(rayDirection, sphereCenter);
    float intersectionSquared = sphereRadiusSquared - dot(sphereCenter, sphereCenter) + pow(raydotcenter, 2.0);
    if(intersectionSquared < 0)
        return false;
    float intersection = sqrt(intersectionSquared);
    intersections = vec2(raydotcenter - intersection, raydotcenter + intersection);
    return true;
}

// intersection between a ray and a cone with the camera in its center
// the ray is assumed to start in (0, 0, 0)
// raydirection should be normalized
// return true if intersection, false otherwise
bool rayCenterConeIntersection(vec3 rayDirection, vec3 sphereCenter, float sphereRadius, out float intersection)
{
    float cameraDistance = length(sphereCenter);
    float rayAngle = acos(dot(rayDirection, normalize(sphereCenter)));

    float centerAngle = asin(sphereRadius / cameraDistance);
    intersection = cameraDistance * cos(centerAngle) / cos(rayAngle - centerAngle);

    return intersection > 0;
}

bool rayPlaneIntersection(vec3 rayDirection, vec3 planePoint, vec3 planeNormal, out float intersection)
{
    float den = dot(planeNormal, rayDirection);
    if(den == 0)
        return false;
    intersection = dot(planePoint, planeNormal) / dot(planeNormal, rayDirection);
    return true;
}

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

const uint hash_initial_seed = 2166136261u;
uint hash(uint val, uint seed = hash_initial_seed)
{
    const uint prime = 16777619u;

    for(uint i = 0u; i < 32u; i += 8u)
    {
        uint byte = (val >> i) & 0xfu;
        seed *= prime;
        seed ^= byte;
    }

    return seed;
}

float scale(uint val, uint upper = 221387u)
{
    return (val % upper) / float(upper);
}


float aaNoise(vec4 coord)
{
    return snoise(coord) * smoothstep(-2, 0, -length(fwidth(coord)));
}

float brownian(vec4 coord, uint octaves)
{
    float value = 0;
    for(uint octave = 0u; octave < octaves; ++octave)
    {
        vec4 offset = (vec4(scale(hash(2137u, hash(octave))), scale(hash(71823u, hash(octave))), scale(hash(723u, hash(octave))), scale(hash(84u, hash(octave)))) - 0.5);
        value += aaNoise((coord + offset) * (octaves + 1u)) / (octaves + 1u);
    }
    return value;
}

float multFractal(vec4 coord, uint octaves)
{
    float value = 1;
    for(uint octave = 0u; octave < octaves; ++octave)
    {
        vec4 offset = (vec4(scale(hash(1u, hash(octave))), scale(hash(2u, hash(octave))), scale(hash(3u, hash(octave))), scale(hash(4u, hash(octave)))) - 0.5);
        value *= aaNoise((coord + offset) * (octaves + 1u));
    }
    return value;
}

float surfaceBaseValue(float facing)
{
    return 1 + (facing - 0.5) * limbDarkening;
}

vec4 surface(vec2 starIntersections, vec3 normalizedRay)
{
	float time = uv_simulationtimeSeconds * simSurfaceTimeFac;
    float intersectionPoint = min(starIntersections.x, starIntersections.y);
    vec3 objectIntersectionPosition = cameraPosition + normalizedRay * intersectionPoint;
    mat3 rotation = rotationMatrix(vec3(0, 1, 0), uv_simulationtimeSeconds  * rotationSpeed);
    vec3 rotatedObjectIntersectionPosition = rotation * objectIntersectionPosition.xyz;
    vec3 normal = normalize(objectIntersectionPosition);
    float facing = max(0.0, dot(normal, -normalizedRay));

    float value = surfaceBaseValue(facing);

    float scaledPerturbationFrequency = perturbationFrequency * convectionFrequency;
    float scaledPerturbationAmount = perturbationAmount / convectionFrequency;
    vec3 perturbed = rotatedObjectIntersectionPosition;
    perturbed += vec3(snoise(vec4(scaledPerturbationFrequency * rotatedObjectIntersectionPosition, time )),
                      snoise(vec4(scaledPerturbationFrequency * (rotatedObjectIntersectionPosition + vec3(21, 1325, 13)), time + 123.4123)),
                      snoise(vec4(scaledPerturbationFrequency * (rotatedObjectIntersectionPosition + vec3(451,6134,123)), time - 32.657))) * scaledPerturbationAmount;
    perturbed *= convectionFrequency;

    // convection component
    vec4 convectionBase = vec4(perturbed, time * 10.);
    float convection = abs(multFractal(convectionBase, 2u) * 0.2);
    convection *= clamp(brownian(convectionBase * 0.1 + vec4(378.34,516.415,345.5134,614.5146), 3u) + 0.4, 0, 1);
    convection = smoothstep(0, 0.01, convection) - 0.1;
    value += convection * smoothstep(0.2, 1, facing) * convectionAmount;

    return vec4(smoothstep(0, 1, mix(starDarkestColor.rgb, compensatedStarColor.rgb, value)), 1);
}

vec4 corona(float coronaIntersection, vec3 normalizedRay)
{
	float time = uv_simulationtimeSeconds * simCoronaTimeFac;
    vec3 fromCenter = cameraPosition + coronaIntersection * normalizedRay;
    float radius = length(fromCenter);
    vec3 onSurface = fromCenter / radius * 5. ;

	float coronaScale = distance/starRadius / 2.;
	
    float rayNoise = snoise(vec4(onSurface, time * 0.05 - pow(radius, 0.24) * 1.9));
    rayNoise += (snoise(vec4(onSurface * 2, time * 0.1 - pow(radius, 0.24) * 1.9))) * 0.5;
    float distanceFromSurface = (radius - 0.1*starRadius) / coronaScale; //(radius - starRadius) / ( coronaScale); //AMG edited so that we still see corona structure interior to starRadius when cutPlane is used
    float normalizedDistanceFromSurface = distanceFromSurface / starRadius;
    float falloffValue = pow(1. / (normalizedDistanceFromSurface + 1.), coronaFalloff);
    float scaledNoise = rayNoise * 0.1 / (0.1* coronaScale);
    float value = mix(falloffValue, falloffValue + scaledNoise, smoothstep(0, 0.5, falloffValue) * (1 - smoothstep(0.5, 1, falloffValue)));
    vec3 coronaCompensated = smoothstep(0, 1, mix(vec3(0), compensatedStarColor.rgb, surfaceBaseValue(0.01)));
    return vec4(mix(vec3(0), coronaCompensated, value), pow(falloffValue, 0.8));
}

vec4 interior(float intersection, vec3 normalizedRay)
{
    vec3 pos = cameraPosition + normalizedRay * intersection;
    float radius = length(pos);
    float normalizedRadius = radius / starRadius;
    vec3 color = ColorLayerRad;
	if (normalizedRadius > RConv )
        color = ColorLayerConv;
	if (normalizedRadius < RHe )
        color = ColorLayerHe;


    return vec4(color, 1);
}
void main(void)
{
//previously calculated in vertex, but I don't think that I can pass from vertex to fragment when I have a geometry shader
	vec2 tpos = mat2(uv_projectionMatrix) * texcoord;
	rayDirection =  mat3(uv_modelViewInverseMatrix) *  (uv_projectionInverseMatrix * vec4(tpos.xy, 1., 1.0)).xyz;

	cameraPosition = (uv_modelViewInverseMatrix * vec4(0, 0, 0, 1)).xyz;
	distance = length(cameraPosition);

	float distanceFade = smoothstep(0.0, 1.0, (fadeEnd - distance) / (fadeEnd - fadeStart));
    float blackFade = 0.6 * (1 - smoothstep(distance, blackOut.x, blackOut.y));

    if(distanceFade <= 0.0) discard;
	
	
    vec3 normalizedRay = normalize(rayDirection);
    vec4 color = vec4(0, 0, 0, 1);
	
	float adjustedCutPlane = cutPlane < 1 ? (cutPlane * starRadius) : 999999999;



    vec2 starIntersections;
    if(raySphereIntersection(normalizedRay, -cameraPosition, starRadiusSquared, starIntersections)
       && all(greaterThan(starIntersections, vec2(0)))
       && ((cameraPosition + normalizedRay * min(starIntersections.x, starIntersections.y)).y < adjustedCutPlane) && drawSun == 1.)
    {
        color = surface(starIntersections, normalizedRay);
	

    }
    else
    {
        // the ray doesn't intersect the star
        float cutPlaneIntersection;
        if(rayPlaneIntersection(normalizedRay, -cameraPosition + vec3(0, adjustedCutPlane, 0), vec3(0, 1, 0), cutPlaneIntersection)
           && (cutPlaneIntersection > 0)
           && (length(cameraPosition + normalizedRay * cutPlaneIntersection) <= starRadius) && drawSun == 1.)
        {
            color = interior(cutPlaneIntersection, normalizedRay);

        }
        else
        {
            float coronaIntersection;
			adjustedCutPlane = 999999999; // always show the full corona

            if(rayCenterConeIntersection(normalizedRay, -cameraPosition, starRadius, coronaIntersection) && ((cameraPosition + normalizedRay * coronaIntersection).y < adjustedCutPlane) && drawCorona == 1.)
            {
                color = corona(coronaIntersection, normalizedRay);
            }
            else
            {
                //color = vec4(0);
				discard;
            }
        }
        color.a = max(color.a, blackFade);
    }
	
	//fragColor = vec4(compensatedStarColor.rgb, 1.);
	//color = vec4(rayDirection.xyz, 1.);
    fragColor = color;

	
    fragColor *= distanceFade * uv_fade * alpha;
	
	
}
