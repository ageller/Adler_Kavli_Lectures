
function CameraDistance(origin = new THREE.Vector3(0., 0., 0.)){
	return camera.position.distanceTo(origin);
}


//after the data is loaded, include the buttons
function clearloading(){

    d3.select("#ContentContainer").style("visibility","visible")

    loaded = true;
    console.log("loaded")
    d3.select("#loader").style("display","none")

    var loader = d3.select(".instructionsContent").select("#loader");
    loader.selectAll("span").remove();
}

function resizeInstructions(){
	var h = window.innerHeight;
    d3.selectAll(".instructionsContent").style("height", h - 250. + 'px')
    if (h < 450){
		d3.selectAll("#credits").style("position","relative");
    } else {
		d3.selectAll("#credits").style("position","absolute");

    }
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
	var i;
	var instructions = document.getElementsByClassName("myInstructions");
	var dots = document.getElementsByClassName("dot");

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
	instructions[instructionIndex-1].style.display = "block";  
	dots[instructionIndex-1].className += " active";
}

function swipeInstructions(id1, id2){
	var fdur = 200.;

	var ins1 = d3.select(id1);
	var ins2 = d3.select(id2);

	console.log(id1, id2, ins1, ins2)
	ins1.transition()
		.ease(d3.easeLinear)
		.duration(fdur)
		.style("opacity", 0)

		.on("end", function(d){
			ins1.style("display","none");
		})

	ins2.style("display","block");

	ins2.transition()
		.ease(d3.easeLinear)
		.duration(fdur)
		.style("opacity", op);
 

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

	button = d3.select('#instructionsPage3').select('.instructionsContent');
	console.log(button)
	button.append('button')
		.attr('class', 'splashButton')
		.attr('id', 'GoButton')
		.attr('onclick','runExop()')
		.html('Go!');
}
function runExop(){
	showExoplanetGUI = true; 
	showSolarSystemEvolGUI = false; 
	defineGUI(); 
	if (!exoplanetsON){
		params.ShowHideExoplanets()
	}
	hideSplash("#splash");
	controls.maxDistance = 1.e10;

}

function showSSEvol(){
	hideButtons();
	showControlInstructions('#SSInstructions')

	button = d3.select('#instructionsPage3').select('.instructionsContent');
	console.log(button)
	button.append('button')
		.attr('class', 'splashButton')
		.attr('id', 'GoButton')
		.attr('onclick','runSSEvol()')
		.html('Go!');
}
function runSSEvol(){
	showExoplanetGUI = false; 
	showSolarSystemEvolGUI = true; 
	defineGUI(); 
	if (exoplanetsON){
		params.ShowHideExoplanets()
	}
	hideSplash("#splash");
	controls.maxDistance = 500;

}


function showFree(){
	hideButtons();
	showControlInstructions('#FreeInstructions')

	button = d3.select('#instructionsPage3').select('.instructionsContent');
	console.log(button)
	button.append('button')
		.attr('class', 'splashButton')
		.attr('id', 'GoButton')
		.attr('onclick','runFree()')
		.html('Go!');
}
function runFree(){
	
	showExoplanetGUI = false; 
	showSolarSystemEvolGUI = false; 
	if (gui != null){
		gui.destroy();
	}
	gui = new dat.GUI({ width: 450 } )
	gui.add(params,'splash').name("Home");

	if (!exoplanetsON){
		params.ShowHideExoplanets()
	}
	if (!SolarSystemON){
		params.ShowHideSolarSystem()
	}
	if (!MilkyWayON){
		params.ShowHideMilkyWay()
	}
	hideSplash("#splash");
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
    d3.selectAll("#GoButton").remove();
	hideControlInstructions()


    var fdur = 700.;

    var splash = d3.select(id);
    splash.style("display","block");

    splash.transition()
        .ease(d3.easeLinear)
        .duration(fdur)
        .style("opacity", op);

}
