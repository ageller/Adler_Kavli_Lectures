
function CameraDistance(origin = new THREE.Vector3(0., 0., 0.)){
	return camera.position.distanceTo(origin);
}


//check if the data is loaded
function clearloading(){
    // stop spin.js loader
    //spinner.stop();

    d3.select("#ContentContainer").style("visibility","visible")

    loaded = true;
    console.log("loaded")
    d3.select("#loader").style("display","none")

    var buttons = d3.select("#splashdiv5");

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
	hideSplash();
	controls.maxDistance = 2.e10;

}
function runSSEvol(){
	showExoplanetGUI = false; 
	showSolarSystemEvolGUI = true; 
	defineGUI(); 
	if (exoplanetsON){
		params.ShowHideExoplanets()
	}
	hideSplash();
	controls.maxDistance = 500;

}

//hide the splash screen
function hideSplash(){
    if (loaded){
        helpMessage = 0;
        var fdur = 700.;

        var splash = d3.select("#splash");

        splash.transition()
            .ease(d3.easeLinear)
            .duration(fdur)
            .style("opacity", 0)

            .on("end", function(d){
                splash.style("display","none");
            })
    }
}

//show the splash screen
function showSplash(){
    if (loaded){
        helpMessage = 1;
        var fdur = 700.;

        var splash = d3.select("#splash");
        splash.style("display","block");

        splash.transition()
            .ease(d3.easeLinear)
            .duration(fdur)
            .style("opacity", 0.8);
    }
    
}
