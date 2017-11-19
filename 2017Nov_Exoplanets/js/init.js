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
var M83mesh;
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

var gui = new dat.GUI({ width: 350 } );
var basicGUI;
var legendGUI = null;

//for tweens
var exoplanetsON = true;
var exoplanetsOFFtime = false;
var exoplanetsInTweening = false;
var exoplanetsInMotion = false;
var exopAlphaTween;
var exopAlphaTweenValue;

var SolarSystemON = true;
var SolarSystemInTweening = false;
var SSValsNeedReset = false;
var SSAlphaTween;
var SSAlphaTweenValue;

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

	//load in the textures

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

function addToLegend(val){
	legendGUI.addColor( params, val);
	var foo = getController(legendGUI, params, val);
	foo.__selector.outerHTML = "";
	delete foo.__selector;	
	foo.__input.style.color = foo.__input.style.backgroundColor;//'rgb('+params[val]+')';
	foo.__input.style.textShadow = 'rgba(0,0,0,0) 0px 0px 0px';
}
function makeLegend(type){
//	"DiscoveryMethod": 1, "PlanetSize": 2, "HabitableZone": 3
	if (legendGUI != null){
		gui.removeFolder('Legend');
	}

	legendGUI = gui.addFolder('Legend');

	if (type == 1){
		addToLegend("radialVelocity");
		addToLegend("transit");
		addToLegend("transitTiming");
		addToLegend("imaging");
		addToLegend("microlens");
		addToLegend("noData");
	}
	if (type == 2){
		addToLegend("subEarths");
		addToLegend("Earths");
		addToLegend("superEarths");
		addToLegend("Neptunes");
		addToLegend("Jupiters");
		addToLegend("larger");
	}
	if (type == 3){
		addToLegend("inHabitableZone");
		addToLegend("outside");
	}
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
    		getController(basicGUI, params, "ShowHideSolarSystem").disabled = true;
       		if (!SolarSystemInTweening){
				SSAlphaTween.start();
			}
		};
//exoplanet controls
        this.timeStepUnit = 0.;
        this.timeStepFac = 1.;
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
    		getController(basicGUI, params, "ShowHideExoplanets").disabled = true;
        	if (!exoplanetsInTweening){
				exopAlphaTween.start();
			}
		};
//Galaxy controls
		this.MWalpha = 1.;
		this.M83alpha = 0.5;
		this.ShowHideMilkyWay = function() {
    		getController(basicGUI, params, "ShowHideMilkyWay").disabled = true;
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


			}
		}
		this.ExoplanetDiscoveryYrs = function() {
			params.futureMillionYrs = 0.;
			starting = {"value":1990};
			exopDiscTween = new TWEEN.Tween(starting).to({"value":2017}, 4000);
			exopDiscTween.onUpdate(function(object){
				params.pastYrs = object.value;
				params.updateSSExop()
			});
			exopDiscTween.start()
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
			starting = {"value":0};
			SSEvolTween = new TWEEN.Tween(starting).to({"value":iLength-1}, 30000);
			SSEvolTween.onUpdate(function(object){
				inSSEvolTween = true;
				params.futureMillionYrs = SunEvol.timeInterp.evaluate(object.value);
				params.updateSSExop();
			});
			SSEvolTween.onComplete(function(){
				inSSEvolTween = false;
			});
			SSEvolTween.start()
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
/*        	if (!exoplanetsInTweening && !exoplanetsInMotion){
				if (exopAlphaTweenValue.value == 0){
					exopAlphaTween.to({"value":params.exopAlpha})
				} 
				if (exopAlphaTweenValue.value = params.exopAlpha){
					exopAlphaTween.to({"value":0});
				}
			}
*/
			exoplanetsMesh.forEach( function( e, i ) {
				e.material.uniforms.colorMode.value = params.exopColorMode;
				e.material.uniforms.markerMode.value = params.exopMarkerMode;
				var planetAngle = -999.
				if (exoplanets.period[i] > 0){
					planetAngle = 2.*Math.PI * ( (params.futureMillionYrs * 1.e6 * 365.2422)/exoplanets.period[i] % 1.)
				}
				e.material.uniforms.planetAngle.value = planetAngle;
			});
			if (exoplanetsON && !exoplanetsInTweening){
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

			/*
			if (params.futureMillionYrs > 1){
				if (exoplanetsON){
					if (!exoplanetsInTweening) params.ShowHideExoplanets();
					exoplanetsOFFtime = true;
				}
				if (MilkyWayON){
					if (!MWInTweening) params.ShowHideMilkyWay();
					MWOFFtime = true;
				}
			} else {
				if (!exoplanetsON && exoplanetsOFFtime){
					if (!exoplanetsInTweening) params.ShowHideExoplanets();
					exoplanetsOFFtime = false;
				}
				if (!MilkyWayON && MWOFFtime){
					if (!MWInTweening) params.ShowHideMilkyWay();
					MWOFFtime = false;
				}
			}
	*/
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
	};


	params = new ParamsInit();

	basicGUI = gui.addFolder('Controller');

	basicGUI.add( params, 'pastYrs', 1990, 2017).listen().onChange( params.updateSSExop );
	basicGUI.add( params, 'futureMillionYrs', 0, maxTime).listen().onChange( params.updatefutureMillionYrs );

	basicGUI.add( params, 'timeStepUnit', { "None": 0, "Hour": (1./8760.), "Day": (1./365.2422), "Year": 1, "Million Years": 1e6, "Equal Solar Mass Loss": -1. } );//.onChange( params.updateSSExop );
	basicGUI.add( params, 'timeStepFac', 0, 100 );//.onChange( params.updateSSExop );
	basicGUI.add( params, 'ShowHideSolarSystem');
	basicGUI.add( params, 'ShowHideExoplanets');
	basicGUI.add( params, 'ShowHideMilkyWay');

	basicGUI.add( params, 'exopColorMode',{ "DiscoveryMethod": 1, "PlanetSize": 2, "HabitableZone": 3 } ).onChange( params.updateLegend );
	basicGUI.add( params, 'exopMarkerMode',{ "BullsEye": 1, "Orrery": 2} ).onChange( params.updateExoplanets );
	basicGUI.open()

//tours
	var toursGUI = gui.addFolder('Tours');
	toursGUI.add( params, 'MilkyWayView');
	toursGUI.add( params, 'SolarSystemView');
	toursGUI.add( params, 'FutureSolarSystem');
	toursGUI.add( params, 'KeplerView');
	toursGUI.add( params, 'KeplerFlyThrough');
	toursGUI.add( params, 'ExoplanetDiscoveryYrs');
	var exopSelect = {"Select":""}
	uExoplanets.name.forEach(function(e){
		var i = exoplanets.name.indexOf(e);
		ringTot = parseInt(Math.floor(Math.abs(exoplanets.ringInfo[i])));
		var hab = Math.sign(exoplanets.yrDiscovered[i])
		//if (exoplanets.ringInfo[i] > 0 && ringTot > 3) exopSelect[e] = e;
		if (exoplanets.ringInfo[i] > 0 && hab == -1) exopSelect[e] = e;

	});
	toursGUI.add( params, 'GoToExoplanet',exopSelect ).onChange( params.GoToExoplanetTween );



//extra controls
	var extraControls  = gui.addFolder('Extra Controls')
	var cameraGUI = extraControls.addFolder('Camera');
	var SSGUI = extraControls.addFolder('Solar System');
	var exopGUI = extraControls.addFolder('Exoplanets');
	var MWGUI = extraControls.addFolder('Milky Way');
	cameraGUI.add( params, 'fullscreen');
	cameraGUI.add( params, 'stereo').onChange(params.updateStereo);
	cameraGUI.add( params, 'stereoSep',0,1).onChange(params.updateStereo);
	cameraGUI.add( params, 'friction',0,1).onChange(params.updateFriction);
	cameraGUI.add( params, 'zoomSpeed',0.01,5).onChange(params.updateZoom);
	cameraGUI.add( params, 'resetCamera')

	SSGUI.add( params, 'lineWidth', 0, 0.01).onChange( params.updateSolarSystem );
	SSGUI.add( params, 'SSalpha',0., 1. ).onChange( params.updateSolarSystem );
	SSGUI.add( params, 'HZalpha',0., 1. ).onChange( params.updateSolarSystem );
	SSGUI.add( params, 'coronaSize',0, 100 ).onChange( params.updateSolarSystem );
	SSGUI.add( params, 'coronaP',0.1, 3 ).onChange( params.updateSolarSystem );
	SSGUI.add( params, 'coronaAlpha',0., 1. ).onChange( params.updateSolarSystem );

	exopGUI.add( params, 'exopSize',0.01, 2. ).onChange( params.updateExoplanets );
	exopGUI.add( params, 'exopAlpha',0., 1. ).onChange( params.updateExoplanets );

	MWGUI.add( params, 'MWalpha',0., 1. ).onChange( params.updateMW );


	makeLegend(params.exopColorMode);

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
			if ((exoplanets.name[i] != params.GoToExoplanet) || redoExoplanetsTween){
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
		getController(basicGUI, params, "ShowHideExoplanets").disabled = false;
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
		getController(basicGUI, params, "ShowHideSolarSystem").disabled = false;
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
		var MWalpha = Math.min(object.value, Math.max(0., (1. - MWDfac/camDist)));
		MilkyWayMesh.forEach( function( m, i ) {
			m.material.uniforms.MWalpha.value = MWalpha;
		});	
		MWInnerMesh.material.opacity = Math.min(object.value, Math.max(0., 0.5*MWDfac/camDist));
	});
	MWAlphaTween.onComplete(function(object){
		MWInTweening = false;
		getController(basicGUI, params, "ShowHideMilkyWay").disabled = false;
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
		exopAlphaTweenValue.value = params.exopAlpha;
		exopAlphaTween.to({"value":0.2*parseFloat(params.exopAlpha)}).start();
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

function WebGLStart(){

    while (!loaded){
        checkloaded();
    }
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

