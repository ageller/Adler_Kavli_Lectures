//length units are in AU

//TODO : 
//check the orientation of Solar System relative to Kepler field  (and also confirm that I have the origin correct for exoplanets)
//make Sun fade out at large cameraDistance, and also bigger when at mid range distances (OK for evolves Sun, maybe need some lower limit)
//check solar system orbit direction and relative positions of planets.
//labels for the different colors, and tooltips?
//make corona not leave a line over the HZ and orbit lines when very large?
//why don't exoplanets show up on mobile?, https://developers.google.com/web/tools/chrome-devtools/remote-debugging/
//can I use the alphaMap for the exoplanets (rather than taper)? Fix how it plots on top of HZ
//can I shrink the size of the textures?
//add credits for the textures
//fly to individual exoplanets and show their names
//improve the Galaxy -- and how it matches to the image
//loading screen (including waiting for textures to load)
//fog for exoplanets?

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
	params.timeStep = parseFloat(params.timeStepUnit)*parseFloat(params.timeStepFac);
	params.timeYrs = parseFloat(params.timeYrs);
	if (params.timeStep > 0){
		params.timeYrs += params.timeStep;
		params.timeYrs = Math.min(params.timeYrs, 2017.);
		params.exopOrbitTimeYrs += params.timeStep;
		params.updateExoplanets();
	}


	//for updating the solar system (will need to improve this)
	params.autoUpdateSS = false;
	if (params.diEvol >0 && params.iEvol < (iLength-1)){
		params.autoUpdateSS = true;
	} 

	if (params.autoUpdateSS){
		params.updateSolarSystem();
		
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
			if (exoplanets.name[i] != params.GoToExoplanet){
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

	
	var MWDfac = 1.e9; //distance from camera when we should start fading in/out Milky Way
	var MWalpha = Math.min(params.MWalpha, Math.max(0., (1. - MWDfac/camDist)));
	MilkyWayMesh.forEach( function( m, i ) {
		m.material.uniforms.MWalpha.value = MWalpha;
	});	
	MWInnerMesh.material.opacity = Math.min(params.MWalpha, Math.max(0., 0.5*MWDfac/camDist));;

	//render the scene (with the Milky Way always in the back)
	if (params.renderer != effect) params.renderer.clear();
	params.renderer.render( MWInnerScene, camera );
	params.renderer.render( MWscene, camera );
	if (params.renderer != effect) params.renderer.clearDepth();
	params.renderer.render( scene, camera );


	//for updating the solar system (will need to improve this)
	if (params.iEvol+params.diEvol < iLength){
		params.iEvol += params.diEvol;
	} else {
		params.iEvol = iLength - 1;
		params.autoUpdateSS = false;
	}


}
