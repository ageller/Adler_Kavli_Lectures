function createDisk(Npoints, radius, scaleHeight){
	var disk = new THREE.Geometry();

	var vert, t, r, x, y, z;
	for (i = 0; i <= Npoints; i++) {
		t = 2*Math.PI*Math.random();
		r = Math.random() + Math.random();
		if (r > 1){
			r = 2. - r;
		}

		x = r * Math.cos(t) * radius;
		y = r * Math.sin(t) * radius;
		z = (Math.random() - 0.5) * scaleHeight;

		disk.vertices.push(new THREE.Vector3(x, y, z));
	}
	return disk;
}

function createSpiralGalaxy(arms, starsPerArm, radius, scaleHeight, armThickness, N, B, Nbar = -1, radmax = 1.){
	var galaxy = new THREE.Geometry();

	var armAngle = 270 / arms;

	var vert, x, y, z, angle;

//http://adsabs.harvard.edu/abs/2009MNRAS.397..164R
	for (i = 0; i <= starsPerArm; i++) {
		
		angle = (i+1) / starsPerArm * 2.*Math.PI;
		r = radius/Math.log(B * Math.tan(angle/(2.*N)));
		if (Math.abs(r) < radmax){
			x = r * Math.cos(angle) + Math.random() * armThickness;
			y = r * Math.sin(angle) + Math.random() * armThickness;
			z = (Math.random() - 0.5) * scaleHeight;

			galaxy.vertices.push(new THREE.Vector3(x, y, z));

			x = -r * Math.cos(angle) + Math.random() * armThickness;
			y = -r * Math.sin(angle) + Math.random() * armThickness;
			z = -1.*((Math.random() - 0.5) * scaleHeight);

			galaxy.vertices.push(new THREE.Vector3(x, y, z));
		}
	}

//connect the bar
	var smallAngle = 1./Math.abs(starsPerArm) * 2.*Math.PI;
	var smallR = radius/Math.log(B * Math.tan(smallAngle/(2.*N)));
	if (Nbar < 0) Nbar = starsPerArm * Math.abs(smallR)/radius;
	for (i=0; i< Nbar; i++){

		r = smallR * (2.*i/Nbar - 1.);
		x = r + Math.random() * armThickness;
		y = Math.random() * armThickness;
		z = (Math.random() - 0.5) * scaleHeight;

		galaxy.vertices.push(new THREE.Vector3(x, y, z));

	}

	return galaxy;
}




function drawMilkyWay()
{

	var scaleUp = AUfac*3e4; //milky way radius in pc converted to AU
	var center = new THREE.Vector3(8500.*AUfac, 0., 0.);
	//var center = new THREE.Vector3(0., 0., 0.);

	var radius = 0.5;
	var scaleHeight = 0.1;
	var N = 15.; //winding tightness
	var B = 3.; //bulge-to-arm size
	var fac3 = 20.;

	var barRad = 2.*radius; //to make the inner part more yellow

	var Ssize = 0.5; //size of star points
	var dfac = 4; //descrease in size of star points with distance from center (to help make bulge brighter)

	//blue disk
/*	var disk = createDisk(500, 1.8*radius, scaleHeight);
	var sized = 20.*scaleUp;
	var diskMaterial = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4( 0.2,  0.2,  0.4, 0.04)},
			size: {value: sized},
			dfac: {value: 0},
			radius: {value: 0},
			MWalpha: {value: params.MWalpha },
		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		//blending:THREE.AdditiveBlending,
	} );
	var meshd = new THREE.Points(disk, diskMaterial);
	meshd.position.set(center.x, center.y, center.z);
*/
	//bar
/*	var bar = createSpiralGalaxy(2, -100., radius, scaleHeight, 0.15, N, B, Nbar = 10); //yellow
	var sizeb = 20.*scaleUp;
	var barMaterial = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4( 0.3,  0.3,  0.0, 0.3)},
			size: {value: sizeb},
			radius: {value: 0.},
			dfac: {value: 0},
			MWalpha: {value: params.MWalpha },

		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,
	} );
	var meshb = new THREE.Points(bar, barMaterial);
	meshb.position.set(center.x, center.y, center.z);
*/

	//general blue background
/*	var galaxy0= createSpiralGalaxy(2, 1000, radius, scaleHeight, 0.5, N, B, Nbar = -1., radmax=1.5); //blue
	var size0 = 3.*scaleUp;
	var galaxy0Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4( 0.2,  0.2,  0.4, 0.1)},
			size: {value: size0},
			dfac: {value: 0.},
			radius: {value: 0.},
			MWalpha: {value: params.MWalpha },

		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,
	} );
	var mesh0 = new THREE.Points(galaxy0, galaxy0Material);
	mesh0.position.set(center.x, center.y, center.z);
*/

	var galaxy1 = createSpiralGalaxy(2, 1000, radius, scaleHeight, 0.5, N*fac3, B*fac3, Nbar = -1., radmax=4.); //blue
	var size1 = 3.*scaleUp;
	var galaxy1Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4( 0.2,  0.2,  0.4, 0.1)},
			size: {value: size1},
			dfac: {value: 0.},
			radius: {value: 0.},
			MWalpha: {value: params.MWalpha },

		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,
	} );
	var mesh1 = new THREE.Points(galaxy1, galaxy1Material);
	mesh1.position.set(center.x, center.y, center.z);

	//red star forming regions
/*	var galaxy2 = createSpiralGalaxy(4, 100, radius, scaleHeight, 0.15, N, B,  Nbar = 50); //red
	var size2 = Ssize*scaleUp;
	var galaxy2Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4(1., 0.3, 0.3, 0.5)},
			dfac: {value: dfac},
			size: {value: size2},
			radius: {value: 0},
			MWalpha: {value: params.MWalpha },
		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,

	} );
	var mesh2 = new THREE.Points(galaxy2, galaxy2Material);
	mesh2.position.set(center.x, center.y, center.z);

	//red star forming regions, for the second set of arms
	var galaxy3 = createSpiralGalaxy(4, 75, radius, scaleHeight, 0.15, N*fac3*0.6, B*fac3*0.9, Nbar = 50); //red
	var size3 = Ssize*scaleUp;
	var galaxy3Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4(1., 0.3, 0.3, 0.5)},
			dfac: {value: dfac},
			size: {value: size3},
			radius: {value: 0.},
			MWalpha: {value: params.MWalpha },
		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,

	} );
	var mesh3 = new THREE.Points(galaxy3, galaxy3Material);
	mesh3.position.set(center.x, center.y, center.z);
*/
	//white stars
	var galaxy4 = createSpiralGalaxy(4, 75, radius, scaleHeight, 0.15, N, B, Nbar = 50); //red
	var size4 = Ssize*scaleUp;
	var galaxy4Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4(1., 1., 1., 0.5)},
			dfac: {value: dfac},
			size: {value: size4},
			radius: {value: 0.},
			MWalpha: {value: params.MWalpha },
		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,

	} );
	var mesh4 = new THREE.Points(galaxy4, galaxy4Material);
	mesh4.position.set(center.x, center.y, center.z);

	//white stars
	var galaxy5 = createSpiralGalaxy(4, 75, radius, scaleHeight, 0.15, N*fac3*0.6, B*fac3*0.9,  Nbar = 50); //red
	var size5 = Ssize*scaleUp;
	var galaxy4Material = new THREE.ShaderMaterial( { 
		uniforms: {
			color: {value: new THREE.Vector4(1., 1., 1., 0.5)},
			dfac: {value: dfac},
			size: {value: size4},
			radius: {value: 0.},
			MWalpha: {value: params.MWalpha },

		},

		vertexShader: MWVertexShader,
		fragmentShader: MWFragmentShader,
		depthWrite:false,
		depthTest: false,
		transparent:true,
		alphaTest: false,
		blending:THREE.AdditiveBlending,

	} );
	var mesh5 = new THREE.Points(galaxy5, galaxy4Material);
	mesh5.position.set(center.x, center.y, center.z);

	//M83 in the background
	var geometry = new THREE.PlaneGeometry(1., 1.);
	var M83Material =  new THREE.ShaderMaterial( {
		uniforms: {
			tex: { type: "t", value: M83Tex},
			MWalpha: {value: params.MWalpha },
			M83alpha: {value: params.M83alpha },

		},

		vertexShader: myVertexShader,
		fragmentShader: M83FragmentShader,
		depthWrite:false,
		depthTest: false,
		side: THREE.DoubleSide, 
		transparent:true,
		alphaTest: false,

	} );
	M83mesh = new THREE.Mesh( geometry, M83Material );
	M83mesh.position.set(center.x, center.y, center.z);


	//MilkyWayMesh.push(meshd);
	//MilkyWayMesh.push(meshb);
	//MilkyWayMesh.push(mesh0);
	MilkyWayMesh.push(mesh1);
	//MilkyWayMesh.push(mesh2);
	//MilkyWayMesh.push(mesh3);
	MilkyWayMesh.push(mesh4);
	MilkyWayMesh.push(mesh5);
	MilkyWayMesh.push(M83mesh);

	var m83fac = 4.;
	MilkyWayMesh.forEach( function( m, i ) {
		MWscene.add(m)
		m.scale.set(scaleUp, scaleUp, scaleUp);
		if (i == (MilkyWayMesh.length - 1)){
			m.scale.set(m83fac*scaleUp, m83fac*scaleUp, m83fac*scaleUp);
		} 
	});


}

function drawInnerMilkyWay()
{

	var geometry = new THREE.SphereBufferGeometry( 1e10, 60, 40 );
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry.scale( - 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( {
		map: ESOMWTex,
		transparent: true,
	} );
	MWInnerMesh = new THREE.Mesh( geometry, material );
	MWInnerMesh.rotation.x = Math.PI / 2;
	MWInnerMesh.rotation.y = Math.PI ;

	MWInnerScene.add(MWInnerMesh)
}

