function clearHZ(){
	HZMesh.geometry.dispose();
	scene.remove(HZMesh);
}


function getmaxHZa(){
	for (var i=0; i<HZEvol.aout.length; i++){
		if (maxHZa < HZEvol.aout[i]){
			maxHZa = HZEvol.aout[i];
		}
	}
}

function initHZInterps(){
	HZEvol.ainInterp = new THREE.LinearInterpolant(
		new Float32Array(HZEvol.time),
		new Float32Array(HZEvol.ain),
		1,
		new Float32Array( 1 )
	);

	HZEvol.aoutInterp = new THREE.LinearInterpolant(
		new Float32Array(HZEvol.time),
		new Float32Array(HZEvol.aout),
		1,
		new Float32Array( 1 )
	);
}

function drawHZ(rotation = SSrotation)
{
	var geometry = new THREE.PlaneGeometry( 2.*maxHZa, 2.*maxHZa);

	var ain = HZEvol.ainInterp.evaluate(params.futureMillionYrs);
	var aout = HZEvol.aoutInterp.evaluate(params.futureMillionYrs);

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			ain: { value: ain },
			aout: { value: aout },
			color: {value: new THREE.Vector4(0., 1., 0., params.HZalpha) },
			SSalpha: {value: params.useSSalpha }

		},

		vertexShader: myVertexShader,
		fragmentShader: HZFragmentShader,
		transparent:true, 
		depthWrite:true,
		alphaTest: true,
		side: THREE.DoubleSide, 

	} );


	var mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,0,0);
	mesh.rotation.x = rotation.x;
	mesh.rotation.y = rotation.y;
	mesh.rotation.z = rotation.z;
	scene.add(mesh);
	HZMesh = mesh;
}
