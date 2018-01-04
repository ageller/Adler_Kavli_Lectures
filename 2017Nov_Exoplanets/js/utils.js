
function CameraDistance(origin = new THREE.Vector3(0., 0., 0.)){
	return camera.position.distanceTo(origin);
}


//after the data is loaded, include the buttons
function clearloading(){

    d3.select("#ContentContainer").style("visibility","visible")

    loaded = true;
    console.log("loaded")
    d3.select("#loader").style("display","none")

    var buttons = d3.select("#splashdiv5");
    buttons.select("#loader").remove();

	buttons.append('button')
		.attr('class', 'splashButton')
		.attr('onclick','runExop()')
		.html('Exoplanet Discoveries');
	buttons.append('button')
		.attr('class', 'splashButton')
		.attr('onclick','runSSEvol()')
		.html('Solar System Evolution');
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

    var fdur = 700.;

    var splash = d3.select(id);
    splash.style("display","block");

    splash.transition()
        .ease(d3.easeLinear)
        .duration(fdur)
        .style("opacity", op);

}
