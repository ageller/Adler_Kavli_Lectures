
function CameraDistance(origin = new THREE.Vector3(0., 0., 0.)){
	return camera.position.distanceTo(origin);
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
