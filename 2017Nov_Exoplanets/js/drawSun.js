function clearSun(){
	SunMesh.geometry.dispose();
	scene.remove(SunMesh);
	coronaMesh.geometry.dispose();
	scene.remove(coronaMesh);
}

function drawSun()
{
	// sphere	
	var geometry = new THREE.SphereGeometry( SunEvol.radius[params.iEvol], 32, 32 );
	var SunMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			radius: { value: SunEvol.radius[params.iEvol] },
			uTime: { value: params.iEvol/iLength },
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunEvol.Teff[params.iEvol]},
			sTeff: {value: params.sTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.SSalpha },
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
	//var geometry = new THREE.PlaneGeometry( params.coronaSize * 4.*SunEvol.radius[params.iEvol], params.coronaSize * 4.*SunEvol.radius[params.iEvol]);
	var geometry = new THREE.PlaneGeometry(width0, height0);

	var coronaMaterial =  new THREE.ShaderMaterial( {
		uniforms: {
			Rout: { value: params.coronaSize * SunEvol.radius[params.iEvol] },
			uTime: { value: params.iEvol/iLength },
			cfac: {value: params.coronaP},
			calpha: {value: params.coronaAlpha},
			bb: { type: "t", value: bbTex},
			sunTemp: {value: SunEvol.Teff[params.iEvol]},
			sTeff: {value: params.sTeff},
			Teffac: {value: params.Teffac},
			SSalpha: {value: params.SSalpha },


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