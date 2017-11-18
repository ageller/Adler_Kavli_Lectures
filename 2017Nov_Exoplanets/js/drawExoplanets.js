
function clearExoplanets() {
	exoplanetsMesh.forEach( function( e, i ) {
		e.geometry.dispose();
		scene.remove( e );

	} );
	
	exoplanetsMesh = [];
}


function getUniqExoplanets(){

	var uNames = exoplanets.name.filter(function(item, pos){
	  return exoplanets.name.indexOf(item) == pos; 
	});

	uPos = [];
	uNames.forEach(function(item,pos){
		var i = exoplanets.name.indexOf(item)
		uPos.push(new THREE.Vector3(exoplanets.x[i]*AUfac, exoplanets.y[i]*AUfac, exoplanets.z[i]*AUfac))
	})
	uExoplanets = {"name":uNames, "position":uPos};
}

function drawExoplanets()
{
//the exoplanet data has distances in parsecs, but the solar system has distances in AU

	var ringTot, ringNum, lScale, gSize, planetAngle;

	for (var i=0; i<exoplanets.x.length; i++){

//Mark had to combine to numbers a separate at the decimal because of the limitations in Uniview.  I'm using his same input for now, so I will do the same here.
//if there is no distance known, the ringInfo will be negative
		ringTot = parseInt(Math.floor(Math.abs(exoplanets.ringInfo[i])));
		ringNum = parseInt(Math.round(100.*(Math.abs(exoplanets.ringInfo[i]) - ringTot)));
		lScale = Math.min(8.0, (1.0 + 0.6*ringTot));

		//console.log(ringTot, ringNum, exoplanets.ringInfo[i], lScale)

	 	gSize = AUfac*params.exopSize * lScale; 
		var geometry = new THREE.PlaneGeometry(gSize*2., gSize*2.);
		//var geometry = new THREE.PlaneGeometry(params.exopSize*8.*AUfac, params.exopSize*8.*AUfac);

		planetAngle = -999.
		if (exoplanets.period[i] > 0){
			planetAngle = 2.*Math.PI * ( (params.futureMillionYrs * 1.e6 * 365.2422)/exoplanets.period[i] % 1.)
		}
		var exopMaterial =  new THREE.ShaderMaterial( {
			uniforms: {
				exopAlpha: {value: params.exopAlpha},
				method: {value: exoplanets.method[i]},
				mClass: {value: exoplanets.class[i]},
				ringTot: {value: ringTot},
				ringNum: {value: ringNum},
				size: {value: gSize},
				colorMode: {value: params.exopColorMode},
				markerMode: {value: params.exopMarkerMode},
				afac: {value: exoplanets.afac[i]},
				planetAngle: {value: planetAngle},
				habitable: {value: -Math.sign(exoplanets.yrDiscovered[i])},

			},

			vertexShader: myVertexShader,
			fragmentShader: exoplanetFragmentShader,
			depthWrite:false,
			depthTest: false,
			side: THREE.DoubleSide, 
			transparent:true,
			alphaTest: true,
		} );

		var mesh = new THREE.Mesh( geometry, exopMaterial );
		mesh.position.set(exoplanets.x[i]*AUfac, exoplanets.y[i]*AUfac, exoplanets.z[i]*AUfac);
		mesh.lookAt( camera.position )
		scene.add(mesh);


		//console.log(mesh.position)
		exoplanetsMesh.push(mesh);

		//save the initial matrices for Tweening later
		exoplanetsMatrix.push(mesh.matrix);
	}
}
