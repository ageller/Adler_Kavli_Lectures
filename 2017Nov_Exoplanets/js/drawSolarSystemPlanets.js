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

function clearOrbitLines() {
	orbitLines.forEach( function( l, i ) {
		l.geometry.dispose();
		scene.remove( l );
	} );
	orbitLines = [];
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
