/////////////////////////////////////////////////////////////////////
/* Villages in Space
 * by: Jacqueline Lee
 * 
 * dev NOTES:  map gen creates random tiles at this point
 * need to abstract objects to GObject type instead of hard code values
 * GObject will have functions : right now events occur based on hard coded values
 * look into js singletons
 * dynamic tile sizes
 * populate the tile buttons to do 
 * screen resize TO DO
 * drawing roofs or other floors (other than first)
 * grid painting too slow -- look into web workers or webGL
 * no other biomes other than temperate forest right now
 * will later code in biom info in Tile object too

 * clean up code and reorganize code : big mess right now
 * 
 * current game supports one map per user,  have to implement one-to-many relations in datastore 
 * haven;t worked around it yet
 * thought of using JDO but then I already have object in javascript,.. would be a bit to also house on server in java... 
 * may have to do it though
 * 
 */


//on window load call imageLoader to make sure all images loaded before starting

document.addEventListener('load',function(){ imageLoader(state, initG);});

//screen tile rendering dimensions
var TW = 64;
var TH = 32;

//tile image dimensions
var TIMG_W = 64;
var TIMG_H = 64;

//map offset that is always there to paint map 1/2 tile off
var mOffsetx = TW/2;
var mOffsety = TH/2;

//maximum map layers, minus roofs
var MAP_MAXZ = 20;

//DEVS:   terrain and plant arrays structured in this way:  the colder the terrain tiles/plants tiles the lesser the index
// so tundra blocks will be first, then temperate forest, then deserts for example
// right now we only have grass1(temperate forest)  at index 0


/**********************************************************
 * imageLoader(callback)
 * simple right now,  loads hard coded images, will maybe want to do this more dynamically
 * once finished will callback initG
 */
function imageLoader(icallback){
	this.grasssheet = new Image();
	this.gplantsheet = new Image();
	this.buildsheet = new Image();
	this.fxsheet = new Image();
	
	try{
		
		this.grasssheet.onerror = function(){ alert("img.onerror: Images failed to load properly!"); };
		this.gplantsheet.onerror = function(){ alert("img.onerror: Images failed to load properly!"); };
		this.buildsheet.onerror = function(){ alert("img.onerror: Images failed to load properly!"); };
		this.fxsheet.onerror = function(){ alert("img.onerror: Images failed to load properly!"); };
		
		this.grasssheet.onload = function(){loadedCheck(icallback);};
		this.gplantsheet.onload = function(){loadedCheck(icallback);};
		this.buildsheet.onload = function(){loadedCheck(icallback);};
		this.fxsheet.onload = function(){loadedCheck(icallback);};
		
	}catch(e){ alert("Error (imageLoader): Images failed to load properly!"); console.log(e.stack); }
	this.grasssheet.src = "imgs/grass1.png";
	this.gplantsheet.src ="imgs/shrubs1.png";
	this.buildsheet.src = "imgs/blocktiles.png";
	this.buildsheet.src = "imgs/fx.png";
	
}
var loaded = 0;
//checks if all images have been loaded or not
function loadedCheck(callback){
	var TOTAL = 4;
	loaded++;
	if(loaded === TOTAL){
		callback(Game);
		//if(state === "load") //load game and start Game
		//	loadG(Game);
		//else callback(Game); //we init Game and start Game
	}
}


/**********************************************************
 * initG()
 * initializes game objects
 * once loadG finishes execute callback Game to start game
 * this will 
 */
//var uid = ""; 
function initG(callback){

	
	this.gcanv = document.getElementById("main1");
	this.gctx = getCanvas(gcanv);
	addEvents();
	
	
	//no other biomes other than temperate forest right now
	//will later code in biom info in Tile object too
	var gr1 = new TileBank(grasssheet, true, 0);
	var gp1 = new TileBank(gplantsheet, false, 0);
	var b1 = new TileBank(buildsheet, false, 32);
	var fx1 = new TileBank(fxsheet, false, 0);
	
	this.terrain = {
			grass1:  gr1			//object containing only grass terrain tiles , may nest ex.  grass1: { gr1: gtb1, gr2: gtb2}
			//(ex) snow1: snow_TileBank1 
	};
	
	this.plants = {
			grass_plants: gp1	//object containing only grass land plant tiles
	};
	
	this.build = {
			blocks: b1
	};
	this.fx = {
			shadows: fx1
	};
	
	
	
	this.map = new Array(); //array holding map layers
	this.mapIndex = 1; 		//indicates the level of map we are drawing to starts zero
	
	
	this.hero = new Player(0,0);
	
	drawbMap(); 						//used for mouse to tile coordinate mapping -- may change to algorithm later
	
	for(var i =0; i < MAP_MAXZ; i++)
		addMapLayer();						//create all map layers to max
	
	callback();
	
}

/*********************************************************
 * getCanvas(canv)
 */
function getCanvas(canv){
	
	var ctx;
	if(ctx = canv.getContext('2d')){
		canv.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
		canv.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
		canv.style.width  = canv.width.toString() + "px";
		canv.style.height = canv.height.toString() + "px";
		
	}else{ alert("HTML5 Canvas not supported");}
	
	return ctx;
}


/********************************************************
 * addEvents()
 * callback function for loadC: once the canvas contexts have been fetched
 * execute this
 */
function addEvents(){
	//add event listeners here because page has loaded elements
	//also want to prevent event bubbling and capture
	document.getElementById("bottomtitle").addEventListener('click', function(e){ preventBubble(e); displayMenu("mainmenubox");}, false);
	
	//TO DO right now all buttons select block to build
	document.getElementById("build").addEventListener('click', function(e){preventBubble(e); setTMenu(e, this); setHolding('block', this);}, false);
	document.getElementById("roofs").addEventListener('click', function(e){preventBubble(e); setTMenu(e, this); setHolding('block', this);}, false);
	document.getElementById("plants").addEventListener('click', function(e){preventBubble(e); setTMenu(e, this); setHolding('block', this);}, false);
	document.getElementById("terrain").addEventListener('click', function(e){preventBubble(e); setTMenu(e, this); setHolding('block', this);}, false);


	document.getElementById("bull").addEventListener('click', function(e){preventBubble(e); setHolding('bull', this);}, false);
	document.getElementById("grid").addEventListener('click', function(e){preventBubble(e); drawGrid(e);}, false);
	document.getElementById("trans").addEventListener('click', function(e){preventBubble(e); seeThrough(e);}, false);
	
	//TO DO right now all buttons exit main menu
	document.getElementById("new").addEventListener('click', function(e){preventBubble(e); displayMenu("mainmenubox"); startMenus('newgamem', 'new');}, false);
	document.getElementById("load").addEventListener('click', function(e){ preventBubble(e); displayMenu("mainmenubox"); startMenus('loadgamem','load');}, false);
	document.getElementById("invite").addEventListener('click', function(e){ preventBubble(e); onInvite();}, false);
	document.getElementById("exitg").addEventListener('click', function(e){ preventBubble(e);  window.location.assign("../index.jsp");}, false);
	document.getElementById("exitm").addEventListener('click', function(e){ preventBubble(e); displayMenu("mainmenubox");}, false);
	
	document.getElementById("up").addEventListener('click', function(e){ preventBubble(e); switchLevel(e);}, false);
	document.getElementById("down").addEventListener('click', function(e){ preventBubble(e); switchLevel(e);}, false);

	

};


/****************************************************
 * setTMenu()
 * @param e : event
 * @param el: element that triggered event
 */
function setTMenu(e, el){
	
	//parent div to add buttons to
	var menu = document.getElementById("topmenu");
	
	//clears current menu
	menu.innerHTML = "";
	
	//populate menu depending on tile set chosen -- given by action event
	switch(el.id){
		case "build":
			populateM(menu, build);
			break;
		case "roofs":
			break;
		case "plants":
			populateM(menu, plants);
			break;
		case "terrain":
			populateM(menu, terrain);
			break;
	
	}
	
}

/**************************************************
 * populateM()
 * @param bank is a object that holds Tilebanks : example 'terrain' is a 'bank' that holds Tilebanks for grassland terrain
 */
var bankIn;
 function populateM(menu, bank){
	 for(var i in bank){
		 if(bank.hasOwnProperty(i)){ 
			 for(var j = 0; j < (bank[i].tileArray.length - 1); j++){
					 var btn = document.createElement("button");
					 btn.style.backgroundImage = "url( '" + bank[i].tileArray[j].timg.src +"' )";
					 btn.style.backgroundPosition = -(bank[i].tileArray[j].xstart) + "px " + bank[i].tileArray[j].ystart +"px" ;
					 //btn.style.backgroundPosition = "-64  0" ;
					 menu.appendChild(btn);
			 }
		 }
	 }
	 
 }


 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*************************************************
 *  bank of tiles for a region
 *  filepath: is the path to a tileset which will be broken up
 *  passable: is if these tiles will default be 'passable'
 *  //will probably change this later to have info be stored externally
 *  
 */
function TileBank(imagesheet, passable, bh){
	
	this.tileArray = new Array();  //array that will hold tiles for a particular bank
	var countx = imagesheet.width / TIMG_W;		//number of tile columns in tile set
	var county = imagesheet.height / TIMG_H;	//number of tile rows in tile set

	breakSheet(imagesheet, this.tileArray, passable, countx, county, bh);
		
	
}
//called from inside onload to make sure images loaded before game starts 
//image loading happens asynchronously
function breakSheet(simg, a, passp, countx, county, bh){
	
	//break up tile set and create new 'Tile' to associate with the image
	//at this point set all passable to param passable
	for(var i=0; i< county; i++){
		for(var j=0; j<= countx; j++){
			try{
				
				//eventually TW, TH,...ect  will not be fixed
				var tmp = new Tiles(passp, simg, j*TIMG_W, i*TIMG_H, TIMG_W, TIMG_H, bh);
				a.push(tmp);
				
			}catch(e){console.log(e.stack); alert("ERROR: producing tiles failed.");}
		}
	}
}


			

/**********************************************
 * tile object: contains tile relevant information
 * @param pass: is passable tile?
 * @param tilebankindex: index for image associated with base tile: eg. grass or dirt
 * 	right now just an index, programmer must know which tile type for each index
 * @returns
 */
function Tiles(pass, tileimg, x, y, w, h, bh){
	this.passable = pass;
	this.timg = tileimg;
	this.xstart = x; //the x clipping start out of spritesheet
	this.ystart = y; //the y clipping start out of spritesheet
	this.width = w;  //width of tile
	this.height = h; //height of tile
	this.bheight = bh; //block height (z-offset)
}

/**************************************************
 * GObject()
 *  all paintable objects on a tile will descend from this
 *  (a wrapper)  with some basic attributes and functionality added as well
 */
function GObject(h, s, tileimg){
	this.health = 100; 
	this.strength = 5;	//can think of this as resistance for objects
	this.timg = tileimg;
}
GObject.prototype.func = function(){};


/*************************************************
 * Eventually there will be players
 * currently, map painting coordinates are referenced from hero Player instance 
 */
function Player(x, y){
	this.mx = x;  //map tile x coord
	this.my = y;  //map tile y coord
	this.mz = 0;
}
Player.prototype.getOffsetX = function(){ 
	//TO DO will return ofset in relation to character?
};



/////////////GAME related code//////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var inHand;  //what 'object' user is currently holding/using
var lastEl;
/************************************************************
 * setHolding()
 * @param object
 * @param el
 */
function setHolding(object, el){
	
	inHand= object;
	if(lastEl) //should probably have these predefined in some sort of file somewhere -- but hard code for now
		lastEl.style.background = '#336699';
	el.style.background = '#999933';
	lastEl = el;
	//TO DO carry type GObject instead, with associated function
	
}



/*************************************************************
 * Game 'Loop'
 * the top level game logic goes in here: for example bring up screen for intro
 */
function Game(){
	//run();
	//for now just use facebook login
	
	//get rid of loading bar
	var pBar = document.getElementById('p');
	var load = document.getElementById('loading');
	pBar.style.display = "none";
	load.style.display = "none";
	
	var state = getCookie("state");
	switch(state){
		case "new": /*if new generate map */
			//set game name
			this.map[0].mapGen(terrain.grass1);				//randomly generate the map tiles for bottom layer only
			break;
		case "load": /* if loading get map from datastore */
			//get store map information,,  at this point only stores user changees not whole map,  may later choose to work 
			//with all of map, when testing will use this smaller set
			this.map[0].mapGen(terrain.grass1);				//randomly generate the map tiles for bottom layer only
			mapGet(); //get stored tiles
			break;
		default:
			alert("Error occured while loading game!");
	}
	
	mapDraw(map.length - 1);		//draw map
	inHand = "block"; 				//user starts with holding the brick building block
	
}




/*******************************************************
 *  run()
 *  game loop mechanics
 *  not used at the moment-- no need, game is very event based ( and no animations)
 */
var dt = 0;
var last = Date.now();
var step = 1/60;  //timestep 
function run() {
	var now = Date.now();
	
	//dt = (now - last) / 1000;
   //fixed time step 
	dt =  dt + Math.min(1,(now - last) / 1000);
    while(dt > step){
		dt = dt - step;
		update(dt);
	}
	
	//update(dt);
    render();
	
    last = now;
	if(animFrame!= null){ animFrame(run);}
	else{ setInterval(run, 1000/60);}
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/*********************************************************
 * drawbMap()
 * layer that enables mouse to tile coordinate mapping
 * may later do this algorithmically using linear functions
 * and testing whether point lies above or below
 */

function drawbMap(){
	var tileb  = new Image();
	
	this.fakecanv = document.getElementById("fake");
	this.fcont = fakecanv.getContext("2d");
	fakecanv.width = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
	fakecanv.height = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight);
	
	tileb.onload = function(){
		for(var i=0; i < (fakecanv.width/TW) + 3; i++){
			for(var j=0; j < (fakecanv.height/TH) + 3; j++){
				fcont.drawImage(tileb, i*TW, j*TH);
			}
		}
	};
	tileb.crossOrigin = ''; // no credentials flag. Same as img.crossOrigin='anonymous'
	//tileb.crossOrigin = 'anonymous';
	tileb.src = "imgs/iso_bit.png";
}

/****************************************************
 *  drawGrid()
 *  draws grid -- needs fixing
 */
var gridOn = false;
function drawGrid(e){
	 
	var el = e.target || e.srcElement;

	
	
	if(gridOn){
		gctx.clearRect(0,0, gcanv.width, gcanv.height);
		el.style.background = "#336699";
		gridOn = false;
		return;
	}
	
	//draw lines 63 degrees from origin points for isometric of 32x64 tiles
	//height =1, opposite =2 ->  atan(2) = 63.4349
	//to draw:  tangent(theta) = opposite/adjacent
	//adjacent = gcanv.height,  we want to find opposite
	//tan(theta)*gcanv.height = opposite
	el.style.background = "#333399";
	var op = Math.tan(63.43 * Math.PI/180)* gcanv.height;
	gctx.lineWidth = .1;
	gctx.strokeStyle =  "#006600";
	
	//should be some function of aspect ratio
	//gcanv.width/ gcanv.height = asp
	//if asp < 0 --> height > width, still want to paint past for lines going right to left
	//need to invert fraction
	//
	// if asp == 0 -> error
	/*
	var tn;
	var till;
	var asp = gcanv.width/ gcanv.height;
	alert(asp);
	if(asp < 1){
		tn = asp*100;
		alert(tn);
		asp = Math.ceil(100/tn);
		till = asp * gcanv.height;
	}
	else till = asp * gcanv.width;
	*/
	//the width+height takes care of diff aspect ratios -- without too much math 
	var till = (2* (gcanv.width+gcanv.height)); //will not have to recalc every iteration
	
	//move origin point tilewidth each iteration
	//draw line from origin point to lineTo(x,y), where x is orgin point plus tangent of 60 degrees,
	//y is the canvas height
	
	//from screen  0 and positive x
	for(var i = (TW/2); i <= till; i += TW){	
		
		gctx.moveTo(i,0);
		gctx.lineTo(i + op, gcanv.height);
		gctx.stroke();
		gctx.moveTo(i,0);
		gctx.lineTo(i - op, gcanv.height);
		gctx.stroke();
	}
	//from screen 0 to negative x
	for(var j = ((TW/2) - TW); j >= -(till); j -= TW){	
		
		gctx.moveTo(j,0);
		gctx.lineTo(j + op, gcanv.height);
		gctx.stroke();
	}

	gridOn = true;
	
}

/******************************************************
 * seeThrough()
 * Transparency in tiles
 */
var clear = false;  //is clear flag
function seeThrough(e){
	
	var el = e.target || e.srcElement;
	
	for(var i = 2; i < map.length; i++){
			
		map[i].context.clearRect(0,0, map[i].mCanvas.width, map[i].mCanvas.height);
		if(clear == false){ //set true
		map[i].context.globalAlpha = 0.3;
		el.style.background = "#333399";
			}
	
		else{ //set false
			map[i].context.globalAlpha = 1;
			el.style.background = "#336699";
		}
	}
	mapDraw(map.length - 1);
	if(clear) clear = false;
	else clear = true;
	
}






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/********************************************************
 * 	Event Listeners on window element
 */
var keysDown = {};

//if tile moving into is not passable, do nothing
//otherwise move map
window.addEventListener('keydown', function(e) {
	
	
	keysDown[e.keyCode || e.charCode] = true;
	if(keysDown[37]) { //left
		e.preventDefault();
		if((hero.mx - 1) >= 0){
			hero.mx = hero.mx - 1;
			mapDraw(map.length-1);
			
		
		}
   }
   if(keysDown[39]) {  //right
		e.preventDefault();
		if(hero.mx + 1 < (map[mapIndex].cols) - gcanv.width/TW){
			hero.mx = hero.mx + 1;
			mapDraw(map.length-1);
		
		}
	}
	if(keysDown[38]){  //up
		e.preventDefault();
		if((hero.my - 2) >= 0){
			hero.my = hero.my - 2;
			mapDraw(map.length-1);
			
		
		}
	}
	if(keysDown[40]){ //down
		e.preventDefault();
		if((hero.my + 2) < (map[mapIndex].rows) - gcanv.height/(TH/2) - 2){
			hero.my = hero.my + 2;
			mapDraw(map.length-1);
			
		
		}
	}
});

// on keyup set kep'map' value to false
window.addEventListener('keyup', function(e){
	keysDown[e.keyCode || e.charCode] = false;
});




/*****************************************************
 * window Event mouse click
 *  selects a tile based on mouse click coordinates 
 *  still needs to adjust for hero position
 *  
 */
var selectTile;
window.addEventListener('click', function(e){
	
	var px= e.pageX;
	var py= e.pageY;
	
	
	if(((py <= 96) && (px <= 640)) || (py >= window.innerHeight-100))
		return;
	//alert("mouse coords: " + px+","+py);

	//break viewport up into regions of TWxTH tp home into 5 potential tiles
	//so x=0to64 and y=0to32 is region 0,0 because 'floor'(
	var regionX = Math.floor( px/TW);
	var regionY = (Math.floor( py/TH)*2); //*2 because all y are even in regions(due to x-offste)
	
	
	//logically break region into four parts usec to further home in on 2 tiles
	//if mouse x > mid line x  then x potentially = regionX -1
	var tempX, tempY; 				//hold temp guesses
	var cx = regionX*TW + TW/2; 	//center coordinate
	var cy = ((regionY/2)*TH + TH/2); //center coordinate
	//alert("regionxy: " + regionX + "," + regionY);
	
	
	//logically break quater into additional quarters to isolate 2 choices
	if(px < cx)
		tempX = regionX -1;
	else 
		tempX = regionX;
	
	if(py < cy)
		tempY = regionY -1;
	else
		tempY = regionY + 1;
	//alert("cx cy: " + cx + " " + cy);
	//alert("px py: " + px + " " + py);
	//alert("tempXY: " + tempX + "," + tempY);
	
	
	var tx, ty;  //tile coordinates of selected tile (in tile maps)
	
	//choose between two isolated tiles using image map
	var imgD = fcont.getImageData(px, py, 1,1).data;
	//alert("imgB color: " + imgD[0] + "," + imgD[1] + "," + imgD[2]);
	
	//+ 1 to handle offset
	//+ hero.mx and my for offset on map
	if(imgD[0] === 0 && imgD[1] === 0 && imgD[2] === 0){ //if equal to black
		tx = regionX + hero.mx;
		ty = regionY + 1 + hero.my;
	}
	else{
		tx = tempX + 1 + hero.mx;
		ty = tempY + 1 + hero.my;
	}
	
	//alert("tile coords: " + tx+","+ty);
	
	//perform function based on object user is 'holding': block, bulldozer
	//linearly search for open tile slots in map arrays
	var i = mapIndex;
	while(map[i] && (map[i].tiles[ty][tx] != null))
		i++;
	
	//make shadow
	/*
	k = mapIndex
	while(map[k] && (map[k].tiles[tx][ty] === null))
		k--;
	map[++k].tiles[tx][ty] = shadow;
	*/
	
	//var tileJSON;
	if(inHand === 'block'){ //TO DO -- will eventually abstract this by making objects with functions
		
		if(map[i] == null){
			addMapLayer();
		}
		//build block for now, eventually, change to what is inHand
		var rand = Math.floor(Math.random() * (build.blocks.tileArray.length -1));
		map[i].tiles[ty][tx] = build.blocks.tileArray[rand];
		
		//thought to use JSON but will send TileBank name and index which is rand in this case
		//JSON stringify will not do DOM objects... because circular reference
		//will maybe find work around for that later

		//var tileJSON = tileToJSONString(build, tx, ty, i);
		//alert(tileJSON);
		//var tileJSON = tileToJSONString(build.blocks.tileArray[rand], tx, ty, i);

		//else "new" load nprmally
		
		
		
		var dataStr = "build,blocks,b1,0"+","+tx+","+ty+","+i+","+uid+","+"bld";
	
		XMLHttpPost('SaveMap', dataStr, true, function(){});	
	}
	else if(inHand === 'bull'){
		
		if((i-1) <= 0) return; //do nothing if bottom layer
		map[i - 1].tiles[ty][tx] = null;
		
		var send = i - 1;
		var dataStr = "build,blocks,b1,0"+","+tx+","+ty+","+send+","+uid+","+"bull";
		
		XMLHttpPost('SaveMap', dataStr, true, function(){});
	}
	mapDraw(map.length - 1);
});

/***************************************************8
 * tileToJSONString
 */
function tileToJSONString(tile, tx, ty, i){
	var JSONstring = JSON.stringify(tile, function( key, value) {
		  if( key == 'parent') { return value.id;}
		  else {return value;}
		});
	var JSONObj = JSON.parse(JSONstring);
	JSONObj.mx = tx;
	JSONObj.my = ty;
	JSONObj.mz = i;
	JSONObj.timg = "";
	JSONstring = JSON.stringify(JSONObj);
	return JSONstring;
	
}



/******************************************
 * switch level
 * changes current map index
 */
function switchLevel(e){
	
	var btnp; //should be either 'up' or 'down'
	if(e.srcElement)
		btnp = e.srcElement.id;
	else
		btnp = e.target.id;
	
	if(btnp == "up" && (mapIndex+1) <= MAP_MAXZ)
		mapIndex++;
	else if(btnp == "down"  && (mapIndex-1) > 0)
		mapIndex--;
	
	document.getElementById("levelbox").innerHTML = mapIndex+"";
}



//on screen resize 
//TO DO
/*
window.addEventListener('resize', function(e){
	//need to find zoom percent and draw bsaed off that
	drawbMap();
	mapDraw(map.length - 1);  

});
*/




