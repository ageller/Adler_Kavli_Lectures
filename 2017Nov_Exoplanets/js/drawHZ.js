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

function drawHZ(rotation = SSrotation)
{
	var geometry = new THREE.PlaneGeometry( 2.*maxHZa, 2.*maxHZa);

	var material = new THREE.ShaderMaterial( {
		uniforms: {
			ain: { value: HZEvol.ain[params.iEvol] },
			aout: { value: HZEvol.aout[params.iEvol] },
			color: {value: new THREE.Vector4(0., 1., 0., params.HZalpha) },
			SSalpha: {value: params.SSalpha }

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
