// Created by pahefu @ 2017 
// Update to include performance updates (even more)

var colors = [
	[232,213,49], // YELLOW_STAR
	[246,108,98], // RED_STAR
	[62,143,65], // GREEN_STAR
	[9,102,175], // BLUE_STAR
];

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

	/* Materials metadata */

	materials.addSource(1,0x12b, false,"");
	materials.addSource(5,0x12b, false,"");
	materials.addSource(8,0x184, false,"");
	materials.addSource(9,0x150, false,"");
	materials.addSource(9,0x203, false,"");	
	materials.addSource(10,0xdd, false,"");
	materials.addSource(12,0x12b, false,"");
	materials.addSource(13,0x163, true,"Buy at Merchants");
	materials.addSource(14,0x203,false,"");
	materials.addSource(15,0x11c,true,"Buy at Merchants");
	materials.addSource(16,0xdd,true,"Buy at Merchants");
	
	// Show the info to the current values
	materialSelectionApp.materials = materials.data;	
}

function loadDataFromWiki(){
	systemSelectionApp.wikiLoading = true;
	$.ajax({ 
		
		url: 'https://nomanssky.gamepedia.com/api.php?action=parse&format=json&prop=wikitext&page=HubMSData',
		dataType: 'jsonp',
		success: function(data) {
			var externalData = data.parse.wikitext["*"].split("\n\n");
			var systemDataRe = new RegExp("([A-Za-z]+:) ([0-9A-Fa-f]+) \"([^]+)\" ([A-Za-z]+) ([A-Za-z]+)");
			var systemColors = "yrgb";
			var systemRaces = "gkv";
			for(var i = 0; i< externalData.length;i++){
				if(externalData[i].indexOf("SystemData")>=0){ // Only if data present
					var systemInfo = externalData[i].split("\n");
					
					var line_1 = systemDataRe.exec(systemInfo[0]);
					if(line_1!=null){
						var offset = 2;
						systemSolarIndex = fromHex(line_1[offset++]);
						systemName = line_1[offset++];
						systemColor = systemColors.indexOf(line_1[offset++].toLowerCase()[0]); 
						systemRace = systemRaces.indexOf(line_1[offset++].toLowerCase()[0]);
						//console.log(systemSolarIndex, systemName, systemColor, systemRace);
						
						var distanceIds = systemInfo[1].split(" ").slice(1).join("|");
						var distanceValues = systemInfo[2].split(" ").slice(1).join("|");
						
						//console.log(distanceIds, distanceValues);
						
						regionHandler.addPseudoStar(systemSolarIndex,systemName,systemColor,systemRace, distanceIds, distanceValues);
						
					}else{
						console.log("Failed to parse line: ", systemInfo[0])
					}
				}
			}
			
			systemSelectionApp.applyFilter(); // Autocalls system list refresh here
			systemSelectionApp.wikiLoading = false;
		}
	});

}
