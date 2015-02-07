
function coords(px,py){
	this.cx = px;
	this.cy = py;
}


/**********************************************
 * map coords contain tiles, may have shadow/light applied, may have objects
 * qualities, events.....
 */
function mapTile(ptile){
	this.mtile = ptile;
	//this.deco = {};
	this.shadow = false;
	//this.objects = ();
}

/**********************************************
 * map layer, basically a 2d array of MapTiles in map
 * MapTile: contains tile, shadows, object at map coord
 * @param rows
 * @param cols
 */
function MapLayer(r, c, level){
	this.rows = r;						//width of map layer
	this.cols = c;						//height of map layer
	this.level = level;			//current level of map, level 0 is counted, 
										//length of 'map' is incremented after layer creation
	
	this.tiles = new Array(this.rows);			//the map layer is stored as a 2d array of Tiles
	for(var i=0; i < this.rows; i++)
		this.tiles[i]= new Array(this.cols);
	this.shadows = {};		//holds coords of shadows that will be placed in this map layer
	
	
	this.mCanvas = document.createElement("canvas");
	this.mCanvas.id     =  "layer" + this.level.toString();
	this.mCanvas.style.zIndex   = this.level;
	this.mCanvas.style.position = "fixed";

	document.getElementById(this.mCanvas.id);
	document.body.appendChild(this.mCanvas);
	
	this.context = getCanvas(this.mCanvas);
	
}
//paints map view
MapLayer.prototype.draw = function(xs, ys){
	
	this.context.clearRect(0,0, this.mCanvas.width, this.mCanvas.height);
	//bounds of viewport defined relevant to player
	//player will be in the "center"

	//draw to this many tiles, either based on screen or map size, if smaller
	var xe = Math.min(this.cols, Math.ceil(this.mCanvas.width/TW)+1); //till this number of tiles on x axis -> cols
	var ye = Math.min(this.rows, Math.ceil(this.mCanvas.height/(TH/2))+1); //till this number of tiles on y axis -> rows
	
	//offsets related to isometric rendering
	//odd rows painted in
	var offsetx = 0;

	//offset to paint image at bottom if tile larger than 'map' tile's height: 32 px;
	var ImOffset = 0;
	
	var z = 0; //in order to produce some height in the map there needs to be an offset for the layers on z axis
	
	for(var i=0; i< ye; i ++){
	
		if(i % 2 === 0) //if even row
			offsetx = 0;
		else 
			offsetx = TW/2;
		for(var j=0; j < xe; j++){
			
			if(this.tiles[i+ ys][j + xs] == null) continue;
			//must look at tile beneath to give an height offset that produces a layering effect(essentially a z-coord sort of)
			
			if(this.level > 0){
				if(map[this.level - 1].tiles[i + ys][j + xs]) //sit on top
					z = (map[this.level - 1].tiles[i + ys][j + xs].bheight); //subtract this from y painting coordinate to produce z effect
				else
					z = this.level * TH;  //at selected level, levels incremented by TH
			}
			
			
			
			//because image starts drawing from top coordinate must have offset for larger/smaller images
			if(this.tiles[i + ys][j + xs].height > TH)
				ImOffset = -((this.tiles[i + ys][j + xs].height - TH)); //if tile img > tile height
			//paint at location on screen with offset of -tilewidth/2, -tileheight/2
			//drawImage: img, x coordinate where to start clipping,y coordinate where to start clipping,width of the clipped image,
			//height of the clipped image,x coordinate where to place the image,y coordinate,width of image,height 
			//TH adjusted by /2 because the tile rendered at half tilesize
			try{
				this.context.drawImage(this.tiles[i + ys][j + xs].timg, 
						this.tiles[i + ys][j + xs].xstart, this.tiles[i + ys][j + xs].ystart, 
						this.tiles[i + ys][j + xs].width, this.tiles[i + ys][j + xs].height, 
						(j*TW + offsetx - mOffsetx) , ((i*(TH/2) + ImOffset - mOffsety) - z*(this.level-1)), 
						this.tiles[i + ys][j + xs].width, this.tiles[i + ys][j + xs].height);
			}catch(e){ console.log(e.stack); alert("drawImageERROR: error occured drawing to canvas.");
			
			}
		}
	}

};
//just generate random tiles at this point, no biased or procedural algs
//only generates a flat grass 'zone'
//may later pass in zone info
MapLayer.prototype.mapGen = function(bank){
	for(var i=0; i < this.rows; i++){
		for(var j=0; j < this.cols; j++){

			this.tiles[i][j] = bank.tileArray[Math.floor(Math.random() * (bank.tileArray.length -1))];

		}
	}

		
};
//places plants and trees on map
MapLayer.prototype.plantStuff = function(bank){
	
};
//will read maps from server
MapLayer.prototype.mapload = function(){	
};




/*******************************************************
 * addMapLayer()
 * just adds empty layer to map
 * max map 'z' is 20 layers
 */
function addMapLayer(){
	//will probably stick map pushing and index increasing into a function
	if(map.length === MAP_MAXZ){
		return;  //do not want to add more than MAP_MAPZ layers 
	}
	var layer = new MapLayer(100,100, map.length); 	//create new layer
	map.push(layer);   				//add layer to map
	Game.mapIndex = map.length - 1;
	
	//alert("new layer created: " + map[map.length - 1] + "actual index: " + (map.length - 1) + "mapIndex: " + mapIndex);
}


/*******************************************************
 * mapDraw(index)
 * draws map layers up to index
 */
function mapDraw(index){
	if(index > map.length - 1 || index < 0)
		alert("Error occured while drawing the map");

	for(var i = 0; i <= index; i++){
		map[i].draw(hero.mx,hero.my);
	}
	
}

function mapGet(){
	XMLHttpPost("GetMap", uid+"", true, function(){
		
		if (this.readyState == 4) { // If the HTTP request has completed 
		    if (this.status == 200) { // If the HTTP response code is 200 (e.g. successful)
		    	var mresponse = this.responseText;
		    	
		    	if(mresponse != null || mresponse != "" || mresponse != undefined){
		    		var toks = mresponse.split("|");
		    		for(var i=0; i < toks.length; i++){
		    			var ttoks = toks[i].split(",");
		    			map[ttoks[6]].tiles[ttoks[5]][ttoks[4]] = build.blocks.tileArray[ttoks[3]];
		    		}
		    	mapDraw(map.length - 1);	
		    	}
		    }//end status 200
		}//end state 4
		
		
	});
}


