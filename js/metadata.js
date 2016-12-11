var colors = [
	[0xf1,0x7f,0x42], // YELLOW_STAR
	[255,0,0], // RED_STAR
	[0,255,0], // GREEN_STAR
	[0,0,255], // BLUE_STAR
];

var races = ['Gek','Korvax','Vy\'keen'];

var materials = {
	
	data : [
		{ name: "Antrium", sources:[] },
		{ name: "Candensium",sources:[] },
		{ name: "Coprite",sources:[] },
		{ name: "Coryzagen",sources:[] },
		{ name: "Cymatygen",sources:[] },
		{ name: "Fervidium",sources:[] },
		{ name: "Mordite",sources:[] },
		{ name: "Pugneum",sources:[] },
		{ name: "Rubeum",sources:[] },
		{ name: "Spadonium",sources:[] },
		{ name: "Rigogen",sources:[] },
		{ name: "Temerium",sources:[] },
		{ name: "Tropheum",sources:[] },
		{ name: "Viridium",sources:[] },
		{ name: "Korvax Convergence Cube",sources:[] },
		{ name: "Sac Venom",sources:[] },
		{ name: "Vy'keen dagger",sources:[] }
	],
	addSource : function(materialIndex,isStar, index, inStation,text, requiredTool){
		
		this.data[materialIndex].sources.push({
			isStar : isStar,
			index: index,
			text: text,
			requiredTool: requiredTool,
			inStation: inStation
		});
	}
}


var loadMetaData = function(){
	
	regionHandler.addPseudoStar(0x211,"Drogradur NO425",0, "-1|17f|79|74","166592.9|387.6|154.7|204.4");
	regionHandler.addPseudoStar(0x164,"Nihonmatsuba ",0, "-1|17f|79|74","166538.1|350.5|336.7|309.6");
	regionHandler.addPseudoStar(0x1f5,"De Caesarus",0, "-1|17f|79|74","166573.1|79.3|350.1|399.8");
	regionHandler.addPseudoStar(0x95,"Polizeistaat",0, "-1|17f|79|74","166584.3|116.7|352.4|395.1");
	regionHandler.addPseudoStar(0xA4,"Chevronech",0, "-1|17f|79|74","166597.9|455.9|134.0|70.7");
	
	regionHandler.addPseudoStar(0x16a,"Zoology Star",0, "-1|17f|79|74","166581.1|105.9|320.2|371.5");
	regionHandler.addPseudoStar(0x1f7,"Aioiketiko",0, "-1|17f|79|74","166571.1|100.6|329.9|379.3");
	
	regionHandler.addPseudoStar(0x1dd,"Acquisition",0, "-1|17f|79|74","166572.2|108.4|310.5|358.5");
	regionHandler.addPseudoStar(0xF1,"Beetle Star",0, "-1|17f|79|74","166598.2|169.3|431.8|486.1");
	
	
	
	regionHandler.addPseudoStar(0x1B8,"K.Kesey",0, "-1|17f|79|74","166624.9|375.2|162.2|237.8");
	
	
	materials.addSource(0,false,0, false,"Bright flowers in any planet","");
	materials.addSource(1,true, 0x12b, false,"","");
	materials.addSource(2,false,0, false,"Feed animals, grab the poo","");
	//materials.addSource(3,true,0, false,"","HazmatGlobes");
	//materials.addSource(4,true,0, false,"","");
	materials.addSource(5,true,0x12b, false,"","Hazmat Gloves");
	materials.addSource(6,false,0, false,"Kill animals","");
	materials.addSource(7,false,0, false,"Kill sentinels","");
	
	materials.addSource(8,true,0x184, false,"","");
	
	materials.addSource(9,true,0x150, false,"","");
	materials.addSource(9,true,0x203, false,"","");
	
	materials.addSource(10,true,0xdd, false,"","Hazmat Gloves");
	
	materials.addSource(11,false,0, false,"Destroy pirate ships","");
	materials.addSource(12,true,0x12b, false,"","");
	
	materials.addSource(13,true,0x163, true,"Merchants","");
	materials.addSource(14,true,0x203,false,"","");
	materials.addSource(14,true,0x11c,true,"Merchants","");
	
	materials.addSource(15,true,0xdd,true,"Merchants","");
	
	phoriaHandler.renderFrame();
	
}