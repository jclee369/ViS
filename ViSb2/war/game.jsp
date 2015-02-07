<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1" >
<link rel="stylesheet" type="text/css" href="css/mainpage.css" />
<link rel="stylesheet" type="text/css" href="css/g.css" />
<script type="text/javascript" src="js/Game/gameGlobal.js"></script>
<script type="text/javascript" src="js/Game/core.js"></script>
<script type="text/javascript" src="js/Game/map.js"></script>
<script type="text/javascript" src="js/Game/util.js"></script>
<script src="//connect.facebook.net/en_US/sdk.js"></script>
<script type="text/javascript" src="js/facebookapi.js"></script>
<script type="text/javascript" src="js/FBfriends.js"></script>
<title>Villages in ()Space</title>
</head>
<body>
<div id="fb-root"></div>
<script>
 //////////////////////////////////////////////////////////////
// Graph API personal profile

 function getMe(callback) {
 	  FB.api('/me', {fields: 'id,name,first_name,picture.width(120).height(120)'}, function(response){
 	    if( !response.error ) {
 	      friendCache.me = response;
 	      callback();
 	    } else {
 	      console.error('/me', response);
 	    }
 	  });
 	}

 function renderWelcome() {
 	var box = document.getElementByClassName("profilebox");
 	var myPic = document.getElementsByClassName("pic");
 	var first_name = document.getElementsByClassName("first_name");
 	for(var i = 0; i < friendCache.length; i++){
 		// in futuer create divs and add to page ...document.createElement('div'); document.createElement('div'); document.createElement('div');
 		box[i].style.display = "";
 		first_name[i].innerHTML = friendCache.me.first_name;
 		myPic[i].style.BackgroundImage = "url('" + friendCache.me.picture.data.url + "')";
 	}
 }
 
 
////////////////////////////////////////////////
	
//////////////////////////////////////////////////
	// get friends currently playing -- not implemented in game yet
	var friendCache = {};

	function getFriends(callback) {
		  FB.api('/me/friends', {fields: 'id,name,first_name,picture.width(120).height(120)'}, function(response){
		    if( !response.error ) {
		      friendCache.friends = response;
		      callback();
		    } else {
		      console.error('/me/friends', response);
		    }
		  });
		}

		function getPermissions(callback) {
		  FB.api('/me/permissions', function(response){
		    if( !response.error ) {
		      friendCache.permissions = response;
		      callback();
		    } else {
		      console.error('/me/permissions', response);
		    }
		  });
		}

		function hasPermission(permission) {
		  for( var i in friendCache.permissions ) {
		    if( 
		      friendCache.permissions[i].permission == permission 
		      && friendCache.permissions[i].status == 'granted' ) 
		      return true;
		  }
		  return false;
		}

////////////////////////////////////////////////
var uid;
var accessToken;       
function login(callback) {
	  FB.login(callback, {scope: 'user_friends'});
}
function loginCallback(response) {
	  console.log('loginCallback',response);
	  if(response.status != 'connected') {
	    top.location.href = 'https://www.facebook.com/appcenter/villagesinspace';
	  }
}
function onStatusChange(response) {
	    	  if( response.status != 'connected' ) {
	    	    login(loginCallback);
	    	  } 
	    	  else {
	    		uid = response.authResponse.userID; 
	    	    getMe(function(){
	    	      getPermissions(function(){
	    	        //if(hasPermission('user_friends')) {
	    	         // getFriends(function(){
	    	         //   renderWelcome();
	    	         //   onLeaderboard();
	    	         //   showHome();    
	    	         // });
	    	       // } 
	    	       // else {
	    	       //   renderWelcome();
	    	       //   showHome();
	    	        //}
	    	      });
	    	    });
	    	    //accessToken = response.authResponse.accessToken;
 				imageLoader(initG);	
 			}
	    }
	    function onAuthResponseChange(response) {
	      console.log('onAuthResponseChange', response);
	     
	    	 
	    }



	/**********************************/
	//var oldCB = window.fbAsyncInit;
 
    window.fbAsyncInit = function() {
    	/* if (typeof oldCB === 'function') {
             oldCB();
         }
    	*/
    	FB.init({
      		appId      : '722579754494385',
      		status	   : true,
      		xfbml      : true,
      		cookie	   : true,
      		version    : 'v2.2'
    	}) 
    	  
//are fired on user auth check

    	var pBar = document.getElementById('p');
	 	var updateProgress = function(value) {
  	 		pBar.value = value;
  	 		pBar.getElementsByTagName('span')[0].innerHTML = Math.floor((100 / 100) * value);
  	 	}
  		
	 	FB.getLoginStatus(onStatusChange);
	 	//FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	 	//FB.Event.subscribe('auth.statusChange', onStatusChange);    	  
	};

   
     	
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
////////////////////////////////////////////////////
</script>


<div id="topmenuback"></div>
<div id="topmenu">
<!-- - populate buttons with id = "tilebank name" + indexnumber  
	 - js function for displaying only buttons that fit on screen
	 - TO DO plus arrow buttons to view more 
	 - button here is placed at start
-->
	<button id="blocks:0" style=" background: url('imgs/blocktiles.png') 0 0; "></button>
	

</div>

<canvas id ="fake"></canvas>
<canvas id="main1">Your Browser does not Support HTML5 Canvas. Or Javascript must be enabled.</canvas>

<!-- should populate with more as friends get added -->
<!--div id="me" class="profilebox" style="display:none">
<div class="pic"></div>
<div class="first_name"></div>
</div-->

<div id="mainmenubv">
<div id="mainmenubox" class="mainmenub" style="display: none;">
	<ul>
		<li><button id="new">New Map</button></li>
		<li><button id="load">Load Map</button></li>
		<li><button id="invite">Invite Friends</button></li>
		<li><button id="exitg">Exit Game</button></li>
		<li><button id="exitm">Exit Menu</button></li>
		<li><button id="web">ViS WebPage</button></li>
	</ul>
</div>
</div>

<div id="bottomtitle" title="main menu"></div>
<div id="bottommenu">
	<button id="build">build</button>
	<button id="roofs">roofs</button>
	<button id="plants">plants</button>
	<button id="terrain">terrain</button>
	<button id="bull">bulldoze</button>
	<button id="grid">Grid</button>
	<button id="trans">Trans</button>
	
</div>
	<button id="up" class="lvlu">/\</button><div id="levelbox">1</div>
	<button id="down" class="lvld">\/</button>

	<div class="fb-like"
  		data-send="true"
  		data-width="450"
  		data-show-faces="false" style="position: fixed; bottom: 3px; left:250px; z-index:9999;">
	</div>

<div class="vcenter">
<div class="hcenter">
	<div id="loading">loading...</div>
	<progress id="p" max="100"><span>0</span>%</progress>
	<div id="btncontainer" style="display: none;" > 
	</div>
			<div id="newgamem" class="startm" style="display:none;">
					<form id="newgamef">
						<fieldset>
						<legend>Start New Game</legend>
						
						<c:set var="message" value="${requestScope.datastr}" />
						<c:if test="${not empty message}">
						<span style="color: red;">
							<c:out value="${message}"/>
						</span>
    					</c:if>
						<br><br>
						<label>New Game Name:</label><input type="text" id="mapname">
						
						</fieldset>
					</form>
					<button onclick="setGameName();">Start</button>
					<button id="mback">Back</button>
				</div>
				
				<div id="loadgamem" class="startm" style="display:none;">
					
						Load Game<br>
						
					
				</div>
			
</div>
</div>

<div id="depthgradient"></div>

<div id ="bottomback"></div>



</body>
</html> 