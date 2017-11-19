function setMaxTime(){
	SunEvol.time.forEach( function(d){
		if (d > maxTime){
			maxTime = d -1.;
		}
	});
}
function clearSun(){
	SunMesh.geometry.dispose();
	scene.remove(SunMesh);
	coronaMesh.geometry.dispose();
	scene.remove(coronaMesh);
}

function initSunInterps(){
	SunEvol.RadInterp = new THREE.LinearInterpolant(
		new Float32Array(SunEvol.time),
		new Float32Array(SunEvol.radius),
		1,
		new Float32Array( 1 )
	);

	SunEvol.TeffInterp = new THREE.LinearInterpolant(
		new Float32Array(SunEvol.time),
		new Float32Array(SunEvol.Teff),
		1,
		new Float32Array( 1 )
	);

	var foo = [];
	for (var i = 1; i <= SunEvol.time.length; i++) {
   		foo.push(i);
	}
	SunEvol.iEvolInterp = new THREE.LinearInterpolant(
		new Float32Array(SunEvol.time),
		new Float32Array(foo),
		1,
		new Float32Array( 1 )
	);

	SunEvol.timeInterp = new THREE.LinearInterpolant(
		new Float32Array(foo),
		new Float32Array(SunEvol.time),
		1,
		new Float32Array( 1 )
	);

}


function drawSun()
{
	var SunRad = SunEvol.RadInterp.evaluate(params.futureMillionYrs)
	var SunTeff = SunEvol.TeffInterp.evaluate(params.futureMillionYrs)
	SuniEvol = SunEvol.iEvolInterp.evaluate(params.futureMillionYrs)

	var ifac = 1000.*params.futureMillionYrs/maxTime % 2;
	// sphere	
	var geometry = new THREE.SphereGeometry( SunRad, 32, 32 );
	var SunMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			radius: { value: SunRad },
			uTime: { value: ifac },
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunTeff},
			sTeff: {value: params.sTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.useSSalpha },
			cameraCenter: {value: camera.position},
		},

		vertexShader: SunVertexShader,
		fragmentShader: SunFragmentShader,
		depthWrite:true,
		depthTest: true,
		transparent:true,
		alphaTest: true,
	} );

	//var material = new THREE.MeshBasicMaterial( { color: 'yellow'});
	//var material = new THREE.MeshLambertMaterial( { color: 'yellow' } );
	var mesh = new THREE.Mesh( geometry, SunMaterial );
	mesh.position.set(0,0,0);
	scene.add(mesh);

	SunMesh = mesh;
	var geometry = new THREE.PlaneGeometry(width0, height0);

	var coronaMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			Rout: { value: params.coronaSize * SunRad },
			uTime: { value: ifac },
			cfac: {value: params.coronaP},
			calpha: {value: params.coronaAlpha},
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunTeff},
			sTeff: {value: params.sTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.useSSalpha },


		},

		vertexShader: myVertexShader,
		fragmentShader: coronaFragmentShader,
		depthWrite:true,
		depthTest: true,
		side: THREE.DoubleSide, 
		transparent:true,
		alphaTest: true,
	} );

	var mesh = new THREE.Mesh( geometry, coronaMaterial );
	mesh.position.set(0,0,0);
	mesh.lookAt( camera.position )
	scene.add(mesh);

	coronaMesh = mesh;


}