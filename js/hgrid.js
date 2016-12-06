/* HUB GRID LIBRARY */
 
var gridHandler = {
	 
	initialize : function (dataSource){
		this.source = dataSource;
		this.maxPerPage = 5;
		this.maxPages = 1;
		this.currentPage = 0;
		this.filterText = "";
		this.data = undefined;
		this.currentData = undefined; 
	},
	
	humanPageIndex(){
		return this.currentPage+1;
	},
	resetPages : function(){
		this.currentPage = 0;
		this.loadCurrentPageContent();
		
	},
	loadCurrentPageContent : function(){
		this.maxPages = Math.ceil(this.data.length / this.maxPerPage);
		this.currentData = this.data.slice(this.currentPage*this.maxPerPage, this.currentPage*this.maxPerPage +this.maxPerPage);
	},
	
	setPage : function(pageIncrement){
		
		if(this.currentPage +pageIncrement > this.maxPages-1){
			return;
		}
		if(this.currentPage+pageIncrement<0){
			return;
		}
		
		this.currentPage+=pageIncrement;
		this.loadCurrentPageContent();
		
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