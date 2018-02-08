
function CameraDistance(origin = new THREE.Vector3(0., 0., 0.)){
	return camera.position.distanceTo(origin);
}

function getAllIndices(arr, val) {
	var indices = [], i;
	for(i = 0; i < arr.length; i++)
		if (arr[i] === val)
			indices.push(i);
	return indices;
}
//after the data is loaded, include the buttons
function clearloading(){

    d3.select("#ContentContainer").style("visibility","visible")

    loaded = true;
    console.log("loaded")
    d3.select("#loader").style("display","none")

    var loader = d3.select(".instructionsContent").select("#loader");
    loader.selectAll("span").remove();

	d3.select("#credits").style("visibility","visible");

}

function flashplaystop(ID){
	var pp = d3.select(ID);
	pp.style("display","block")
		.style("opacity",1.);
	pp.transition()
		.ease(d3.easeLinear)
		.duration(500)
		.style("opacity", 0.)
		.on("end", function() { pp.style("display","none") });
}

function resizeMobile(){
	d3.selectAll(".instructionsTitle").style("font-size", "72px"); 
	d3.selectAll(".instructionsSubTitle").style("font-size", "60px"); 
	d3.selectAll(".instructionsContent").style("font-size", "46px"); 
	d3.selectAll(".splashButton").style("font-size", "30px"); 

//for dat.gui (but would require changes whenever a section is closed)
//	d3.selectAll(".dg .property-name").style("font-size", "30px");
//	d3.selectAll(".dg .cr.function").style("height", "94px");
//	d3.selectAll(".dg .cr.number").style("height", "94px");
//	d3.selectAll(".dg .cr.color").style("height", "94px");
	d3.selectAll(".dg li.title").style("height", "36px");
	d3.selectAll(".dg li.title").style("font-size", "30px");
	var d = document.getElementsByClassName("function");
	for (var i =0; i < d.length; i++){
		var x = d[i].innerHTML.indexOf("Home</span>");
		if (x != -1){
			d[i].style.fontSize = "30px"
			d[i].style.height = "36px" //not sure if this is working
		}
	}

}

function resizeInstructions(){

	height = window.innerHeight;
	width = window.innerWidth;
	var theight = d3.selectAll(".instructionsTitleContainer").style("height").slice(0, -2);
	if (theight == 'au'){
		theight = 60.;
	} else {
		theight = parseFloat(theight) - 60.;
	}
    d3.selectAll(".instructionsContent").style("height", height - theight - 150. + 'px')
    d3.select('#instructionsDiv').style("height",height - 40. + 'px');
    d3.select('#instructionsDiv').style("visibility","visible");


    if (height < 500){
		d3.selectAll("#credits").style("position","relative");
    } else {
		d3.selectAll("#credits").style("position","absolute");
    }

	var woff = 24.; //not sure why this is needed
	var win = 400.; //how far from the edge should we go
	var wmin = 480.; //minimum size of the window
	var wd = width - woff - win;
	if (wd < wmin){
		win = Math.max(width - woff - wmin, 0.);
		wd = width - woff - win;
	}
	if (isMobile){
		win = 0.;
		wd = width - woff;
    }

	var container = d3.select('#instructionsDiv');
	container.style("width",wd + 'px');
	container.style("left",(wd + win)/2. + 'px');
	container.style("margin-left", -wd/2. + 'px');

	d3.selectAll(".next").style("left", wd-5 + 'px');

	d3.selectAll(".splashButton").style("margin-left", (wd-80-250)/2. + 'px');

	d3.selectAll(".myInstructions").style("width", wd-80 + 'px');
}



function hideButtons(){
    d3.selectAll("#splashButtonP").style("display","none")
    d3.selectAll(".splashButton").style("display","none")
}

//https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_slideshow
function plusInstructions(n) {

	showInstructions(instructionIndex += n);
}

function currentInstructions(n) {
	showInstructions(instructionIndex = n);
}

function showInstructions(n) {
	resizeInstructions();
	if (n == 2){
		d3.selectAll("#splashButtonP").style("display","block");
		d3.selectAll(".splashButton").style("display","inline-block");
		d3.selectAll("#GoButton").style("display","none");
		hideControlInstructions()
	}

	var i;
	var instructions = document.getElementsByClassName("myInstructions");
	var dots = document.getElementsByClassName("dot");

	d3.select(".next").style("visibility", "visible");
	d3.select(".instructionsX").style("visibility", "visible");
	d3.select(".dotDiv").style("visibility", "visible");

	if (n > instructions.length) {instructionIndex = 1}    
	if (n < 1) {instructionIndex = instructions.length}

	if (n == 1){
		d3.select(".prev").style("visibility", "hidden")
	} else if (n == instructions.length){
		d3.select(".next").style("visibility", "hidden")
	} else {
		d3.select(".prev").style("visibility", "visible")
		d3.select(".next").style("visibility", "visible")

	}
	for (i = 0; i < instructions.length; i++) {
		instructions[i].style.display = "none";  
	}
	for (i = 0; i < dots.length; i++) {
		dots[i].className = dots[i].className.replace(" active", "");
	}
	page = d3.select('#'+instructions[instructionIndex-1].id);
	instructions[instructionIndex-1].style.display = "block";  
	dots[instructionIndex-1].className += " active";
}


function showControlInstructions(id){
	d3.select(id).style("display","block")
}
function hideControlInstructions(){
	d3.select("#ExopInstructions").style("display","none");
	d3.select("#SSInstructions").style("display","none");
	d3.select("#FreeInstructions").style("display","none");

}
function showExop(){
	hideButtons();
	showControlInstructions('#ExopInstructions')

	button = d3.select('#instructionsPage3').select('#GoButton');
	button.style('display','inline-block');

	showExoplanetGUI = true; 
	showSolarSystemEvolGUI = false; 
	defineGUI(); 
	if (!exoplanetsON){
		params.ShowHideExoplanets()
	}
	controls.maxDistance = 1.e10;

}


function showSSEvol(){
	hideButtons();
	showControlInstructions('#SSInstructions')

	button = d3.select('#instructionsPage3').select('#GoButton');
	button.style('display','inline-block');

	showExoplanetGUI = false; 
	showSolarSystemEvolGUI = true; 
	defineGUI(); 
	if (exoplanetsON){
		params.ShowHideExoplanets()
	}
	controls.maxDistance = 500;

}


function showFree(){
	hideButtons();
	showControlInstructions('#FreeInstructions')

	button = d3.select('#instructionsPage3').select('#GoButton');
	button.style('display','inline-block');

	showExoplanetGUI = false; 
	showSolarSystemEvolGUI = false; 
	if (gui != null){
		gui.destroy();
	}
	gui = new dat.GUI({ width: 450 } )
	gui.add(params,'splash').name("Home");
	if (isMobile){
		resizeMobile();
	}

	if (!exoplanetsON){
		params.ShowHideExoplanets()
	}
	if (!SolarSystemON){
		params.ShowHideSolarSystem()
	}
	if (!MilkyWayON){
		params.ShowHideMilkyWay()
	}
	controls.maxDistance = 1.e10;

}


//hide the splash screen
function hideSplash(id){

    var fdur = 700.;

    var splash = d3.select(id);

    splash.transition()
        .ease(d3.easeLinear)
        .duration(fdur)
        .style("opacity", 0)

        .on("end", function(d){
            splash.style("display","none");
        })
}
//show the splash screen
function showSplash(id, op = 0.8){
    d3.selectAll("#splashButtonP").style("display","block");
    d3.selectAll(".splashButton").style("display","inline-block");
    d3.selectAll("#GoButton").style("display","none");
	hideControlInstructions()


    var fdur = 700.;

    var splash = d3.select(id);
    splash.style("display","block");

    splash.transition()
        .ease(d3.easeLinear)
        .duration(fdur)
        .style("opacity", op);

}

//for swiping the instructions
//adapted from https://bl.ocks.org/mbostock/8411383

function touchstarted() {
	dragSamples = [];
	clientX0 = d3.event.changedTouches[0].clientX;
	pageX0 = pageXOffset;
//	d3.event.preventDefault();
//	page.interrupt();
}

function touchmoved() {
	var clientX1 = d3.event.changedTouches[0].clientX,
		pageX1 = pageX0 + clientX0 - clientX1;

	page.style("-webkit-transform", "translate3d(" + -pageX1  + "px,0,0)");

	if (dragSamples.push({x: pageX1, t: Date.now()}) > 8) dragSamples.shift();
}

var direction = 0;
function touchended() {
	var s0 = dragSamples.shift(),
		s1 = dragSamples.pop(),
		t1 = Date.now(),
		x = pageXOffset;

	while (s0 && (t1 - s0.t > 350)) s0 = dragSamples.shift();

	if (s0 && s1) {
		var vx = (s1.x - s0.x) / (s1.t - s0.t);
		if (vx > .5) {
			x = Math.ceil(x / width) * width;
		} else if (vx < -.5) {
			x = Math.floor(x / width) * width;
		}
	}

	x = Math.max(0, Math.min(page.size() - 1, Math.round(x / width))) * width;
	direction = 0;
	page.transition()
		.duration(500)
		.ease(d3.easeCubic)
		.styleTween("-webkit-transform", function() {
			if (s1) {
				var i;
				var goBack = true;
				if (Math.abs(s1.x) > 0.75*width || Math.abs(vx) > 1.) {
					if (s1.x < 0) {
						if (instructionIndex != 1){
							i = d3.interpolateNumber(-(s1.x) , pageXMax);
							direction = -1;
							goBack = false;
						}
					} else{

						if (instructionIndex != 3){
							i = d3.interpolateNumber(-(s1.x) , -pageXMax);
							direction = 1;
							goBack = false;
						}
					}
				} 
				if (goBack) {
					//keep same page
					i = d3.interpolateNumber(-(s1.x) , 0);
				}
				return i && function(t) { return "translate3d(" + i(t) + "px,0,0)"; };
			}
		})
		.on("end", function(){
			if (direction != 0) {
				showInstructions(instructionIndex += direction);
				d3.selectAll(".myInstructions").style("-webkit-transform", "translate3d(0,0,0)");

			}
		})
	
}
