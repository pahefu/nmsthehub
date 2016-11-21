/* HUB GRID LIBRARY */
 
var gridHandler = {
	 
	initialize : function (dataSource){
		this.source = dataSource;
		this.maxPerPage = 25;
		this.filterText = "";
		this.data = undefined;
	},
	 
	setFilterText : function(filterTxt){
		this.filterText = filterTxt.toLowerCase();
	},
	 
	applyFilter : function(){
		this.data = this.source.stars.slice();
		var result = [];
		for(var i = 0;i<this.data.length;i++){
			if(this.data[i].name.toLowerCase().includes(this.filterText)
				||
			this.data[i].getHexSolarId().toLowerCase().includes(this.filterText) 	){
				result.push(this.data[i]);
			}
		}
		this.data = result;
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
	 
	sortById : function (){
		this.applyFilter();
		this.data = this.data.sort(this.dynamicSort("solarIndex"));	
	}	 
}