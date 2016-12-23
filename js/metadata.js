var colors = [
	[0xf1,0x7f,0x42], // YELLOW_STAR
	[255,0,0], // RED_STAR
	[0,255,0], // GREEN_STAR
	[0,0,255], // BLUE_STAR
];

var races = ['Gek','Korvax','Vy\'keen'];

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
	
	regionHandler.addPseudoStar(0x211,"Drogradur NO425",0,0, "-1|17f|79|74","166592.9|387.6|154.7|204.4");
	regionHandler.addPseudoStar(0x164,"Nihonmatsuba ",0,0, "-1|17f|79|74","166538.1|350.5|336.7|309.6");
	regionHandler.addPseudoStar(0x1f5,"De Caesarus",0,0, "-1|17f|79|74","166573.1|79.3|350.1|399.8");
	regionHandler.addPseudoStar(0x95,"Polizeistaat",0,0, "-1|17f|79|74","166584.3|116.7|352.4|395.1");
	regionHandler.addPseudoStar(0xA4,"Chevronech",0,0, "-1|17f|79|74","166597.9|455.9|134.0|70.7");
	
	regionHandler.addPseudoStar(0x16a,"Zoology Star",0,0, "-1|17f|79|74","166581.1|105.9|320.2|371.5");
	regionHandler.addPseudoStar(0x1f7,"Aioiketiko",0,0, "-1|17f|79|74","166571.1|100.6|329.9|379.3");
	
	regionHandler.addPseudoStar(0x1dd,"Acquisition",0,0, "-1|17f|79|74","166572.2|108.4|310.5|358.5");
	regionHandler.addPseudoStar(0xF1,"Beetle Star",0,0, "-1|17f|79|74","166598.2|169.3|431.8|486.1");

	regionHandler.addPseudoStar(0x1B8,"K.Kesey",0,0, "-1|17f|79|74","166624.9|375.2|162.2|237.8");

	regionHandler.addPseudoStar(0x15d,"Top of the tree",1,1, "-1|17f|79|74","166576.5|223.1|205.2|230.0");
	
	regionHandler.addPseudoStar(0x12b,"Curious Group",2,1, "-1|17f|79|74","166558.0|277.1|266.5|258.4");
	
	regionHandler.addPseudoStar(0x01,"Umbalo",0,0, "-1|17f|79|74","166534.9|371.0|344.5|313.4");
	regionHandler.addPseudoStar(0x02,"El segundo",0,0, "-1|17f|79|74","166538.6|332.6|321.3|298.3");
	regionHandler.addPseudoStar(0x03,"Alteri",0,0, "-1|17f|79|74","166548.0|319.7|283.8|263.4");
	
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
	
	phoriaHandler.renderFrame();
	
}
