
function CameraDistance(origin = {"x":0, "y":0, "z":0}){
	return Math.sqrt( Math.pow(camera.position.x - origin.x , 2.) + Math.pow(camera.position.y - origin.y, 2.) + Math.pow(camera.position.z - origin.z, 2.));
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
