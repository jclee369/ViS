
function startMenus(elname, sstate){
	var ele = document.getElementById("btncontainer");
	ele.style.display = "none";
	storeCookie("state", sstate);
	
	

	if(elname == "loadgamem"){
		var pBar = document.getElementById('p');
		pBar.style.display = "";
		
		getGameName();	
		return false;
	
	}
	else{
		var elem = document.getElementById("mback");
		
		elem.addEventListener('click', function(e){ preventBubble(e); window.location.assign("../index.jsp"); return false;}, false);
	
	}
	var el =document.getElementById(elname);
	el.style.display = "";
	return false;
	
	
 	//var updateProgress = function(value) {
	// 		pBar.value = value;
	// 		pBar.getElementsByTagName('span')[0].innerHTML = Math.floor((100 / 100) * value);
 	//}
	
}



/******************************************************
*
*
*/
var nresponse;
function setGameName(){
	
	var gamename = document.forms['newgamef'].elements['mapname'].value; //get form values
	storeCookie("mapname", gamename);
	XMLHttpPost("NewMap", uid+"", true, function(){
	
	var url = "../game.jsp";
	if (this.readyState == 4) { // If the HTTP request has completed 
		    if (this.status == 200) { // If the HTTP response code is 200 (e.g. successful)
		    	nresponse = this.responseText;
		    	//alert(nresponse)
			 
		    	if(nresponse == "A map with this name already exists!"){
		    		alert(nresponse);
		    	}else
		    	//only way I could find to redirect to another page //RequestDispatcher.forward does not seem to work
		    		window.location.assign(url);
		    		
		    }
		}
		  
	});
	return false;
	
}

function getGameName(){
	
	var el = document.getElementById("loadgamem");
	//el.style.display ="none";
	XMLHttpPost("LoadMap", uid+"", true, function(){
		
		if (this.readyState == 4) { // If the HTTP request has completed 
			    if (this.status == 200) { // If the HTTP response code is 200 (e.g. successful)
			    	nresponse = this.responseText;
			    	//alert(nresponse);
			    	
			    		//XMLHttpPost("../index.jsp", nresponse, true, function(){});
			    	var pBar = document.getElementById('p');
			    	pBar.style.display ="none";
			    	
			    	var toks = nresponse.split(",");
		    		
		    		var field = document.getElementById("fieldset");
			    	for(var i=0; i < toks.length; i++){
			    			
			    			var btn = document.createElement("button");
			    			var t = document.createTextNode(toks[i]);
			    			btn.appendChild(t);
			    			btn.id = toks[i];
			    			btn.className = "listbtn";
			    			btn.addEventListener('click', function(e){preventBubble(e); goLoad(e); }, false);
			    			
			    			
			    			el.appendChild(btn);
			    			var br = document.createElement('br');
				    		el.appendChild(br);
			    			
			    	}
			    		
			    		var back = document.createElement('button');
			    		back.addEventListener('click', function(e){preventBubble(e); window.location.assign("../index.jsp");}, false);
			    		var t = document.createTextNode("Back");
		    			back.appendChild(t);
		    			el.appendChild(back);
		    			
		    			el.style.display = "";
			    }
			}
			  
		});
		return false;
}

function goLoad(el){
	
	var mapname = "";
	if(el.srcElement)
		mapname = el.srcElement.id;
	else
		mapname = el.target.id;
	storeCookie("mapname", mapname);
	alert("starting map... " +mapname);
	window.location.assign("../game.jsp");
	return false;
}





/*********************************************************
 *  displayMenu(e)
 *  Used to display Main Menu
 */
function displayMenu(element){
	var el = document.getElementById(element);
	if (el.currentStyle) {
	    var display = el.currentStyle.display;
	} else if (window.getComputedStyle) {
	    var display = window.getComputedStyle(el, null).getPropertyValue("display");
	}

		if(display === "none"){
			el.style.display = "";
			return;
		}
		else{
			el.style.display = "none";
			return;
		}
	
	//var placement = findPos(pos);
	//menu_element.style.left = placement[0] + "px";
	//menu_element.style.top = placement[1] + "px";
}