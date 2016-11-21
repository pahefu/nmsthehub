var colors = [ 
	[0xf1,0x7f,0x42], // YELLOW_STAR
	[255,0,0], // RED_STAR
	[0,255,0], // GREEN_STAR
	[0,0,255], // BLUE_STAR
];

var races = ['Gek','Korvax','Vykeen'];

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
	initialize: function(solarIndex,name,x,y,z, starColor){
		this.solarIndex = solarIndex;
		this.name = name;
		this.x = x;
		this.y = y;
		this.z = z;
		this.starColorIndex = starColor;
		this.mapObject = undefined;
		this.metadata = {
			race : 0
			// Include metadata here
		};
	},
	
	starColor : function() { return colors[this.starColorIndex] },
	getHexSolarId : function() { return toHex(this.solarIndex,4); },
	getRaceName : function() { return races[this.metadata.race]; },
	getPosArray : function(){ return [this.x, this.y, this.z]; },
	getPosVector : function() { return {x:this.x, y:this.y, z:this.z}; }
});

var phoriaHandler = {
	initialize: function(domId, parentDomId){

		var canvasParent = document.getElementById(parentDomId);
		var canvas = document.getElementById(domId);
		
		canvas.width = 	canvasParent.getBoundingClientRect().width;
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
		
		
		var plane = Phoria.Util.generateTesselatedPlane(8,8,0,20);
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
		}));
		
		this.camera = this.scene.camera; // Adjust the camera
		
		console.log("ENABLE THIS FOR PRODUCTION");
		//this.generateStarField(); // Generate background starfield
		
	},

	moveSelectBox : function(xyzArr){
		s = this.selectBox;
		s.translate([-s.position[0],-s.position[1],-s.position[2]]);
		s.translate(xyzArr);
		this.selectBox.position = xyzArr;
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
			color: star.starColor()
		  }
		}).translateX(star.x).translateY(star.y).translateZ(star.z);
	   
	   Phoria.Entity.debug(cube, {
		  showId: true,
		  showAxis: false,
		  showPosition: false,
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
				
				break;
			}
		}
		
		phoriaHandler.renderFrame();
		
	}
};

var uiHandler = {
	updateList : function (){
		gridHandler.setFilterText($("#listSearchKey").val());
		gridHandler.sortById();
		$("#listGridParent").html(Mustache.render($("#tabletemplate").html(), gridHandler));	
	},
	hideAll:function(){
		$("#listGridContainer").hide();
		$("#findGridParent").hide();
		$("#tradingGridParent").hide();
	},	
	showList : function (){
		this.hideAll();
		$("#listGridContainer").show();
	},
	showFind:function(){
		this.hideAll();
		$("#findGridParent").show();
	},
	showTrading:function(){
		this.hideAll();
		$("#tradingGridParent").show();
	}
	
};