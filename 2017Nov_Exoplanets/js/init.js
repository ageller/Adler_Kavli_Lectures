//all global variables

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
var SuniEvol = 0;
var HZMesh;
var MilkyWayMesh = [];
var MWTexmesh;
var MWInnerMesh;
var exoplanetsMesh = [];
var exoplanetsMatrix = [];
var exopSize0 =0.5;
var exoplanetMaxSize0 = 0.1;
var exoplanetMinSize0 = 0.005;
var exopDfac = 100.; //distance from camera when we should start fading out exoplanets without known distance
var uExoplanets;
var redoExoplanetsTween = false;

var SSrotation = new THREE.Vector3(THREE.Math.degToRad(63.), 0., -Math.PI/2.); //solar system is inclined at 63 degrees to galactic plane

var maxHZa = 0.;
var maxTime = 0.;
var SunR0;
var iLength;
var bbTex;
var MWTex;
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

var gui = null;
var basicGUI = null;
var legendGUI = null;

//for tweens
var exoplanetsON = true;
var exoplanetsOFFtime = false;
var exoplanetsInTweening = false;
var exoplanetsInMotion = false;
var exoplanetSelected = false;
var exopAlphaTween;
var exopAlphaTweenValue;
var runningExopDiscYrs = false;

var SolarSystemON = true;
var SolarSystemInTweening = false;
var SSValsNeedReset = false;
var SSAlphaTween;
var SSAlphaTweenValue;
var runningFutureSS = false;

var MilkyWayON = true;
var MWOFFtime = false;
var MWInTweening = false;
var MWAlphaTween;
var MWAlphaTweenValue;
var MWDfac = 1.e9; //distance from camera when we should start fading in/out Milky Way

var MWTarget = new THREE.Vector3(0, 0, 5e9);
var SSTarget = new THREE.Vector3(5.265142493522873, -66.50796619594568, 35.073211063757014);
var KeplerTarget = new THREE.Vector3(-0.4353924795879783,-1.8888682349737307,-0.4925547478458271);
var KeplerFlyTarget1 = new THREE.Vector3(-214968720.69758728, -932601301.1355674, -243191770.28334737);
var KeplerFlyTarget2 = new THREE.Vector3(148173166.3244664, 525173139.3285601, 129715090.18351127);
var MilkyWayViewTween;
var SolarSystemViewTween;
var KeplerViewTween;
var exoplanetViewTween;
var exoplanetViewTweenOut;
var exoplanetViewTweenIn;
var exoplanetTarget;
var KeplerFlyThroughTween;
var inSSEvolTween = false;

var SunEvol = null;
var MercuryEvol = null;
var VenusEvol = null;
var EarthMoonEvol = null;
var MarsEvol = null;
var JupiterEvol = null;
var SaturnEvol = null;
var NeptuneEvol = null;
var UranusEvol = null;
var PlutoEvol = null;
var HZEvol = null;
var exoplanets = null;
var planets = null;

var showExoplanetGUI = false;
var showSolarSystemEvolGUI = false;

var splashMessage = true;
var instructionIndex = 1;

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
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.minDistance = 2.;
	controls.maxDistance = 1.e10;

	controls.dynamicDampingFactor = params.friction;
 	controls.zoomSpeed = params.zoomSpeed;

	//load in the textures

	//black body texture
	bbTex = new THREE.TextureLoader().load( "textures/bb.png" );
	bbTex.minFilter = THREE.LinearFilter;

	//Milky Way illustration: https://commons.wikimedia.org/wiki/File:Milky_Way_Galaxy.jpg
	MWTex = new THREE.TextureLoader().load("textures/2048px-Milky_Way_Galaxy.png");
	MWTex.minFilter = THREE.LinearFilter;

	//ESO equirectangle MW texture: https://www.eso.org/public/usa/images/eso0932a/
	ESOMWTex = new THREE.TextureLoader().load("textures/eso0932a.jpg" );
	ESOMWTex.minFilter = THREE.LinearFilter;


	//stereo
	effect = new THREE.StereoEffect( renderer );
	effect.setAspect(1.);
	effect.setEyeSeparation(params.stereoSep);

	renderer.autoClear = false;
	effect.autoClear = false;
	params.renderer = renderer;

	camera.up.set(0, -1, 0);

}
//to allow me to disable parts of the gui
//https://stackoverflow.com/questions/24461964/method-for-disabling-a-button-in-dat-gui
function getController(gui, object, property)
{
  for (var i = 0; i < gui.__controllers.length; i++)
  {
    var controller = gui.__controllers[i];
    if (controller.object == object && controller.property == property)
      return controller;
  }
  return null;
}
function blockEvent(event)
{
  event.stopPropagation();
}

Object.defineProperty(dat.controllers.FunctionController.prototype, "disabled", {
  get: function()
  {
    return this.domElement.hasAttribute("disabled");
  },
  set: function(value)
  {
    if (value)
    {
      this.domElement.setAttribute("disabled", "disabled");
      this.domElement.addEventListener("click", blockEvent, true);
    }
    else
    {
      this.domElement.removeAttribute("disabled");
      this.domElement.removeEventListener("click", blockEvent, true);
    }
  },
  enumerable: true
});
//https://stackoverflow.com/questions/18085540/remove-folder-in-dat-gui
dat.GUI.prototype.removeFolder = function(name) {
	var folder = this.__folders[name];
	if (!folder) {
	return;
	}
	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
	this.onResize();
}

function addToLegend(val, name){

	legendGUI.addColor( params, val).name(name);
	var foo = getController(legendGUI, params, val);
	foo.__selector.outerHTML = "";
	delete foo.__selector;	
	foo.__input.style.color = foo.__input.style.backgroundColor;//'rgb('+params[val]+')';
	foo.__input.style.textShadow = 'rgba(0,0,0,0) 0px 0px 0px';
}

function clearLegendFolder(name, type){
	var controllers = name.__controllers;
	var Nc = controllers.length
	for (var i = 0; i < Nc; i++){ 
	//controllers.forEach(function(d, i){
		d = controllers[0];
		name.remove(d);
		if (i == Nc-1){
			populateLegend(type);
		}
	};
	//);
}

function populateLegend(type){
	if (type == 1){
		addToLegend("radialVelocity", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets#Radial_velocity' target='_blank'>Radial Velocity</a>");
		addToLegend("transit", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets#Transit_photometry' target='_blank'>Transit</a>");
		addToLegend("transitTiming", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets#Transit_timing' target='_blank'>Timing</a>");
		addToLegend("imaging", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets#Direct_imaging' target='_blank'>Imaging</a>");
		addToLegend("microlens", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets#Gravitational_microlensing' target='_blank'>Microlensing</a>");
		addToLegend("noData", "<a href='https://en.wikipedia.org/wiki/Methods_of_detecting_exoplanets' target='_blank'>No Data</a>");
	}
	if (type == 2){
		addToLegend("subEarths", "<a href='https://en.wikipedia.org/wiki/Sub-Earth' target='_blank'>Sub-Earths</a>");
		addToLegend("Earths", "<a href='https://en.wikipedia.org/wiki/Terrestrial_planet#Extrasolar_terrestrial_planets' target='_blank'>Earths</a>");
		addToLegend("superEarths", "<a href='https://en.wikipedia.org/wiki/Super-Earth' target='_blank'>Super-Earths</a>");
		addToLegend("Neptunes", "<a href='https://en.wikipedia.org/wiki/Giant_planet#Extrasolar_giant_planets' target='_blank'>Neptunes</a>");
		addToLegend("Jupiters", "<a href='https://en.wikipedia.org/wiki/Giant_planet#Extrasolar_giant_planets' target='_blank'>Jupiters</a>");
		addToLegend("larger", "<a href='https://en.wikipedia.org/wiki/Super-Jupiter' target='_blank'>Larger</a>");
	}
	if (type == 3){
		addToLegend("inHabitableZone", "<a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone#Extrasolar_extrapolation' target='_blank'>In Habitable Zone</a>");
		addToLegend("outside", "<a href='https://en.wikipedia.org/wiki/Circumstellar_habitable_zone#Extrasolar_extrapolation' target='_blank'>Outside</a>");
	}
	legendGUI.open();
}

function makeLegend(type){

	if (legendGUI == null){
		legendGUI = gui.addFolder('Legend');
		populateLegend(type); //on first pass, this will create, destroy and create (silly, but that's quick enough)
	} else {
		//gui.removeFolder('Legend');
	}
	clearLegendFolder(legendGUI, type);

}

function defineParams(){

	ParamsInit = function() {
		this.fullscreen = function() { THREEx.FullScreen.request() };
		this.resetCamera = function() { controls.reset(); 	camera.up.set(0, -1, 0)};
		this.renderer = null;
		this.stereo = false;
		this.friction = 0.2;
		this.zoomSpeed = 1.;
		this.stereoSep = 0.064;

		this.pause = false; //toggles pausing time evolution on/off with space bar

//home screen 
		this.splash = function(){showSplash("#splash");};

//for Legend
		this.noData = [128., 128., 128.]
		this.transit = [255., 255., 0.];
		this.imaging = [0., 255., 0.];
		this.microlens = [51., 51., 255.];
		this.transitTiming = [255., 128., 0.];
		this.radialVelocity = [255., 51., 255.];
		this.subEarths = [255., 51., 255.];
		this.Earths = [51., 51., 255.];
		this.superEarths = [0, 255., 0.];
		this.Neptunes = [255., 255., 51.];
		this.Jupiters = [255., 128., 0.];
		this.larger = [128., 128., 128.];
		this.inHabitableZone = [51., 51., 255.];
		this.outside = [128., 128., 128.];

//Solar System evolution controls
		this.lineWidth = 0.003;
		this.SSlineTaper = 1./4.;
		this.iEvol = 0;
		this.diEvol = 0;
		this.SSalpha = 1.;
		this.useSSalpha = 1.;
		this.HZalpha = 0.2;
		this.coronaSize = 10.;
		this.coronaP = 0.3;
		this.coronaAlpha = 1.;
        //central temperature for exagerating the colors
        this.sTeff = 5780.;
		//factor to exagerate color (set to 1 for no exageration)
        this.Teffac = 1.5;
  		this.ShowHideSolarSystem = function() {
			checkController = getController(basicGUI, params, "ShowHideSolarSystem");
			if (checkController != null){
				checkController.disabled = true;
			}    		
       		if (!SolarSystemInTweening){
				SSAlphaTween.start();
			}
		};
//exoplanet controls
        this.timeStepUnit = 0.;
        this.timeStepFac = 1.;
        this.saveTimeStepFac = 1.;
        this.timeStep = parseFloat(this.timeStepUnit)*parseFloat(this.timeStepFac);
        this.exopSize = exopSize0;
       	this.exoplanetMinSize = exoplanetMinSize0;
		this.exoplanetMaxSize = exoplanetMaxSize0;
		this.exopAlpha = 1.;
        this.exopColorMode = 2;
        this.exopMarkerMode = 1;
        this.pastYrs = 2017;
        this.futureHours = 0.;
        this.futureDays = 0.;
        this.futureYrs = 0.;
        this.futureMillionYrs = 0;
  		this.ShowHideExoplanets = function() {
			checkController = getController(basicGUI, params, "ShowHideExoplanets");
			if (checkController != null){
				checkController.disabled = true;
			}
        	if (!exoplanetsInTweening){
				exopAlphaTween.start();
			}
		};
//Galaxy controls
		this.MWalpha = 0.7;
		this.ShowHideMilkyWay = function() {
			checkController = getController(basicGUI, params, "ShowHideMilkyWay");
			if (checkController != null){
				checkController.disabled = true;
			}   
       		if (!MWInTweening){
				MWAlphaTween.start();
			}
		};
//tours
		this.MilkyWayView = function() {
			if (redoExoplanetsTween) params.ShowHideExoplanets();
			controls.enabled = false;
			MilkyWayViewTween.start();
		}
		this.SolarSystemView = function() {
			if (redoExoplanetsTween) params.ShowHideExoplanets();
			controls.enabled = false;
			SolarSystemViewTween.start();
			if (!SolarSystemON){
				params.ShowHideSolarSystem()
			}
		}
		this.KeplerView = function() {
			if (redoExoplanetsTween || !exoplanetsON) params.ShowHideExoplanets();
			controls.enabled = false;
			KeplerViewTween.start();
		}
		this.KeplerFlyThrough = function(){
			if (redoExoplanetsTween || !exoplanetsON) params.ShowHideExoplanets();
			controls.enabled = false;
			if (camera.position.distanceTo(KeplerTarget) > 1){
				KeplerFlyThroughTween.start();
			}else{
				KeplerFlyThroughTween1.start();
			}
		}

		this.GoToExoplanet = "";
		this.GoToExoplanetTween = function() {
			if (redoExoplanetsTween || !exoplanetsON) params.ShowHideExoplanets();

			if (params.GoToExoplanet != ""){
				exoplanetsInMotion = true;
				exoplanetSelected = true;

				var i = uExoplanets.name.indexOf(params.GoToExoplanet);
				var pos = uExoplanets.position[i];

				var imesh = exoplanets.name.indexOf(params.GoToExoplanet);
				//https://github.com/mrdoob/three.js/issues/1606
				var matrix = exoplanetsMatrix[imesh].clone();

				//scale the matrix
				var r = pos.distanceTo(new THREE.Vector3(0., 0., 0.));
				var val = Math.max(0.025*r, 5.e5 )
				matrix.elements[15] *= r/val;

				var c0 = new THREE.Vector3(0., 0., -1.).applyMatrix4( matrix );
				var exoplanetTarget = new THREE.Vector3(pos.x + c0.x, pos.y + c0.y, pos.z + c0.z);
				var r1 = exoplanetTarget.distanceTo(new THREE.Vector3(0., 0., 0.));
				if (r1 < r){
					//console.log("swapping")
					exoplanetTarget = new THREE.Vector3(pos.x - c0.x, pos.y - c0.y, pos.z - c0.z);
				}

				//console.log(pos, exoplanetTarget, c0, r, r1, val, matrix)
				exoplanetViewTween.to(exoplanetTarget, 3500);
				exoplanetViewTween.start();
				exoplanetsMesh[imesh].material.uniforms.exopAlpha.value = 1.;

			} else {
				exoplanetSelected = false;
			}
		}
		this.ExoplanetDiscoveryYrs = function() {
			runningExopDiscYrs = true;
			params.futureMillionYrs = 0.;
			params.pastYrs = 1990.;

			params.timeStepUnit = 1.;
			params.resetSlider('timeStepUnit', basicGUI, params.timeStepUnit);
			params.timeStepFac = 0.1;
			params.resetSlider('timeStepFac', basicGUI, params.timeStepFac);

		}
		this.FutureSolarSystem = function() {
			if (!SolarSystemON){
				params.ShowHideSolarSystem();
			}
			if (exoplanetsON){
				params.ShowHideExoplanets();
			}
			//if (MilkyWayON){
			//	params.ShowHideMilkyWay();
			//}

			runningFutureSS = true;
			params.futureMillionYrs = 0.;
			params.pastYrs = 2017.;
 			params.updateSSExop();

			params.timeStepUnit = "equal";
			params.resetSlider('timeStepUnit', basicGUI, params.timeStepUnit);
			params.timeStepFac = 1.;
			params.resetSlider('timeStepFac', basicGUI, params.timeStepFac);

		}

//functions
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

			exoplanetsMesh.forEach( function( e, i ) {
				e.material.uniforms.colorMode.value = params.exopColorMode;
				e.material.uniforms.markerMode.value = params.exopMarkerMode;
				var planetAngle = -999.
				if (exoplanets.period[i] > 0){
					planetAngle = 2.*Math.PI * ( (params.futureMillionYrs * 1.e6 * 365.2422)/exoplanets.period[i] % 1.)
				}
				e.material.uniforms.planetAngle.value = planetAngle;
			});
			if ((exoplanetsON) && !exoplanetsInTweening){
				params.exoplanetMinSize = exoplanetMinSize0*params.exopSize/exopSize0;
				params.exoplanetMaxSize = exoplanetMaxSize0*params.exopSize/exopSize0;

				exoplanetsMesh.forEach( function( e, i ) {
					//could probably do some tween here
					//note yrDiscovered is negative for habitable planets
					var alpha = 0;
					if (Math.abs(exoplanets.yrDiscovered[i]) <= params.pastYrs){
						alpha = 1;
					}
					e.material.uniforms.exopAlpha.value = alpha * params.exopAlpha;

				} );
			}

        }


		this.updateSolarSystem = function() {
        	if (SSValsNeedReset){
        		SSValsNeedReset = false;
				if (SSAlphaTweenValue.value == 0){
					SSAlphaTweenValue.value = 0;
					SSAlphaTween.to({"value":params.SSalpha})
				} else {
					SSAlphaTweenValue.value = params.SSalpha;
					SSAlphaTween.to({"value":0});
				}
			}

			if (SolarSystemON){

				clearOrbitLines();
				drawOrbitLines();

				clearHZ();
				drawHZ();

				clearSun();
				drawSun();

			}
		}
		this.updatefutureMillionYrs = function() {
			if (parseFloat(params.futureMillionYrs) > 0){
				params.pastYrs = 2017
			}
			params.updateSSExop();
		}
		this.updateSSExop = function(){
			if (parseFloat(params.pastYrs) < 2017){
				params.futureMillionYrs = 0.
			}
			params.pastYrs = Math.min(parseFloat(params.pastYrs) + parseFloat(params.futureMillionYrs)*1.e6, 2017);

			params.updateSolarSystem();
			params.updateExoplanets();
		}

		this.updateMW = function() {
			if (MWAlphaTweenValue.value == 0){
				MWAlphaTweenValue.value = 0;
				MWAlphaTween.to({"value":params.MWalpha})
			} else {
				MWAlphaTweenValue.value = params.MWalpha;
				MWAlphaTween.to({"value":0});
			}
			if (MilkyWayON){
				MilkyWayMesh.forEach( function( m, i ) {
					m.material.uniforms.MWalpha.value = params.MWalpha;
				});
			}
		}
		this.updateLegend = function(){
			makeLegend(params.exopColorMode);
			params.updateExoplanets();
		}
		this.resetSlider = function(name, gui, value){
			if (gui != null){
				for(var i = 0; i<gui.__controllers.length;i++){
					if( gui.__controllers[i].property == name ) {
						if (Math.sign(value) == -1){
							gui.__controllers[i].__min = value;
						} else {
							gui.__controllers[i].__min = 0.; //NOTE: THIS IS NOT GENERAL, BUT CAN WORK FOR ME HERE
						}
						gui.__controllers[i].setValue(value);
					}
				}
			}
		};
	};


	params = new ParamsInit();
}


function defineGUI(){
	if (gui != null){
		gui.destroy();
	}

	gui = new dat.GUI({ width: 450 } )
	gui.add(params,'splash').name("Home");

	basicGUI = gui.addFolder('Controller');

	if (showExoplanetGUI){
		basicGUI.add( params, 'pastYrs', 1990, 2017).listen().onChange( params.updateSSExop ).name("Year");
		basicGUI.add( params, 'timeStepUnit', { "None": 0, "Hour": (1./8760.), "Day": (1./365.2422), "Year": 1} ).name("Time Step Unit");
	}

	if (showSolarSystemEvolGUI){
		basicGUI.add( params, 'futureMillionYrs', 0, maxTime).listen().onChange( params.updatefutureMillionYrs ).name("Future Million Years");
		basicGUI.add( params, 'timeStepUnit', { "None": 0, "Year": 1, "Million Years": 1e6, "Equal Solar Mass Loss": "equal" } ).name("Time Step Unit");
	}


	basicGUI.add( params, 'timeStepFac', 0, 100 ).name("Time Step Multiplier");//.listen();
	//https://stackoverflow.com/questions/41154519/how-to-change-slider-value-on-dat-gui-and-how-to-reset-dat-gui/41154865#41154865	
	/* Here is the update */





	basicGUI.add( params, 'ShowHideSolarSystem').name("Show/Hide Solar System");
	
	if (showExoplanetGUI){
		basicGUI.add( params, 'ShowHideExoplanets').name("Show/Hide Exoplanets");
	}

	basicGUI.add( params, 'ShowHideMilkyWay').name("Show/Hide Milky Way");

	if (showExoplanetGUI){
		basicGUI.add( params, 'exopColorMode',{ "Discovery Method": 1, "Planet Size": 2, "Habitable Zone": 3 } ).onChange( params.updateLegend ).name("Exoplanet Marker Color");
		basicGUI.add( params, 'exopMarkerMode',{ "Bulls-Eye": 1, "Orrery": 2} ).onChange( params.updateExoplanets ).name("Exoplanet Marker Type");
	}

	basicGUI.open()

//legend
	if (showExoplanetGUI){
		makeLegend(params.exopColorMode);
	}

//tours
	var toursGUI = gui.addFolder('Tours');
	if (showExoplanetGUI){
		toursGUI.add( params, 'MilkyWayView').name("Go To Milky Way View");
	}
	toursGUI.add( params, 'SolarSystemView').name("Go To Solar System View");
	if (showSolarSystemEvolGUI){
		toursGUI.add( params, 'FutureSolarSystem').name("Animate Future of Solar System");
	}
	if (showExoplanetGUI){
		toursGUI.add( params, 'KeplerView').name("Go To Kepler View");
		toursGUI.add( params, 'KeplerFlyThrough').name("Fly Through Kepler Exoplanets");
		toursGUI.add( params, 'ExoplanetDiscoveryYrs').name("Animate Exoplanet Discoveries by Year");

		var exopSelect = {"Select":""}
		uExoplanets.name.forEach(function(e){
			var indices = getAllIndices(exoplanets.name, e);
			indices.forEach( function(i){
				ringTot = parseInt(Math.floor(Math.abs(exoplanets.ringInfo[i])));
				var hab = Math.sign(exoplanets.yrDiscovered[i])
			//if (exoplanets.ringInfo[i] > 0 && ringTot > 3) exopSelect[e] = e;
				if (exoplanets.ringInfo[i] > 0 && hab == -1 && exoplanets.period[i] > 0 && Object.keys(exopSelect).indexOf(e) == -1) {
					exopSelect[e] = e;
				}
			});

		});
		toursGUI.add( params, 'GoToExoplanet',exopSelect ).onChange( params.GoToExoplanetTween ).name("Go To Exoplanet");

	}

//extra controls
	var extraControls  = gui.addFolder('Extra Controls')
	var cameraGUI = extraControls.addFolder('Camera');
	var SSGUI = extraControls.addFolder('Solar System');
	if (showExoplanetGUI){
		var exopGUI = extraControls.addFolder('Exoplanets');
	}
	var MWGUI = extraControls.addFolder('Milky Way');
	cameraGUI.add( params, 'fullscreen').name("FullScreen");
	cameraGUI.add( params, 'stereo').onChange(params.updateStereo).name("Stereo3D");
	cameraGUI.add( params, 'stereoSep',0,1).onChange(params.updateStereo).name("Stereo Separation");
	cameraGUI.add( params, 'friction',0,1).onChange(params.updateFriction).name("Motion Friction");
	cameraGUI.add( params, 'zoomSpeed',0.01,5).onChange(params.updateZoom).name("Zoom Speed");
	cameraGUI.add( params, 'resetCamera').name("Reset Camera")

	SSGUI.add( params, 'lineWidth', 0, 0.01).onChange( params.updateSolarSystem ).name("Line Width");
	SSGUI.add( params, 'useSSalpha',0., 1. ).onChange( params.updateSolarSystem ).name("Solar System Transparency");
	SSGUI.add( params, 'HZalpha',0., 1. ).onChange( params.updateSolarSystem ).name("Habitable Zone Transparency");
	SSGUI.add( params, 'coronaSize',0, 100 ).onChange( params.updateSolarSystem ).name("Corona Size");
	SSGUI.add( params, 'coronaP',0.1, 3 ).onChange( params.updateSolarSystem ).name("Corona Exponent");
	SSGUI.add( params, 'coronaAlpha',0., 1. ).onChange( params.updateSolarSystem ).name("Corona Transparency");

	if (showExoplanetGUI){
		exopGUI.add( params, 'exopSize',0.01, 10. ).onChange( params.updateExoplanets ).name("Exoplanet Size");
		exopGUI.add( params, 'exopAlpha',0., 1. ).onChange( params.updateExoplanets ).name("Exoplanet Transparency");
	}

	MWGUI.add( params, 'MWalpha',0., 1. ).onChange( params.updateMW ).name("Milky Way Transparency");

	if (isMobile){
		resizeMobile();
	}

}

function defineTweens(){

	//for easing the alpha on the exoplanets to turn them off
	exopAlphaTweenValue = {"value":params.exopAlpha};
	exopAlphaTween = new TWEEN.Tween(exopAlphaTweenValue).to({"value":0.}, 1000);
	exopAlphaTween.onStart(function() {
		exoplanetsON = !exoplanetsON;
		exoplanetsInTweening = true;
	});
	exopAlphaTween.onUpdate(function(object){
		exoplanetsMesh.forEach( function( e, i ) {
			//if ( (Math.abs(exoplanets.yrDiscovered[i]) <= params.pastYrs) && ((exoplanets.name[i] != params.GoToExoplanet) || redoExoplanetsTween)){
			if ( (Math.abs(exoplanets.yrDiscovered[i]) <= params.pastYrs) ){
				e.material.uniforms.exopAlpha.value = object.value;
				if (Math.sign(exoplanets.ringInfo[i]) < 0){
					e.material.uniforms.exopAlpha.value = Math.min(params.exopAlpha, exopDfac/camDist) * object.value;
				}
			} 
		});
	});
	exopAlphaTween.onComplete(function(object){
		exoplanetsInTweening = false;
		redoExoplanetsTween = false;
		exoplanetsInMotion = false;
		checkController = getController(basicGUI, params, "ShowHideExoplanets");
		if (checkController != null){
			checkController.disabled = false;
		} 
		if (exoplanetsON){
			this.to({"value":0.})
		} else {
			this.to({"value":params.exopAlpha});
			if (object.value != 0){
				redoExoplanetsTween = true;
			}
		}
	});


	//for easing the alpha on the Solar System to turn them off
	SSAlphaTweenValue = {"value":params.SSalpha};
	SSAlphaTween = new TWEEN.Tween(SSAlphaTweenValue).to({"value":0}, 1000);
	SSAlphaTween.onStart(function(){
		SolarSystemON = !SolarSystemON;
		SolarSystemInTweening = true;
	});
	SSAlphaTween.onUpdate(function(object){
		params.useSSalpha = object.value;
		orbitLines.forEach( function( l, i ) {
			l.material.uniforms.opacity.value = object.value;
		} );
		SunMesh.material.uniforms.SSalpha.value = object.value;
		coronaMesh.material.uniforms.SSalpha.value = object.value;
		HZMesh.material.uniforms.SSalpha.value = object.value;

	});
	SSAlphaTween.onComplete(function(object){
		SolarSystemInTweening = false;
		SSValsNeedReset = true;
		checkController = getController(basicGUI, params, "ShowHideSolarSystem");
		if (checkController != null){
			checkController.disabled = false;
		} 
		if (SolarSystemON){
			this.to({"value":0.})
		} else {
			this.to({"value":params.SSalpha});
		}
	});

	//for easing the alpha on the Milky Way to turn it off
	MWAlphaTweenValue = {"value":params.MWalpha};
	MWAlphaTween = new TWEEN.Tween(MWAlphaTweenValue).to({"value":0}, 1000);
	MWAlphaTween.onStart(function(){
		MilkyWayON = !MilkyWayON;
		MWInTweening = true;
	});
	MWAlphaTween.onUpdate(function(object){
		var MWalpha = Math.min(object.value * (1. / params.MWalpha), Math.max(0., (1. - MWDfac/camDist)));
		MilkyWayMesh.forEach( function( m, i ) {
			m.material.uniforms.MWalpha.value = MWalpha;
		});	
		MWInnerMesh.material.opacity = Math.min(object.value, Math.max(0., 0.5*MWDfac/camDist));
	});
	MWAlphaTween.onComplete(function(object){
		MWInTweening = false;
		checkController = getController(basicGUI, params, "ShowHideMilkyWay");
		if (checkController != null){
			checkController.disabled = false;
		} 
		if (MilkyWayON){
			this.to({"value":0.})
		} else {
			this.to({"value":params.MWalpha});
		}
	});

	//for moving position out to the MW
	
	MilkyWayViewTween = new TWEEN.Tween(camera.position).to(MWTarget, 5000).easing(TWEEN.Easing.Quintic.InOut);
	MilkyWayViewTween.onComplete(function(object){
		controls.enabled = true;
	});

	//for moving to Solar System View
	SolarSystemViewTween = new TWEEN.Tween(camera.position).to(SSTarget, 5000).easing(TWEEN.Easing.Quintic.InOut);
	SolarSystemViewTween.onComplete(function(object){
		controls.enabled = true;
	});

	//for moving to a view of the Kepler field
	KeplerViewTween = new TWEEN.Tween(camera.position).to(KeplerTarget, 5000).easing(TWEEN.Easing.Quintic.InOut);
	KeplerViewTween.onComplete(function(object){
		controls.enabled = true;
		if (SolarSystemON){
			params.ShowHideSolarSystem()
		}
		if (!exoplanetsON){
			params.ShowHideExoplanets()
		}
	});


	//dummy values will be reset in params
	var exoplanetTarget = new THREE.Vector3(0,0,0);
	exoplanetViewTween = new TWEEN.Tween(camera.position).to(exoplanetTarget, 3000).easing(TWEEN.Easing.Quintic.InOut);	
	exoplanetViewTween.onComplete(function(object){
		controls.enabled = true;
		//exopAlphaTweenValue.value = params.exopAlpha;
		//exopAlphaTween.to({"value":0.2*parseFloat(params.exopAlpha)}).start();
	});

	KeplerFlyThroughTween = new TWEEN.Tween(camera.position).to(KeplerTarget, 3000).easing(TWEEN.Easing.Quintic.InOut);
	KeplerFlyThroughTween1 = new TWEEN.Tween(camera.position).to(KeplerFlyTarget1, 5000).easing(TWEEN.Easing.Quintic.InOut);
	KeplerFlyThroughTween1.onComplete(function(object){
		
		var foo = 0;
		var Nrot = 50;
		var myRotate = setInterval(function(){
			var x = camera.position.x;
			var y = camera.position.y;
			var z = camera.position.z;
			var rotSpeed = 0.75 * Math.PI/Nrot;
			camera.position.x = x * Math.cos(rotSpeed) - z * Math.sin(rotSpeed);
			camera.position.z = z * Math.cos(rotSpeed) + x * Math.sin(rotSpeed);
	  		camera.lookAt(scene.position);
	  		foo += 1;
	  		if (foo > Nrot){
	  			clearInterval(myRotate);
				KeplerFlyThroughTween2.start()
	  		}
	  	}, 1);
	  	

	});
	KeplerFlyThroughTween2 = new TWEEN.Tween(camera.position).to(KeplerFlyTarget2, 3000).easing(TWEEN.Easing.Quadratic.Out);
	KeplerFlyThroughTween3 = new TWEEN.Tween(camera.position).to(KeplerTarget, 20000).easing(TWEEN.Easing.Quintic.Out);
	KeplerFlyThroughTween3.onComplete(function(object){
		controls.enabled = true;
		if (SolarSystemON){
			params.ShowHideSolarSystem()
		}
	});
	KeplerFlyThroughTween.chain(KeplerFlyThroughTween1);//.chain(KeplerFlyThroughTween2); //I think you can only chain two together
	KeplerFlyThroughTween2.chain(KeplerFlyThroughTween3);


}

function loadData(callback){
	

	d3.json("data/Sunevol_b0.1.binned.json",  function(x0) {
		SunEvol = x0;
		d3.json("data/SSevol_b0.1_Mercury.binned.json",  function(x1) {
			MercuryEvol = x1;
			d3.json("data/SSevol_b0.1_Venus.binned.json",  function(x2) {
				VenusEvol = x2;
				d3.json("data/SSevol_b0.1_Earth.binned.json",  function(x3) {
					EarthMoonEvol = x3;
					d3.json("data/SSevol_b0.1_Mars.binned.json",  function(x4) {
						MarsEvol = x4;
						d3.json("data/SSevol_b0.1_Jupiter.binned.json",  function(x5) {
							JupiterEvol = x5;
							d3.json("data/SSevol_b0.1_Saturn.binned.json",  function(x6) {
								SaturnEvol = x6;
								d3.json("data/SSevol_b0.1_Uranus.binned.json",  function(x7) {
									UranusEvol = x7;
									d3.json("data/SSevol_b0.1_Neptune.binned.json",  function(x8) {
										NeptuneEvol = x8;
										d3.json("data/SSevol_b0.1_Pluto.binned.json",  function(x9) {
											PlutoEvol = x9;

											d3.json("data/HZevol_b0.1.binned.json",  function(x10) {
												HZEvol = x10;

												d3.json("data/OpenExoplanetCatalog_Nov2017.json",  function(x11) {
													exoplanets = x11;

													d3.json("data/planets.json",  function(x12) {
														//from Allen's Astrophysical Quantities; Note, I changed Earth's year to be exactly 1 so there isn't any confusion in the visualization. The true value is 0.99997862]]
														planets = x12;

														callback();
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}


function WebGLStart(){	
	
	showInstructions(instructionIndex);

	clearloading();

	iLength = SunEvol.time.length;

	getUniqExoplanets();

	planetsEvol = {MercuryEvol, VenusEvol, EarthMoonEvol, MarsEvol, JupiterEvol, SaturnEvol, UranusEvol, NeptuneEvol, PlutoEvol}

	SunR0 = SunEvol.radius[0];
	getmaxHZa();
	setMaxTime();

//initialize
	defineParams(); 
	init();
	defineTweens();
	initSunInterps();
	initPlanetInterps();
	initHZInterps();

//initial GUI
	gui = new dat.GUI({ width: 450 } )
	gui.add(params,'splash').name("Home");
	if (isMobile){
		resizeMobile();
	}

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

//check for mobile, then resize instructions
//https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
var isMobile = false; //initiate as false
// device detection
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
    || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

resizeInstructions();
if (isMobile){
	resizeMobile()
}

window.addEventListener("resize", resizeInstructions);
d3.select("#instructionsPage1").style("display", "block");
if (isMobile){
	d3.select("#instructionsDiv")
		.on("touchstart", touchstarted)
		.on("touchmove", touchmoved)
		.on("touchend", touchended);

	var page = d3.select("#instructionsPage1"),
		width,
		height,
		clientX0,
		pageX0,
		pageXMin = 0,
		pageXMax = window.innerWidth,
		dragSamples,
		pageXoffset = pageXMax/2.;
}

//////this will load the data, and then start the WebGL rendering
loadData(WebGLStart);
