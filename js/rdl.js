function toHex(str, totalChars){
	totalChars = (totalChars==undefined) ? 2 : totalChars;
	str = ('0'.repeat(totalChars)+Number(str).toString(16)).slice(-totalChars).toUpperCase();	
	return str;
}

function fromHex(str){
	return parseInt(str,16);
}

var Class = function(methods) {   
	var klass = function() {    
		this.initialize.apply(this, arguments);          
	};  
	
	for (var property in methods) { 
	   klass.prototype[property] = methods[property];
	}
		  
	if (!klass.prototype.initialize) klass.prototype.initialize = function(){};      
	
	return klass;    
};

var Star = Class({
	initialize: function(solarIndex,name,x,y,z, starColorIndex){
		this.solarIndex = solarIndex;
		this.name = name;
		this.x = x;
		this.y = y;
		this.z = z;
		this.starColorIndex = starColorIndex;
		this.mapObject = undefined;
		this.metadata = {
			race : 0,
			// Include metadata here
		};
	},
	getStarColor : function() { return colors[this.starColorIndex] },
	getHexSolarId : function() { return toHex(this.solarIndex,4); },
	getRaceName : function() { return races[this.metadata.race]; },
	getPosArray : function(){ return [this.x, this.y, this.z]; },
	getPosVector : function() { return {x:this.x, y:this.y, z:this.z}; }
});

var phoriaHandler = {
	cameraAngleH: 1.5708,
	cameraAngleV: 1.5708,
	selectedItem: undefined,
	
	initialize: function(domId, parentDomId){

		var canvasParent = document.getElementById(parentDomId);
		var canvas = document.getElementById(domId);
		
		canvas.width = 	canvasParent.getBoundingClientRect().width *0.99;
		canvas.height = document.documentElement.clientHeight;

		var scene = new Phoria.Scene();
		scene.camera.position = {x:0.0, y:5.0, z:-15.0};
		scene.perspective.aspect = canvas.width / canvas.height;
		scene.viewport.width = canvas.width;
		scene.viewport.height = canvas.height;
		this.scene = scene;
		this.renderer = new Phoria.CanvasRenderer(canvas);

		scene.graph.push(new Phoria.DistantLight());
		   
		var c = Phoria.Util.generateUnitCube(50);
		var cubeParent = Phoria.Entity.create({
			points: c.points,
			edges: c.edges,
			polygons: c.polygons,
			style:{
				color: [0xee,0xee,0xee],
				opacity: 0.15 ,
				drawmode: "wireframe"
			}
		});
		scene.graph.push(cubeParent.translateY(25));
		
		var c = Phoria.Util.generateUnitCube(1);
		var selectBox = Phoria.Entity.create({
			points: c.points,
			edges: c.edges,
			polygons: c.polygons,
			style:{
				color: [0xff,0x00,0x00],
				drawmode: "wireframe"
			},
			
		})
		selectBox.position = [8000,8000,8000]; // Infinity and beyond!
		selectBox.translate(selectBox.position);
		scene.graph.push(selectBox);
		this.selectBox = selectBox;
		
		// Plane to use as base only. Removing this on production
		/*var plane = Phoria.Util.generateTesselatedPlane(8,8,0,20);
		   scene.graph.push(Phoria.Entity.create({
			  points: plane.points,
			  edges: plane.edges,
			  polygons: plane.polygons,
			  style: {
				 drawmode: "wireframe",
				 shademode: "plain",
				 linewidth: 0.5,
				 objectsortmode: "back"
			  }
		}));*/
		
		this.camera = this.scene.camera; // Adjust the camera
		
		
		var mouse = Phoria.View.addMouseEvents(canvas, function() {
		var cpv = Phoria.View.calculateClickPointAndVector(phoriaHandler.scene, mouse.clickPositionX, mouse.clickPositionY);
		 // console.log(cpv);
		  //var intersects = Phoria.View.getIntersectedObjects(phoriaHandler.scene, cpv.clickPoint, cpv.clickVector);
		  //console.log(intersects.length !== 0 ? intersects[0].entity.id : "[none]");
	   });
		
		
		//console.log("ENABLE THIS FOR PRODUCTION");
		this.generateStarField(); // Generate background starfield
		
	},

	moveSelectBox : function(xyzArr){
		s = this.selectBox;
		s.translate([-s.position[0],-s.position[1],-s.position[2]]);
		s.translate(xyzArr);
		this.selectBox.position = xyzArr;
	},
	
	resetCameraAngle : function(){
		this.cameraAngleH = 1.5708;
		this.cameraAngleV = 1.5708;
	},
	
	doUpDownCamera :  function(up){
		this.camera.position.y+=(up) ? 10 : -10; 
		this.camera.lookat.y+=(up) ? 10 : -10; 
	},
	
	doZoom : function (forward){
		
		var lx = this.camera.lookat.x 
		var x = this.camera.position.x ;
		var ly = this.camera.lookat.y 
		var y= this.camera.position.y;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		
		var step = (!forward) ? -1 : 1;
		
		var dx = lx - x; dx*=step;
		var dy = ly - y; dy*=step;
		var dz = lz - z; dz*=step;

		this.camera.position.x += dx  /10;
		this.camera.position.y += dy /10;
		this.camera.position.z += dz /10;
		
	},
	
	rotateCamXZ : function (left){
		var variation = 0.0174533 * ((left) ? 1 : -1 );
		var lx = this.camera.lookat.x 
		var x = this.camera.position.x ;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		var dist = Math.sqrt(Math.pow(lx-x, 2) + Math.pow(lz-z, 2) );
		this.cameraAngleH -= variation;
		this.camera.position.x = lx + Math.cos(this.cameraAngleH)*dist;
		this.camera.position.z = lz + Math.sin(this.cameraAngleH)*dist;
	},
	
	rotateCamYZ : function (up){
		var variation = 0.0174533 * ((up) ? 1 : -1 );
		var ly = this.camera.lookat.y 
		var y = this.camera.position.y ;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		var dist = Math.sqrt(Math.pow(ly-y, 2) + Math.pow(lz-z, 2) );
		this.cameraAngleV -= variation;
		this.camera.position.y = ly + Math.cos(this.cameraAngleV)*dist;
		this.camera.position.z = lz + Math.sin(this.cameraAngleV)*dist;
	},
	
	renderFrame: function(){
		this.scene.modelView();
		this.renderer.render(this.scene);
	},
	
	addToScene : function (phoriaObj){
		this.scene.graph.push(phoriaObj);
	},
	
	generateStarField : function() {
		var num = 2000; var scale = 5000;
		scale = scale || 1;
		var s = scale / 2;
		var points = [];
		for (var i = 0; i < num; i++) {
			points.push({x:Math.random()*scale-s, y:Math.random()*scale-s, z:Math.random()*scale-s});
		}
		var starfield = Phoria.Entity.create({
			points: points,
			style: {
				color: [200+~~(Math.random()*55),200+~~(Math.random()*55),200+~~(Math.random()*55)],
				drawmode: "point",
				shademode: "plain",
				linewidth: 0.5,
				linescale: 200,
				objectsortmode: "back"
			}
		});
		starfield.matrix = null;
		this.scene.graph.push(starfield);
	},
	
	generateStar : function(star, parent){
		var scale = 0.25;
		if(star.solarIndex<0){
			scale = 2;
		}
		
		var c = Phoria.Util.generateSphere(scale,24, 48);
		var cube = Phoria.Entity.create({
		  id: star.name,
		  points: c.points,
		  edges: c.edges,
		  polygons: c.polygons,
		  style: {
			diffuse: 1,
			specular: 128,
			drawmode: "wireframe",
			shademode: "plain",
			linewidth:0.5,
			color: star.getStarColor()
		  }
		}).translateX(star.x).translateY(star.y).translateZ(star.z);
	   
	   Phoria.Entity.debug(cube, {
		  showId: true,
		  showAxis: false,
		  showPosition: false,
	   });
	   return cube;
	},
	
	
	
	
};

var regionHandler = {
	
	initialize : function(){
		this.stars = [];
		this.mapObjects = [];
		
		// Populate the pointers base
		var points = [
			new Star(-1,'Galaxy center',-145762.8716783917, 0.019204677335472303, -0.00010293581164446534, 0),
			new Star(0x124,'CoolJungle', 20825.72704688998, -19.202783753792243, -3.0805012641606018, 0),
			new Star(0x1b4,'LizardWorld',20818.927720684194, -12.418330391875925, 8.679687637891412, 0),
			new Star(0x00,'Hub',20811.32748949516, -16.15057093374628, -5.244964575966744, 0),
			new Star(0xFE,'Faith',20826.327571536, -15.405985004529528, -4.635964087619606, 0),
			new Star(0x17F,'SouthernLight',20797.12265919312, -43.269288425630926, 2.8450806637888504, 0),
			new Star(0x74,'FistOfTheNorth',20838.417260783983, 60.512951161021306, -3.449881518159776, 0),
			new Star(0x79,'BlackHole',20845.021929809347, 45.91480267460992, 4.886646137508365, 0)
		];
		
		// Force HUB as center of the region
		this.regionCenter = { x: points[3].x, y:points[3].y, z:points[3].z };
		
		for(var i = 0;i<points.length;i++){
			this.addStar(points[i]);
		}
		
		phoriaHandler.camera.lookat = {x: points[3].x, y:points[3].y, z:points[3].z};
		phoriaHandler.camera.position = {x: points[3].x, y:points[3].y, z:points[3].z+220};
		phoriaHandler.moveSelectBox(points[3].getPosArray());
		
		
		console.log("REMOVE THIS FOR PRODUCTION");
		phoriaHandler.camera.position = {x: 99999, y:99999, z: 99999 };
		phoriaHandler.camera.lookat = {x: 99999, y:99999, z: 99999 };

		
		phoriaHandler.renderFrame();
	},
	
	getStarByIndex: function(solarIndex){
		for(var j = 0;j<this.stars.length;j++){
			if(this.stars[j].solarIndex == solarIndex){			
				return this.stars[j];
			}
		}
		return null;
	},
	
	getDistance: function(p1, p2){
		
		var dX = p2.x - p1.x;
		var dY = p2.y - p1.y;
		var dZ = p2.z - p1.z;
	
		var distance = Math.sqrt(dX*dX + dY*dY + dZ*dZ);
		return distance;
	},
	
	addPseudoStar : function (solarIndex,name,starColorIndex, blobids, blobdistances){
		
		this.addPseudoStarTest(solarIndex,name,starColorIndex, blobids, blobdistances);
		return;
		
		var ids = blobids.split("|");
		var distances = blobdistances.replace(/,/g , ".").split("|");

		var trilatePoints = [];
		
		for(var i = 0;i<ids.length;i++){
			ids[i] = parseInt(ids[i],16);
			distances[i] = Number(distances[i]); 
			if(distances[i]<100000) { distances[i] /= 4.0; } // NMS error labeling
			
			for(var j = 0;j<this.stars.length;j++){
				if(this.stars[j].solarIndex == ids[i]){
					var tp = this.stars[j];
					trilatePoints.push({x: tp.x, y:tp.y, z:tp.z, r: distances[i]});
					break;
				}
			}
		}
		
		if(trilatePoints.length != ids.length){
			console.log("Cannot add: ", name, "with", blobids,blobdistances, "Not All ids found");
			return;
		}
				
		var pack1 = trilaterate(trilatePoints[0], trilatePoints[1], trilatePoints[2]);
		var pack2 = trilaterate(trilatePoints[0], trilatePoints[2], trilatePoints[3]);
		
		if(pack1 == null || pack2 == null){
			console.log("Cannot add: ", name, "with", blobids,blobdistances, "Trilaterate failed");
			console.log(pack1,pack2);
			
			var pack = (pack1!=null) ? pack1 : pack2;
			
			this.addStar(new Star(solarIndex,name+"test1",pack[0].x+20811.32748949516, pack[0].y-16.15057093374628,pack[0].z-5.244964575966744, 0));
			this.addStar(new Star(solarIndex,name+"test2",pack[1].x+20811.32748949516, pack[1].y-16.15057093374628,pack[1].z-5.244964575966744, 0));
			
			return;

		}

		var minDistance = 99999.9;
		var minPoints = [undefined, undefined];
		var localDistance = 0;	
		
		for(var i = 0;i < pack1.length;i++){
			for(var j = 0;j<pack1.length;j++){
				if(i==j){ continue;	}
				localDistance = this.getDistance(pack1[i], pack1[j]);
				if (localDistance<minDistance){
					minDistance = localDistance;
					minPoints[0] = pack1[i]; minPoints[1] = pack1[j];
				}
			}
			for(var j = 0;j<pack2.length;j++){
				localDistance = this.getDistance(pack1[i], pack2[j]);
				if (localDistance<minDistance){
					minDistance = localDistance;
					minPoints[0] = pack1[i]; minPoints[1] = pack2[j];
				}
			}
			
		}

		var middlePoint = { 
			x: (minPoints[0].x+minPoints[1].x)/2 + 20811.32748949516,
			y: (minPoints[0].y+minPoints[1].y)/2 + -16.15057093374628,
			z: (minPoints[0].z+minPoints[1].z)/2 + -5.244964575966744
		};
		
		this.addStar(new Star(solarIndex,name,middlePoint.x, middlePoint.y,middlePoint.z, 0));
		
	},
	
	
	addPseudoStarTest : function (solarIndex,name,starColorIndex, blobids, blobdistances){
		var ids = blobids.split("|");
		var distances = blobdistances.replace(/,/g , ".").split("|");

		var trilatePoints = [];
		
		for(var i = 0;i<ids.length;i++){
			ids[i] = parseInt(ids[i],16);
			distances[i] = Number(distances[i]); 
			if(distances[i]<100000) { distances[i] /= 4.0; } // NMS error labeling
			
			for(var j = 0;j<this.stars.length;j++){
				if(this.stars[j].solarIndex == ids[i]){
					var tp = this.stars[j];
					trilatePoints.push({x: tp.x, y:tp.y, z:tp.z, r: distances[i]});
					break;
				}
			}
		}
		
		if(trilatePoints.length != ids.length){
			console.log("Cannot add: ", name, "with", blobids,blobdistances, "Not All ids found");
			return;
		}
				
		var pack1 = trilaterate(trilatePoints[0], trilatePoints[1], trilatePoints[2]);
		var pack2 = trilaterate(trilatePoints[0], trilatePoints[2], trilatePoints[3]);	
		var pack3 = trilaterate(trilatePoints[1], trilatePoints[2], trilatePoints[3]);
		var pack4 = trilaterate(trilatePoints[0], trilatePoints[1], trilatePoints[3]);
		
		var results = [];

		if(pack1!=null){ pack1.forEach(function(a){ results.push(a) });	}
		if(pack2!=null){ pack2.forEach(function(a){ results.push(a) });	}
		if(pack3!=null){ pack3.forEach(function(a){ results.push(a) });	}
		if(pack4!=null){ pack4.forEach(function(a){ results.push(a) });	}

		results.forEach(function(r){
			r.error1 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[0])) - distances[0]);
			r.error2 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[1]))*4.0 - distances[1]*4.0);
			r.error3 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[2]))*4.0 - distances[2]*4.0);
			r.error4 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[3]))*4.0 - distances[3]*4.0);		
			r.errormean = (r.error1+r.error2+r.error3+r.error4)/4.0;			
		});
		
		results.sort(function(a,b){
			if(a.errormean <b.errormean){
				return -1;
			}
			return 1;
		});

		var i = 0;
		results.forEach(function(r){
			if(i==0){
				regionHandler.addStar(new Star(solarIndex,name,r.x+20811.32748949516, r.y-16.15057093374628,r.z-5.244964575966744, (r==results[0])?1 : 0));
			}
			
			i++;
		});
		
		
		return;

	},
	
	
	
	addStar : function(star){
		
		star.x-=this.regionCenter.x;
		star.y-=this.regionCenter.y;
		star.z-=this.regionCenter.z;
		
		// Create new object
		var mapObject = phoriaHandler.generateStar(star, undefined);
		phoriaHandler.addToScene(mapObject);
		star.mapObject = mapObject;
		this.mapObjects.push(mapObject);
		this.stars.push(star);
	},
	
	lookAt : function(solarIndex){
		solarIndex = Number(solarIndex);
		if (isNaN(solarIndex)){
			return;
		}
		
		for(var i = 0;i<this.stars.length;i++){
			if(this.stars[i].solarIndex == solarIndex){
				var s = this.stars[i];
				phoriaHandler.camera.lookat = {x: s.x, y:s.y, z:s.z};
				phoriaHandler.camera.position = {x: s.x, y:s.y, z:s.z+220};

				phoriaHandler.moveSelectBox(s.getPosArray());
				phoriaHandler.resetCameraAngle();
				
				break;
			}
		}
		
		phoriaHandler.renderFrame();
	}
};

var uiHandler = {
	
	initialize : function(systemGridFilterBox){
		this.systemGrid = new GridHandler(regionHandler.stars);
		this.materials = new GridHandler(materials.data);
		
		if (systemGridFilterBox!=null){
			$(systemGridFilterBox).keyup(function(event){
				uiHandler.updateSystemGrid();
			});
		}
		
	},
	
	updateSystemGrid : function (){
		this.systemGrid.setFilterText($("#listSearchKey").val());
		this.systemGrid.sortById("solarIndex");
		this.systemGrid.resetPages();
		$("#listGridParent").html(Mustache.render($("#systemGridTemplate").html(), this.systemGrid));	
	},
	
	hideAll:function(){
		$("#listGridContainer").hide();
		$("#findGridParent").hide();
		$("#materialsGridParent").hide();
	},	
	showList : function (){
		this.hideAll();
		$("#listGridContainer").show();
	},
	showFind:function(){
		this.hideAll();
		$("#findGridParent").show();
	},
	showMaterials:function(){
		this.hideAll();
		$("#materialsGridParent").show();
	}
	
};
