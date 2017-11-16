//length units are in AU

//TODO : 
//check the orientation of Solar System relative to Kepler field  (and also confirm that I have the origin correct for exoplanets)
//make Sun fade out at large cameraDistance, and also bigger when at mid range distances (OK for evolves Sun, maybe need some lower limit)
//fix Tween issue with on/off if you click again before it's finished
//check solar system orbit direction and relative positions of planets.
//labels for the different colors, and tooltips?
//make corona not leave a line over the HZ and orbit lines when very large?
//why don't exoplanets show up on mobile?, https://developers.google.com/web/tools/chrome-devtools/remote-debugging/
//can I use the alphaMap for the exoplanets (rather than taper)? Fix how it plots on top of HZ
//can I shrink the size of the textures?
//add credits for the textures
//fly to individual exoplanets and show their names

var container, scene, MWscene, MWInnerScene, camera, renderer, controls, effect;
var keyboard = new KeyboardState();

var c3 = "red"
var c2 = "blue"
var c1 = "orange"
var c4 = "purple"
var pcolors = {"Mercury":c1, "Venus":c1, "EarthMoon":c2, "Mars":c1, "Jupiter":c3, "Saturn":c3, "Uranus":c3, "Neptune":c3, "Pluto":c4}

//var JD0 = 2458060.5; //Nov. 3, 2017
var JD0 = 2447892.5; //Jan. 1, 1990

var AUfac = 206264.94195722;

var orbitLines = [];
var SunMesh;
var coronaMesh;
var HZMesh;
var MilkyWayMesh = [];
var M83mesh;
var MWInnerMesh;
var exoplanetsMesh = [];
var exopSize0 =0.5;
var exoplanetMaxSize0 = 0.1;
var exoplanetMinSize0 = 0.005;

var exopAlphaTween;
var exopAlphaTweenValue;

var SSAlphaTween;
var SSAlphaTweenValue;

var SSrotation = new THREE.Vector3(THREE.Math.degToRad(63.), 0., -Math.PI/2.); //solar system is inclined at 63 degrees to galactic plane

var maxHZa = 0.;
var SunR0;
var iLength;
var bbTex;
var M83Tex;
var ESOMWTex;

var camDist = 1.;
var camDist0 = 1.;
var camPrev = 1.;
var width0 = 1.;
var height0 = 1.;

var loaded = false;

//defined in WebGLStart, after data is loaded
var ParamsInit;
var params;


var gui = new dat.GUI();


function CameraDistance(origin = {"x":0, "y":0, "z":0}){
	return Math.sqrt( Math.pow(camera.position.x - origin.x , 2.) + Math.pow(camera.position.y - origin.y, 2.) + Math.pow(camera.position.z - origin.z, 2.));
}


//not working
function updateOrbitLines() {

	orbitLines.forEach( function( l, i ) {
		if (planetsEvol[planets[i].name + "Evol"].semi_major_axis.length > params.iEvol){
			geo = createOrbit(planetsEvol[planets[i].name + "Evol"].semi_major_axis[params.iEvol], planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), Ntheta = 100.);
			var g = new MeshLine();
			g.setGeometry( geo );
			l.geometry.verticesNeedUpdate = true;
			if (i == 2)console.log(planets[i].name, geo)

		} else {
			//will this allow me to add them back in on restart?
			l.geometry.dispose();
			scene.remove( l );
		}
	} );
	

}


function clearExoplanets() {
	exoplanetsMesh.forEach( function( e, i ) {
		e.geometry.dispose();
		scene.remove( e );

	} );
	
	exoplanetsMesh = [];
}
function clearOrbitLines() {
	orbitLines.forEach( function( l, i ) {
		l.geometry.dispose();
		scene.remove( l );
	} );
	orbitLines = [];
}
function clearSun(){
	SunMesh.geometry.dispose();
	scene.remove(SunMesh);
	coronaMesh.geometry.dispose();
	scene.remove(coronaMesh);
}
function clearHZ(){
	HZMesh.geometry.dispose();
	scene.remove(HZMesh);
}

function getUniqExoplanets(){

	var uNames = exoplanets.name.filter(function(item, pos){
	  return exoplanets.name.indexOf(item) == pos; 
	});
	console.log(uNames)

}

//check if the data is loaded
function checkloaded(){
    if (planets != null && SunEvol != null && MercuryEvol != null && VenusEvol != null && EarthMoonEvol != null && MarsEvol != null && JupiterEvol != null && SaturnEvol != null && UranusEvol != null && NeptuneEvol != null && PlutoEvol != null && HZEvol != null && exoplanets != null){
        // stop spin.js loader
        //spinner.stop();

        //show the rest of the page
        d3.select("#ContentContainer").style("visibility","visible")

        loaded = true;
        console.log("loaded")
        d3.select("#loader").style("display","none")
        //d3.select("#splashdiv5").text("Click to begin.");


    }
}

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


function createOrbit(semi, ecc, inc, lan, ap, tperi, period, Ntheta = 10.){
//in this calculation the orbit line will start at peri
//but I'd like to move that so that it starts at roughly the correct spot for the given planet at the given time
	var JDtoday = JD0 + (params.exopOrbitTimeYrs - 1990.)
	var tdiff = JDtoday - tperi;
	var phase = (tdiff % period)/period; 

	var i,j;
	var b = [-1.*inc, lan, ap];
	var c = [];
	var s = [];
	for (i=0; i<3; i++){
		c.push(Math.cos(b[i]));
		s.push(Math.sin(b[i]));

	}
	semi = semi;
	var P = [];
	P.push(-1.*c[2]*c[1] + s[2]*c[0]*s[1]);
	P.push(-1.*c[2]*s[1] - s[2]*c[0]*c[1]);
	P.push(-1.*s[2]*s[0]);
	var Q = [];
	Q.push(s[2]*c[1] + c[2]*c[0]*s[1]);
	Q.push(s[2]*s[1] - c[2]*c[0]*c[1]);
	Q.push(-1.*s[0]*c[2]);
	
	var dTheta = 2.*Math.PI / Ntheta;

	var geometry = new THREE.Geometry();
	var pos;

	var E = 0.0;
	for (i=0; i<=Ntheta; i++) {
		E = (i*dTheta + 2.*phase*Math.PI) % (2.*Math.PI);
		pos = []
		for (j=0; j<3; j++){
			pos.push(semi * (Math.cos(E) - ecc) * P[j] + semi * Math.sqrt(1.0 - ecc * ecc) * Math.sin(E) * Q[j])
		}
		geometry.vertices.push( {"x":pos[0], "y":pos[1], "z":pos[2]} );

	}

	return geometry;
}

function createCurve() {

	var s = new THREE.ConstantSpline();
	var rMin = 0;
	var rMax = 1000;
	var origin = new THREE.Vector3( Math.random()*(rMax - rMin) + rMin, Math.random()*(rMax - rMin) + rMin, Math.random()*(rMax - rMin) + rMin);

	s.inc = .001;
	s.p0 = new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() );
	s.p0.set( 0, 0, 0 );
	s.p1 = s.p0.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p2 = s.p1.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p3 = s.p2.clone().add( new THREE.Vector3( .5 - Math.random(), .5 - Math.random(), .5 - Math.random() ) );
	s.p0.multiplyScalar( rMin + Math.random() * rMax );
	s.p1.multiplyScalar( rMin + Math.random() * rMax );
	s.p2.multiplyScalar( rMin + Math.random() * rMax );
	s.p3.multiplyScalar( rMin + Math.random() * rMax );

	s.calculate();
	var geometry = new THREE.Geometry();
	s.calculateDistances();
	//s.reticulate( { distancePerStep: .1 });
	s.reticulate( { steps: 500 } );
 	var geometry = new THREE.Geometry();

	for( var j = 0; j < s.lPoints.length - 1; j++ ) {
		geometry.vertices.push( s.lPoints[ j ].clone() );
	}

	return geometry;

}

function makeLine( geo , color = 'white', rotation = null) {

	var g = new MeshLine();
	g.setGeometry( geo, function( p ) { return Math.pow(p, params.SSlineTaper); });

	var material = new MeshLineMaterial({
		color: new THREE.Color(color),
		opacity: params.SSalpha,
		//useAlphaMap: 1,
		//alphaMap: aTex,
		lineWidth: params.lineWidth,
		sizeAttenuation: 0,
		depthWrite: true,
		depthTest: true,
		transparent: true,

	}); 
	
	var mesh = new THREE.Mesh( g.geometry, material );
	mesh.geometry.dynamic = true;
	if (rotation != null){
		mesh.rotation.x = rotation.x;
		mesh.rotation.y = rotation.y;
		mesh.rotation.z = rotation.z;
	}
	scene.add( mesh );
	orbitLines.push( mesh );


}

function init() {
	// scene
	scene = new THREE.Scene();
	MWscene = new THREE.Scene();
	MWInnerScene = new THREE.Scene();

	// camera
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var fov = 45;
	var aspect = screenWidth / screenHeight;
	var zmin = 1.;
	var zmax = 5.e10;
	camera = new THREE.PerspectiveCamera( fov, aspect, zmin, zmax);
	scene.add(camera);
	MWscene.add(camera);
	MWInnerScene.add(camera);

	camera.position.set(0,0,50); //SS view

	//camera.position.set(0,0,1.8e10); //MW view

	camDist = CameraDistance();
	camDist0 = CameraDistance();
	camera.lookAt(scene.position);	

	var dist = scene.position.distanceTo(camera.position);
	var vFOV = THREE.Math.degToRad( camera.fov ); // convert vertical fov to radians
	height0 = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
	width0 = height0 * camera.aspect;           // visible width

	// renderer
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(screenWidth, screenHeight);
	container = document.getElementById('ContentContainer');
	container.appendChild( renderer.domElement );

	// events
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

	// controls
	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.minDistance = 2.;
	//controls.enableDamping = true;
	//controls.dampingFactor = params.friction;
	//controls.zoomSpeed = params.zoomSpeed;
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 2.;
	controls.maxDistance = 2.e10;

	controls.dynamicDampingFactor = params.friction;
 	controls.zoomSpeed = params.zoomSpeed;

	// light
	//var light = new THREE.PointLight(0xffffff);
	//light.position.set(100,250,100);
	//scene.add(light);

	//black body texture
	bbTex = new THREE.TextureLoader().load( "textures/bb.png" );
	bbTex.minFilter = THREE.LinearFilter;

	//M83 galaxy : https://apod.nasa.gov/apod/ap151008.html
	M83Tex = new THREE.TextureLoader().load( "textures/gendlerM83-New-HST-ESO-LL.png" );
	M83Tex.minFilter = THREE.LinearFilter;

	//ESO equirectangle MW texture: https://www.eso.org/public/usa/images/eso0932a/
	ESOMWTex = new THREE.TextureLoader().load("textures/eso0932a.jpg" );
	ESOMWTex.minFilter = THREE.LinearFilter;

	//aTex = new THREE.TextureLoader().load( "textures/alphaFade.png" );
	//aTex.minFilter = THREE.LinearFilter;

	//stereo
	effect = new THREE.StereoEffect( renderer );
	effect.setAspect(1.);
	effect.setEyeSeparation(params.stereoSep);

	renderer.autoClear = false;
	effect.autoClear = false;
	params.renderer = renderer;

	camera.up.set(0, -1, 0);

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
			planetAngle = 2.*Math.PI * ( (params.timeYrs * 365.2422)/exoplanets.period[i] % 1.)
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

	}
}

function drawOrbitLines()
{
	// line
	for (var i=0; i<planets.length; i++){
		if (planetsEvol[planets[i].name + "Evol"].semi_major_axis.length > params.iEvol){
			geo = createOrbit(planetsEvol[planets[i].name + "Evol"].semi_major_axis[params.iEvol], planets[i].eccentricity, THREE.Math.degToRad(planets[i].inclination), THREE.Math.degToRad(planets[i].longitude_of_ascending_node), THREE.Math.degToRad(planets[i].argument_of_periapsis), planets[i].tperi, planets[i].period, Ntheta = 100.);
			makeLine( geo ,  color = pcolors[planets[i].name], rotation = SSrotation);		
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

function animate(time) {
    requestAnimationFrame( animate );
	update(time);
	render();

}

function update(time){
	if ( keyboard.pressed("z") ) 
	{	  
		// do something
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
	var exopDfac = 100.; //distance from camera when we should start fading out exoplanets without known distance
	exoplanetsMesh.forEach( function(l, i){
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
	});

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

function getmaxHZa(){
	for (var i=0; i<HZEvol.aout.length; i++){
		if (maxHZa < HZEvol.aout[i]){
			maxHZa = HZEvol.aout[i];
		}
	}
}
function WebGLStart(){

    while (!loaded){
        checkloaded();
    }
	iLength = SunEvol.time.length;

	getUniqExoplanets();

	ParamsInit = function() {
		this.fullscreen = function() { THREEx.FullScreen.request() };
		this.resetCenter = function() { controls.reset(); 	camera.up.set(0, -1, 0)};
		this.renderer = null;
		this.stereo = false;
		this.friction = 0.2;
		this.zoomSpeed = 1.;
		this.stereoSep = 0.064;

//Solar System evolution controls
  		this.showSolarSystem = true;
		this.lineWidth = 0.003;
		this.SSlineTaper = 1./4.;
		this.iEvol = 0;
		this.diEvol = 0;
		this.autoUpdateSS = false;
		this.SSalpha = 1.;
		this.HZalpha = 0.2;
		this.coronaSize = 10.;
		this.coronaP = 0.3;
		this.coronaAlpha = 1.;

//exoplanet controls
  		this.showExoplanets = true;
        this.timeStepUnit = 0.;
        this.timeStepFac = 1.;
        this.timeStep = parseFloat(this.timeStepUnit)*parseFloat(this.timeStepFac);
        this.exopSize = exopSize0;
       	this.exoplanetMinSize = exoplanetMinSize0;
		this.exoplanetMaxSize = exoplanetMaxSize0;
		this.exopAlpha = 1.;
        this.exopColorMode = 1;
        this.exopMarkerMode = 1;
        this.timeYrs = 2017;
        this.exopOrbitTimeYrs = 2017;

//Galaxy controls
		this.MWalpha = 1.;
		this.M83alpha = 0.5;

        //central temperature for exagerating the colors
        this.sTeff = 5780.;

		//factor to exagerate color (set to 1 for no exageration)
        this.Teffac = 1.5;

        this.updateFriction = function() {
    		//ontrols.dampingFactor = params.friction;
    		controls.dynamicDampingFactor = params.friction;
    		controls.update();
        }
        this.updateZoom = function() {
    		controls.zoomSpeed = params.zoomSpeed;
    		controls.update();
        }

        this.updateStereo = function() {
        	if (params.stereo){
        		effect.setEyeSeparation(params.stereoSep);
        		params.renderer = effect;
        	} else {
    			renderer.setSize(window.innerWidth, window.innerHeight);
        		params.renderer = renderer;
        	}

        }
        this.updateExoplanets = function() {
			if (exopAlphaTweenValue.value == 0){
				exopAlphaTweenValue.value = 0;
				exopAlphaTween.to({"value":params.exopAlpha})
			} else {
				exopAlphaTweenValue.value = params.exopAlpha;
				exopAlphaTween.to({"value":0});
			}

			if (params.showExoplanets){
				params.exoplanetMinSize = exoplanetMinSize0*params.exopSize/exopSize0;
				params.exoplanetMaxSize = exoplanetMaxSize0*params.exopSize/exopSize0;

				exoplanetsMesh.forEach( function( e, i ) {
					//e.scale.x = params.exopSize/exopSize0;
					//e.scale.y = params.exopSize/exopSize0;
					e.material.uniforms.colorMode.value = params.exopColorMode;
					e.material.uniforms.markerMode.value = params.exopMarkerMode;

					//could probably do some tween here
					//note yrDiscovered is negative for habitable planets
					var alpha = 0;
					if (Math.abs(exoplanets.yrDiscovered[i]) <= params.timeYrs){
						alpha = 1;
					}
					e.material.uniforms.exopAlpha.value = alpha * params.exopAlpha;
					var planetAngle = -999.
					if (exoplanets.period[i] > 0){
						planetAngle = 2.*Math.PI * ( (params.exopOrbitTimeYrs * 365.2422)/exoplanets.period[i] % 1.)
					}
					e.material.uniforms.planetAngle.value = planetAngle;

				} );
			}

			params.updateSolarSystem();

        }
        this.updateExoplanetsTween = function() {
			exopAlphaTween.start();
		}

		this.updateSolarSystem = function() {
			if (SSAlphaTweenValue.value == 0){
				SSAlphaTweenValue.value = 0;
				SSAlphaTween.to({"value":params.SSalpha})
			} else {
				SSAlphaTweenValue.value = params.SSalpha;
				SSAlphaTween.to({"value":0});
			}

			if (params.showSolarSystem){

				params.iEvol = parseInt(params.iEvol);
				params.diEvol = parseInt(params.diEvol);

				clearOrbitLines();
				drawOrbitLines();
				//updateOrbitLines();

				clearHZ();
				drawHZ();
				//HZMesh.material.uniforms.ain.value = HZEvol.ain[params.iEvol];
				//HZMesh.material.uniforms.aout.value = HZEvol.aout[params.iEvol];

				clearSun();
				drawSun();
				//var scale = SunEvol.radius[params.iEvol]/SunR0;
				//SunMesh.scale.x = scale;
				//SunMesh.scale.y = scale;
				//SunMesh.scale.z = scale;
			}
		}
       this.updateSolarSystemTween = function() {
			SSAlphaTween.start();
		}

		this.updateMW = function() {
			MilkyWayMesh.forEach( function( m, i ) {
				m.material.uniforms.MWalpha.value = params.MWalpha;
			});
		}
	};
	params = new ParamsInit();
	var f0 = gui.addFolder('Camera');

	f0.add( params, 'fullscreen');
	f0.add( params, 'stereo').onChange(params.updateStereo);
	f0.add( params, 'stereoSep',0,1).onChange(params.updateStereo);
	f0.add( params, 'friction',0,1).onChange(params.updateFriction);
	f0.add( params, 'zoomSpeed',0.01,5).onChange(params.updateZoom);
	f0.add( params, 'resetCenter')

	var f1 = gui.addFolder('Solar System Evolution');
	f1.add( params, 'showSolarSystem').onChange( params.updateSolarSystemTween);
	f1.add( params, 'iEvol', 0, iLength-1).listen().onChange( params.updateSolarSystem );
	f1.add( params, 'diEvol',0, 100 ).onChange( params.updateSolarSystem );
	f1.add( params, 'lineWidth', 0, 0.01).onChange( params.updateSolarSystem );
	f1.add( params, 'SSalpha',0., 1. ).onChange( params.updateSolarSystem );
	f1.add( params, 'HZalpha',0., 1. ).onChange( params.updateSolarSystem );
	f1.add( params, 'coronaSize',0, 100 ).onChange( params.updateSolarSystem );
	f1.add( params, 'coronaP',0.1, 3 ).onChange( params.updateSolarSystem );
	f1.add( params, 'coronaAlpha',0., 1. ).onChange( params.updateSolarSystem );

	var f2 = gui.addFolder('Exoplanets');
	f2.add( params, 'showExoplanets').onChange( params.updateExoplanetsTween );
	f2.add( params, 'timeYrs', 1990, 2017).listen().onChange( params.updateExoplanets );
	f2.add( params, 'timeStepUnit', { None: 0, Hour: (1./8760.), Day: (1./365.2422), Year: 1, MillionYears: 1e6 } ).onChange( params.updateExoplanets );
	f2.add( params, 'timeStepFac', 0, 100 ).onChange( params.updateExoplanets );
	f2.add( params, 'exopSize',0.01, 2. ).onChange( params.updateExoplanets );
	f2.add( params, 'exopAlpha',0., 1. ).onChange( params.updateExoplanets );
	f2.add( params, 'exopColorMode',{ DiscoveryMethod: 1, PlanetSize: 2, HabitableZone: 3 } ).onChange( params.updateExoplanets );
	f2.add( params, 'exopMarkerMode',{ BullsEye: 1, Orrery: 2} ).onChange( params.updateExoplanets );

	var f3 = gui.addFolder('Milky Way');
	f3.add( params, 'MWalpha',0., 1. ).onChange( params.updateMW );

	planetsEvol = {MercuryEvol, VenusEvol, EarthMoonEvol, MarsEvol, JupiterEvol, SaturnEvol, UranusEvol, NeptuneEvol, PlutoEvol}


	//for easing the alpha on the exoplanets to turn them off
	exopAlphaTweenValue = {"value":params.exopAlpha};
	exopAlphaTween = new TWEEN.Tween(exopAlphaTweenValue).to({"value":0}, 1000);
	exopAlphaTween.onUpdate(function(object){
		exoplanetsMesh.forEach( function( e, i ) {
			e.material.uniforms.exopAlpha.value = object.value;
		});
	});
	exopAlphaTween.onComplete(function(object){
		if (object.value == 0){
			this.to({"value":params.exopAlpha})
		} else {
			this.to({"value":0});
		}
	});


	//for easing the alpah on the Solar System to turn them off
	SSAlphaTweenValue = {"value":params.exopAlpha};
	SSAlphaTween = new TWEEN.Tween(SSAlphaTweenValue).to({"value":0}, 1000);
	SSAlphaTween.onUpdate(function(object){
		orbitLines.forEach( function( l, i ) {
			l.material.uniforms.opacity.value = object.value;
		} );
		SunMesh.material.uniforms.SSalpha.value = object.value;
		coronaMesh.material.uniforms.SSalpha.value = object.value;
		HZMesh.material.uniforms.SSalpha.value = object.value;

	});
	SSAlphaTween.onComplete(function(object){
		if (object.value == 0){
			this.to({"value":params.SSalpha})
		} else {
			this.to({"value":0});
		}
	});


	SunR0 = SunEvol.radius[0];
	getmaxHZa();

//initialize
	init();

//draw everything
	drawInnerMilkyWay();
	drawMilkyWay();
	drawOrbitLines();
	drawHZ();
	drawSun();
	drawExoplanets();


//begin the animation
	animate();

}

