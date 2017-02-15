// Created by pahefu @ 2017 
// Update to include NMS Gamepedia Wiki
// Update to include performance updates (twice)


// class definition, reusage later
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

// HMS Variable instances
var nms_platforms = {
	PLAT_PS4 : 1,
	PLAT_PC : 2
}

// Stars and handlers

var Star = Class({
	initialize: function(solarIndex,name,x,y,z, starColorIndex,  raceId){
		this.solarIndex = solarIndex;
		this.x = x;
		this.y = y;
		this.z = z;
		this.starColorIndex = starColorIndex;
		this.mapObject = undefined;
		this.metadata = {
			race : raceId,
			name : name,
			fullyExplored : false
			// Include further metadata here
		};
	},
	getBgColor : function () { return "background-color:rgb("+this.getStarColor()+");"; },
	getStarColor : function() { return colors[this.starColorIndex] },
	getHexSolarId : function() { return toHex(this.solarIndex,4); },
	getRaceName : function() { return races[this.metadata.race]; },
	getPosArray : function(){ return [this.x, this.y, this.z]; },
	getPosVector : function() { return {x:this.x, y:this.y, z:this.z}; },
	getName : function(){
		if(settingsPanelApp.current_platform == nms_platforms.PLAT_PS4){
			return this.metadata.name.ps4;
		}
		return this.metadata.name.pc;
	}
});

var phoriaHandler = {
	cameraAngleH: 1.5708,
	cameraAngleV: 1.5708,
	selectedItem: undefined,
	
	initialize: function(domId, parentDomId){

		var canvasParent = document.getElementById(parentDomId);
		var canvas = document.getElementById(domId);
		
		canvas.width = canvasParent.getBoundingClientRect().width *0.99;
		
		var brandHeight = $("#brand").height();
		var cliHeight = document.documentElement.clientHeight;
		
		canvas.height =  (cliHeight - brandHeight) * 0.95;

		var scene = new Phoria.Scene();
		scene.camera.position = {x:0.0, y:5.0, z:-15.0};
		scene.perspective.aspect = canvas.width / canvas.height;
		scene.viewport.width = canvas.width;
		scene.viewport.height = canvas.height;
		this.scene = scene;
		this.renderer = new Phoria.CanvasRenderer(canvas);

		scene.graph.push(new Phoria.DistantLight());
		  
		// Region enclosure cube
		var c = Phoria.Util.generateUnitCube(50);
		var cubeParent = Phoria.Entity.create({
			points: c.points,
			edges: c.edges,
			polygons: c.polygons,
			style:{
				color: [0xee,0xee,0xee],
				//opacity: 0.15 ,
				drawmode: "wireframe"
			}
		});
		scene.graph.push(cubeParent.translateY(25));
		
		// Select box
		var c = Phoria.Util.generateUnitCube(1);
		var selectBox = Phoria.Entity.create({
			points: c.points,
			edges: c.edges,
			polygons: c.polygons,
			style:{
				color: [0xff,0x00,0x00],
				drawmode: "wireframe"
			},
			
		});
		selectBox.position = [8000,8000,8000]; // Infinity and beyond!
		selectBox.translate(selectBox.position);
		scene.graph.push(selectBox);
		this.selectBox = selectBox;
		
		// Camera
		this.camera = this.scene.camera; // Adjust the camera
		
		// Mouse actions
		var mouse = Phoria.View.addMouseEvents(canvas, function() {
			var cpv = Phoria.View.calculateClickPointAndVector(phoriaHandler.scene, mouse.clickPositionX, mouse.clickPositionY);
		});

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
		this.renderFrame();
	},
	
	doZoom : function (forward){
		
		var lx = this.camera.lookat.x 
		var x = this.camera.position.x ;
		var ly = this.camera.lookat.y 
		var y = this.camera.position.y;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		
		var step = (!forward) ? -1 : 1;
		
		var dx = lx - x; dx*=step;
		var dy = ly - y; dy*=step;
		var dz = lz - z; dz*=step;

		this.camera.position.x += dx  /10;
		this.camera.position.y += dy /10;
		this.camera.position.z += dz /10;
		
		this.renderFrame();
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
		this.renderFrame();
	},
	
	rotateCamXZDegree : function(degrees){
		var variation = 0.0174533 * degrees;
		var lx = this.camera.lookat.x 
		var x = this.camera.position.x ;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		var dist = Math.sqrt(Math.pow(lx-x, 2) + Math.pow(lz-z, 2) );
		this.cameraAngleH = variation;
		this.camera.position.x = lx + Math.cos(this.cameraAngleH)*dist;
		this.camera.position.z = lz + Math.sin(this.cameraAngleH)*dist;
		this.renderFrame();
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
		this.renderFrame();
	},
	rotateCamYZDegree : function (degrees){
		var variation = 0.0174533 * degrees;
		var ly = this.camera.lookat.y 
		var y = this.camera.position.y ;
		var lz = this.camera.lookat.z 
		var z = this.camera.position.z;
		var dist = Math.sqrt(Math.pow(ly-y, 2) + Math.pow(lz-z, 2) );
		this.cameraAngleV = variation;
		this.camera.position.y = ly + Math.cos(this.cameraAngleV)*dist;
		this.camera.position.z = lz + Math.sin(this.cameraAngleV)*dist;
		this.renderFrame();
	},
	
	renderFrame: function(){
		if(this.scene !=undefined){
			this.scene.modelView();
			this.renderer.render(this.scene);
		}
	},
	
	addToScene : function (phoriaObj){
		if(this.scene != undefined){
			this.scene.graph.push(phoriaObj);
		}
	},
	
	generateStarField : function() {
		var num = 500; var scale = 5000;
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
		
		var c = Phoria.Util.generateSphere(scale,3, 6);
		var cube = Phoria.Entity.create({
		  id: star.getName(),
		  points: c.points,
		  edges: c.edges,
		  polygons: c.polygons,
		  style: {
			diffuse: 1,
			drawmode: "wireframe",
			linewidth:0.5,
			color: star.getStarColor()
		  }
		}).translateX(star.x).translateY(star.y).translateZ(star.z);
	   
	   Phoria.Entity.debug(cube, {
		  showId: true,
		  showAxis: false,
		  showPosition: false,
		  fillStyle : "#999999"
	   });
	   return cube;
	}
	
};

var regionHandler = {
	
	initialize : function(){
		this.stars = [];
		this.mapObjects = [];
		
		// Populate the pointers base
		var points = [
			new Star(0,{ps4 :'Galaxy center', pc: 'Galaxy center'},-145762.8716783917, 0.019204677335472303, -0.00010293581164446534, 0,0),
			new Star(0x124,{ps4 :'CoolJungle', pc: 'CoolJungle'}, 20825.72704688998, -19.202783753792243, -3.0805012641606018, 3,2),
			new Star(0x1b4,{ps4 :'LizardWorld', pc: 'LizardWorld'},20818.927720684194, -12.418330391875925, 8.679687637891412, 3,2),
			new Star(0x999,{ps4 :'Hub', pc: 'Hub'},20811.32748949516, -16.15057093374628, -5.244964575966744, 1,0),
			new Star(0xFE,{ps4 :'Faith', pc: 'Faith'},20826.327571536, -15.405985004529528, -4.635964087619606, 3,1),
			new Star(0x17F,{ps4 :'SouthernLight', pc: 'SouthernLight'},20797.12265919312, -43.269288425630926, 2.8450806637888504, 3,2),
			new Star(0x74,{ps4 :'FistOfTheNorth', pc: 'FistOfTheNorth'},20838.417260783983, 60.512951161021306, -3.449881518159776, 0,1),
			new Star(0x79,{ps4 :'BlackHole', pc: 'BlackHole'},20845.021929809347, 45.91480267460992, 4.886646137508365, 0,2)
		];
		
		// Force HUB as center of the region
		this.regionCenter = { x: points[3].x, y:points[3].y, z:points[3].z };
		
		for(var i = 0;i<points.length;i++){
			this.addStar(points[i]);
		}
		
		if(phoriaHandler.scene!=undefined){
			phoriaHandler.camera.lookat = {x: points[3].x, y:points[3].y, z:points[3].z};
			phoriaHandler.camera.position = {x: points[3].x, y:points[3].y, z:points[3].z+220};
			phoriaHandler.moveSelectBox(points[3].getPosArray());
			phoriaHandler.camera.position = {x: 9999, y:9999, z: 9999 };
			phoriaHandler.camera.lookat = {x: 0, y:0, z: 0 };
			// Try to render less, to speed first time loading
			//phoriaHandler.renderFrame();
		}

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
	
	addStar : function(star){
		star.x-=this.regionCenter.x;
		star.y-=this.regionCenter.y;
		star.z-=this.regionCenter.z;
		
		// Create new object
		var mapObject = phoriaHandler.generateStar(star, undefined);
		star.mapObject = mapObject;
		phoriaHandler.addToScene(mapObject);
		this.stars.push(star);
	},
	
	addPseudoStar: function (solarIndex,name,starColorIndex, raceId, blobids, blobdistances){
		var ids = blobids.split("|");
		var distances = blobdistances.replace(/,/g , ".").split("|");
		var trilatePoints = [];
		var NMS_SCALE_DIFFERENCE = 4.0;
		
		for(var i = 0;i<ids.length;i++){
			ids[i] = parseInt(ids[i],16);
			distances[i] = Number(distances[i]); 
			if(distances[i]<100000) { distances[i] /= NMS_SCALE_DIFFERENCE; } // NMS error labeling
			
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
			r.error2 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[1]))*NMS_SCALE_DIFFERENCE - distances[1]*NMS_SCALE_DIFFERENCE);
			r.error3 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[2]))*NMS_SCALE_DIFFERENCE - distances[2]*NMS_SCALE_DIFFERENCE);
			r.error4 = Math.abs(regionHandler.getDistance(r,regionHandler.getStarByIndex(ids[3]))*NMS_SCALE_DIFFERENCE - distances[3]*NMS_SCALE_DIFFERENCE);		
			r.errormean = (r.error1+r.error2+r.error3+r.error4)/NMS_SCALE_DIFFERENCE;			
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
				regionHandler.addStar(new Star(solarIndex,name,r.x+20811.32748949516, r.y-16.15057093374628,r.z-5.244964575966744, starColorIndex, raceId));
			}
			i++;
		});
		
		return;
	},

	updateLabels : function (labelType){
		for(var i = 0;i<this.stars.length;i++){
			var localStr = " ";
			switch(labelType){
				case 0: localStr = " "; break;
				case 1: localStr = this.stars[i].getName(); break;
				case 2: localStr = this.stars[i].getHexSolarId(); break;
				case 3: localStr = this.stars[i].getHexSolarId() + " - " + this.stars[i].getName(); break;
			}
			
			this.stars[i].mapObject.id= localStr;
		}
		phoriaHandler.renderFrame();
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

/* UI Elements 
	// Usage as element changes
*/

var uiSelectionApp = new Vue({
	el: '#uiSelectionApp',
	data: {
		isTab : true,
		viewSystemList : true,
		viewMaterials: false,
		viewSettings: false,
		viewChangeCallbacks : Array(),
		
	},
	methods:{
		runCallbacks : function(){
			for(var i = 0; i < this.viewChangeCallbacks.length; i++){
				this.viewChangeCallbacks[i](); // Run it
			}
			systemSelectionApp.viewActive = this.viewSystemList;
			materialSelectionApp.viewActive = this.viewMaterials;
			settingsPanelApp.viewActive = this.viewSettings;
		},
		showSystemList : function(){
			this.viewSystemList = true;
			this.viewMaterials = false;
			this.viewSettings = false;
			this.runCallbacks();
		},
		showMaterials : function(){
			this.viewSystemList = false;
			this.viewMaterials = true;
			this.viewSettings = false;
			this.runCallbacks();
		},
		showSettings : function(){
			this.viewSystemList = false;
			this.viewMaterials = false;
			this.viewSettings = true;
			this.runCallbacks();
		}
	}
	
});

var settingsPanelApp = new Vue({
	el: '#settingsPanelApp',
	data: {
		viewActive: false,
		isTab : true,
		current_platform : nms_platforms.PLAT_PS4,
		items_per_page : 5,
		changeCallbacks : [],
	},
	methods:{
		runCallbacks : function () {
			for(var i = 0; i < this.changeCallbacks.length; i++){
				this.changeCallbacks[i](); // Run it
			}
		},
		applySettings : function(){
			this.runCallbacks();
		}
	}
	
});

var systemSelectionApp = new Vue({
	el: "#systemSelectionApp",
	data:{
		viewActive: true,
		isTab : true,
		systemFilter : "",
		visibleSystems : [],
		currentPage : 0,
		currentHumanPage : 1,
		maxPages : 1,
		maxPerPage : settingsPanelApp.items_per_page,
		wikiLoading : false
	},
	methods:{
		maxPerPageChange : function (){
			this.currentPage = 0;
			this.maxPerPage = settingsPanelApp.items_per_page;
			this.refreshSystems();
		},
		prevPage : function(){
			if (this.currentPage>0){
				this.currentPage--;
			}
			this.refreshSystems();
		},
		nextPage : function(){
			if (this.currentPage< this.maxPages-1){
				this.currentPage++;
			}
			this.refreshSystems();
		},
		
		dynamicSort : function (property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}
		},
		sortById : function (propertyName){
			this.privateData = this.privateData.sort(this.dynamicSort(propertyName));	
		},	 
		applyFilter : function(){
			// Apply filters then gather info from current subview
			
			this.currentPage = 0; // Reset to 0
			var localData = regionHandler.stars.slice();
			
			var localFilter = this.systemFilter.toLowerCase();
			
			var result = [];
			for(var i = 0;i<localData.length;i++){

				if(	localData[i].getName().toLowerCase().includes(localFilter) ||
					localData[i].getHexSolarId().toLowerCase().includes(localFilter) ||
					("race:"+(localData[i].getRaceName().toLowerCase())[0]) == (localFilter) ||
					"color:"+(systemColors[localData[i].starColorIndex]) == (localFilter)
					) {
					result.push(localData[i]);
				}

			}
			
			this.privateData = result;
			this.sortById("solarIndex");
			this.refreshSystems();
		},
		refreshSystems : function(){
			this.maxPages = Math.ceil(this.privateData.length / this.maxPerPage);
			this.visibleSystems = this.privateData.slice(this.currentPage*this.maxPerPage, this.currentPage*this.maxPerPage +this.maxPerPage);
		},
		showSystem : function(element){
			if(element.target.id.indexOf("#sys_"!=-1)){
				var i = Number(element.target.id.replace("#sys_",""));
				regionHandler.lookAt(i);
			}
		}
	}
});
systemSelectionApp.privateData = []; // Outside values, not watched by apps (a lot faster, low low memory footprint)
settingsPanelApp.changeCallbacks.push(systemSelectionApp.maxPerPageChange);

var materialSelectionApp = new Vue({
	el: "#materialSelectionApp",
	data:{
		viewActive: false,
		isTab : true,
		systemFilter : "",
		visibleSystems : [],
		currentPage : 0,
		currentHumanPage : 1,
		maxPages : 1,
		maxPerPage : settingsPanelApp.items_per_page,
		selectedMat: undefined,
		materials : []
	},
	methods:{
		
		prevPage : function(){
			if (this.currentPage>0){
				this.currentPage--;
			}
			this.refreshSystems();
		},
		nextPage : function(){
			if (this.currentPage< this.maxPages-1){
				this.currentPage++;
			}
			this.refreshSystems();
		},
		
		dynamicSort : function (property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}
		},
		sortById : function (propertyName){
			this.privateData = this.privateData.sort(this.dynamicSort(propertyName));	
		},	 
		
		refreshSystems : function(){
			this.maxPages = Math.ceil(this.privateData.length / this.maxPerPage);
			this.visibleSystems = this.privateData.slice(this.currentPage*this.maxPerPage, this.currentPage*this.maxPerPage +this.maxPerPage);
		},

		selectMaterial : function(element){
			if(element.target.id.indexOf("#mat_"!=-1)){
				var i = Number(element.target.id.replace("#mat_",""));
				this.selectedMat = this.materials[i];
				this.privateData = this.selectedMat.sources;
				this.sortById("solarIndex");
				this.refreshSystems();
			}
		},
		showSystem : function(element){
			if(element.target.id.indexOf("#matsys_"!=-1)){
				var i = Number(element.target.id.replace("#matsys_",""));
				regionHandler.lookAt(i);
			}
		}
	}
});
materialSelectionApp.privateData = []; // Outside values, not watched by apps

var drawPanelApp = new Vue({
	el: "#drawPanelApp",
	data:{
		horizontalAngle: 90,
		verticalAngle: 90,
		labelType: 1
	},
	methods:{
		
		updateCameraRotationH : function(){
			phoriaHandler.rotateCamXZDegree(this.horizontalAngle);
		},
		updateCameraRotationV : function(){
			phoriaHandler.rotateCamYZDegree(this.verticalAngle);
		},
		updateLabels: function(){
			regionHandler.updateLabels(Number(this.labelType));
		}

	}
});
settingsPanelApp.changeCallbacks.push(drawPanelApp.updateLabels);

/* Auto Bindings */

$("#systemFilterTexBox").keyup(function(event){
	systemSelectionApp.applyFilter();
});
