// Created by pahefu @ 2017 
// Update to include performance updates (even more)



var colors = [
	[232,213,49], // YELLOW_STAR
	[246,108,98], // RED_STAR
	[62,143,65], // GREEN_STAR
	[9,102,175], // BLUE_STAR
];
var systemColors = "yrgb";
var systemRaces = "gkv";
var races = ['Gek','Korvax','Vy\'keen'];

function toHex(str, totalChars){
	totalChars = (totalChars==undefined) ? 2 : totalChars;
	str = ('0'.repeat(totalChars)+Number(str).toString(16)).slice(-totalChars).toUpperCase();	
	return str;
}

function fromHex(str){
	return parseInt(str,16);
}

var materials = {
	
	data : [
		{ name: "Antrium", id:0, tool:"None", allPlanets: true, notes:"Bright flowers in any planet", sources:[] },
		{ name: "Candensium", id:1,tool:"None", allPlanets: false, notes:"",sources:[] },
		{ name: "Coprite",id:2,tool:"None",allPlanets: true, notes:"Feed animals, grab the poo",sources:[] },
		{ name: "Coryzagen",id:3,tool:"HazmatGloves",allPlanets: false, notes:"",sources:[] },
		{ name: "Cymatygen",id:4,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Fervidium",id:5,tool:"HazmatGloves",allPlanets: false, notes:"",sources:[] },
		{ name: "Mordite",id:6,tool:"None",allPlanets: true, notes:"Kill animals",sources:[] },
		{ name: "Pugneum",id:7,tool:"None",allPlanets: true, notes:"Kill sentinels",sources:[] },
		{ name: "Rubeum",id:8,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Spadonium",id:9,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Rigogen",id:10,tool:"HazmatGloves",allPlanets: false, notes:"",sources:[] },
		{ name: "Temerium",id:11,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Tropheum",id:12,tool:"None",allPlanets: true, notes:"Destroy pirate ships",sources:[] },
		{ name: "Viridium",id:13,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "K. Converg. Cube",id:14,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Sac Venom",id:15,tool:"None",allPlanets: false, notes:"",sources:[] },
		{ name: "Vy'keen dagger",id:16,tool:"None",allPlanets: false, notes:"",sources:[] }
	],
	
	getMaterialByIndex : function(materialIndex){
		var result = null;
		for(var i = 0;i<this.data.length;i++){
			if(this.data[i].id == materialIndex){
				return this.data[i];
			}
		}
		return result;
	},
	
	addSource : function(materialIndex, solarIndex, inStation,notes){
		for(var i = 0;i<this.data.length;i++){
			if(this.data[i].id == materialIndex){
				var system = regionHandler.getStarByIndex(solarIndex);
				var isValidStar = (system!=null);
				var localName = (system!=null) ? system.name : ("Unknown");
								
				this.data[i].sources.push({
					solarIndexHex: toHex(solarIndex,4),
					solarIndex: solarIndex,
					knownStar: isValidStar,
					name : localName,
					notes: notes,
					inStation: inStation
				});	
			}
		}
	}
}

var loadMetaData = function(){
}

function loadDataFromWiki(){
	systemSelectionApp.wikiLoading = true;
	
	$.ajax({ 
		
		url: 'https://nomanssky.gamepedia.com/api.php?action=parse&format=json&prop=wikitext&page=HubMSData',
		dataType: 'jsonp',
		success: function(data) {
		
			data = data.parse.wikitext["*"];
			var items = data.split("hubentry");

			for(var i = 0;i<items.length;i++){
				if(items[i].indexOf("Info Type")<0){ continue;}
				var lines = items[i].split("\n").filter(function(a){ return (a.indexOf("|") ==0 && a.indexOf("|-")<0 && a.indexOf("|}")<0);});
				
				var regionId = 1;
				var systemSolarIndex = 0;	
				var namePack = {
					ps4 : "",
					pc : ""
				};					
				var systemColor = "";
				var systemRace = "";
				var distanceIds = null;
				var distanceValues = null;
				var metadata = {};
				
				var parsingOk = true;
				for (var j = 0;j<lines.length;j++){
					var values = lines[j].split("|").filter(function(a){ return (a.length>=1 && a.indexOf("=")<0) });
					var key = values[0];
					try{
						for(var k = 0;k<values.length;k++){
							
							switch(key){
								case "SystemData" :  
									regionId = Number(values[1]);
									systemSolarIndex = fromHex(values[2]);

									namePack.ps4 = values[3];
									namePack.pc = values[4];
									systemColor = systemColors.indexOf(values[5].toLowerCase()[0]); 
									systemRace = systemRaces.indexOf(values[6].toLowerCase()[0]); 
									
								break;
								
								case "DistanceIds": 
									distanceIds = [values[1],values[2],values[3], values[4]];
								break;
								
								case "DistanceValues" :
									distanceValues = [values[1],values[2],values[3], values[4]];
								break;
								
								case "SystemDescription" : 
									metadata.SystemDescription = values[1];
								break;
								
								case "SystemTags" : 
									metadata.SystemTags = values[1];
								break;
								
								case "SystemPage" : 
									metadata.SystemPage = values[1];
								break;
							}
						}
						
					}catch(err){
						parsingOk = false;
						console.log("Cannot parse system: ", err);
					}
				}
				
				if(parsingOk){
					regionHandler.addPseudoStar(regionId,systemSolarIndex,namePack,systemColor,systemRace, distanceIds, distanceValues);
				}
				
			}

			systemSelectionApp.applyFilter();
			systemSelectionApp.wikiLoading = false;
		}
	});
	
	
	
}
