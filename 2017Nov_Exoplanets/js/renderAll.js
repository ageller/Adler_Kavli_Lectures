//length units are in AU

//TODO : 
//check the orientation of Solar System relative to Kepler field  (and also confirm that I have the origin correct for exoplanets)
//make Sun fade out at large cameraDistance, and also bigger when at mid range distances (OK for evolves Sun, maybe need some lower limit)
//check solar system orbit direction and relative positions of planets.
//labels for the different colors, and tooltips?
//make corona not leave a line over the HZ and orbit lines when very large?
//why don't exoplanets show up on mobile?, https://developers.google.com/web/tools/chrome-devtools/remote-debugging/
//can I use the alphaMap for the exoplanets (rather than taper)? Fix how it plots on top of HZ
//can I shrink the file size of the textures?
//add credits for the textures
//improve the Galaxy -- and how it matches to the image
//loading screen (including waiting for textures to load)
//fog for exoplanets?
//fix on/off for Galaxy and exoplanets with Myr timescales?
//fix the "blink" of the centered exoplanet when you switch to a new exoplanet

function animate(time) {
	requestAnimationFrame( animate );
	update(time);
	render();

	//console.log(camera.position, camera.rotation);
}

function update(time){
	keyboard.update();
	if ( keyboard.down("C") ) 
	{	  
		console.log(camera.position, camera.rotation)
	}
	
	controls.update();
	TWEEN.update(time);
	SunMesh.material.uniforms.cameraCenter.value = camera.position;
}

function updateBillboards(){
	coronaMesh.lookAt(camera.position);
	exoplanetsMesh.forEach( function( e, i ) {
		e.lookAt(camera.position);
	} );
}

function render() {
	//console.log(SunEvol.time[iEvol], SunEvol.radius[iEvol])
	camPrev = camDist;
	camDist = CameraDistance();

	//for updating the exoplanets
	if (parseFloat(params.pastYrs) < 2017){
		params.futureMillionYrs = 0.
	}
	params.timeStep = parseFloat(params.timeStepUnit)*parseFloat(params.timeStepFac);
	params.pastYrs = Math.min(parseFloat(params.pastYrs) + parseFloat(params.futureMillionYrs)*1.e6, 2017);
	if (params.timeStep > 0){
		params.pastYrs += params.timeStep;
		params.pastYrs = Math.min(params.pastYrs, 2017.);
		params.futureMillionYrs += (params.timeStep/1.e6);
		params.futureMillionYrs = Math.min(params.futureMillionYrs, maxTime)
		params.updateSSExop();
	}
	if (params.timeStep < 0){ //equal mass loss steps
		params.iEvol = THREE.Math.clamp(parseFloat(SuniEvol) + parseFloat(params.timeStepFac), 0, iLength-1);
		params.futureMillionYrs = SunEvol.timeInterp.evaluate(params.iEvol);
		params.futureMillionYrs = Math.min(params.futureMillionYrs, maxTime);
		params.updateSSExop();

	}



	//update the thickness of the orbit lines based on the camera position
	//orbitLines.forEach( function( l, i ) {
	//	l.material.uniforms.lineWidth.value = Math.min(camDist * lineWidthfac, 1000);
	//});

	//make sure that the billboards are always looking at the camera
	updateBillboards();

	//update the corona/glow size based on the camera position
    var dist,vFoc,height,width;
	if (camDist  > 50.){
     // visible width
		dist = SunMesh.position.distanceTo(camera.position);
		vFOV = THREE.Math.degToRad( camera.fov ); // convert vertical fov to radians
		height = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
		width = height * camera.aspect;  
		coronaMesh.scale.x = width/width0;
		coronaMesh.scale.y = height/height0;
		//coronaMesh.scale.z = cScale;



	}


	//I want to set a minimum and maximum size for the exoplanets
	if (exoplanetsON && !exoplanetsInTweening){
		exoplanetsMesh.forEach( function(l, i){
			if (exoplanets.name[i] != params.GoToExoplanet && Math.abs(exoplanets.yrDiscovered[i]) <= params.pastYrs){
		
				dist = l.position.distanceTo(camera.position);
				vFOV = THREE.Math.degToRad( camera.fov ); // convert vertical fov to radians
				height = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
				width = height * camera.aspect; 
				if (l.material.uniforms.size.value/width < params.exoplanetMinSize){
					l.scale.x = params.exoplanetMinSize * width / l.material.uniforms.size.value;
					l.scale.y = params.exoplanetMinSize * width / l.material.uniforms.size.value;
					//l.material.uniforms.size.value = exoplanetMinSize * width;

				} 	
				if (l.material.uniforms.size.value/width > params.exoplanetMaxSize){
					l.scale.x = params.exoplanetMaxSize * width / l.material.uniforms.size.value;
					l.scale.y = params.exoplanetMaxSize * width / l.material.uniforms.size.value;
					//l.material.uniforms.size.value = exoplanetMinSize * width;
				} 	
				//also if we pull far enough away from the Sun, fade out planets without known distances
				//if there is no distance known, the ringInfo will be negative
				if (Math.sign(exoplanets.ringInfo[i]) < 0){
					l.material.uniforms.exopAlpha.value = Math.min(params.exopAlpha, exopDfac/camDist);
				}

				//if (i == 0){
				//	console.log(dist, width, l.material.uniforms.size.value/width)
				//}
				//l.scale.x =  escalefac;
				//l.scale.y =  escalefac;
			}
		});
	}

	if (MilkyWayON && !MWInTweening){
		var MWalpha = Math.min(params.MWalpha, Math.max(0., (1. - MWDfac/camDist)));
		MilkyWayMesh.forEach( function( m, i ) {
			m.material.uniforms.MWalpha.value = MWalpha;
		});	
		MWInnerMesh.material.opacity = Math.min(params.MWalpha, Math.max(0., 0.5*MWDfac/camDist));
	}

	//render the scene (with the Milky Way always in the back)
	if (params.renderer != effect) params.renderer.clear();
	params.renderer.render( MWInnerScene, camera );
	params.renderer.render( MWscene, camera );
	if (params.renderer != effect) params.renderer.clearDepth();
	params.renderer.render( scene, camera );




}
