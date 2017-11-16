var exoplanetFragmentShader = `

precision mediump float;

varying vec3 vPosition;

uniform int method;
uniform int mClass;
uniform int colorMode;
uniform int markerMode;

uniform float ringNum;
uniform float ringTot;
uniform float size;
uniform float afac;
uniform float planetAngle;
uniform float exopAlpha;
uniform int habitable;

void main()
{
	vec4 markerColor = vec4(0);

	float planetSize = 0.5;

    vec2 fromCenter = abs(vPosition.xy);
    float dist = length(fromCenter);

	if (colorMode == 1){
		if (method == 0){ //N/A
			markerColor = vec4(0.5,0.5,0.5,1.0);
		}
		if (method == 1){//Imaging
			markerColor = vec4(0,1,0,1.0);
		}
		if (method == 2){//Microlens
			markerColor = vec4(0.2,0.2,1.0,1.0);
		}
		if (method == 3){//timing
			markerColor = vec4(1.0,0.5,0.0,1.0);
		}
		if (method == 4){//Transit
			markerColor = vec4(1.0,1.0,0.0,1.0);
		}
		if (method == 5){//RV
			markerColor = vec4(1.0,0.2,1.0,1.0);
		}
	}
	if (colorMode == 2){
		if (mClass == 0){ //smaller
			markerColor=vec4(1.0,0.2,1.0,1);
			planetSize=0.5;
		}
		if (mClass == 1){//Earth sized
			markerColor=vec4(0.2,0.2,1.0,1);
			planetSize=1.0;
		}
		if (mClass == 2){//Super Earth sized
			markerColor=vec4(0.0,1.0,0.0,1);
			planetSize=1.5;
		}
		if (mClass == 3){//Neptune Sized
			markerColor=vec4(1.0,1.0,0.2,1);
			planetSize=2.0;
		}
		if (mClass == 4){//Jupiter Sized
			markerColor=vec4(1.0,0.5,0.0,1);
			planetSize=3.0;
		}
		if (mClass == 5){//larger
			markerColor=vec4(0.5,0.5,0.5,1);
			planetSize=4.0;
		}
	}
	if (colorMode == 3){ //habitable zone
		if (habitable == 1) {
			markerColor=vec4(0.2,0.2,1,1);
			planetSize=1.0;
		} else {
			markerColor=vec4(0.5);
		}
	}


	float r = dist/size;

	if (markerMode == 1){ //bullseye
		float ulim = 0.5 * (0.6 * ringNum + 1.0);
		float llim = ulim - 0.2;
		ulim /= (0.6 * ringTot + 0.4);
		llim /= (0.6 * ringTot + 0.4);
		if (r < llim || r > ulim) {
			discard;
		}
	}
	if (markerMode == 2){ //orrery
		float drawStart = 0.35;
		float drawWidth = 0.01;//0.03;
		float dS = drawStart*afac ;
		vec4 color = vec4(vec3(0.5),0.0);
		if (r < (dS+drawWidth) && r > (dS-drawWidth)){
			color.a = 1.;
		}
		//if (r > dS && r < (dS+drawWidth)){
		//	color.a = smoothstep(dS+drawWidth, dS, r);
		//}
		//if (r > (dS-drawWidth) && r < dS){
		//	color.a = smoothstep(dS-drawWidth, dS,r );
		//}
		if (planetAngle > 0.){
			vec2 planetPos = drawStart * afac * vec2(cos(planetAngle), sin(planetAngle));
			if (length(vPosition.xy/size - planetPos) < 0.05*planetSize) {
				color = markerColor;
			}
		}
		markerColor = color;

	}

    gl_FragColor = markerColor;
    gl_FragColor.a *= exopAlpha;
    
}
`;