<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="ISO-8859-1" >
<link rel="stylesheet" type="text/css" href="css/splash.css" />
<link rel="stylesheet" type="text/css" href="css/g.css" />
<script type="text/javascript" src="js/Game/gameGlobal.js"></script>
<script type="text/javascript" src="js/Game/util.js"></script>
<title>Villages in ()Space</title>
</head>
<body>
<div id="fb-root"></div>
<script>

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
	    	    //accessToken = response.authResponse.accessToken;
	    	    
	    	    var pBar = document.getElementById('p');
	     		var load = document.getElementById('loading');
	     		pBar.style.display = "none";
	     		load.style.display = "none";
	    	    var el = document.getElementById("btncontainer");
	    		el.style.display = "";
	    	 }
	    }
	    function onAuthResponseChange(response) {
	      console.log('onAuthResponseChange', response);
	     
	    	 
	    }



	/**********************************/
      
    
    window.fbAsyncInit = function() {
    	FB.init({
      		appId      : '722579754494385',
      		status	   : true,
      		xfbml      : true,
      		cookie	   : true,
      		version    : 'v2.2'
    	});

  //are fired on user auth check
     
    	var pBar = document.getElementById('p');
    
	 	var updateProgress = function(value) {
  	 		pBar.value = value;
  	 		pBar.getElementsByTagName('span')[0].innerHTML = Math.floor((100 / 100) * value);
  	 	}
  		FB.Event.subscribe('auth.authResponseChange', onAuthResponseChange);
	 	FB.Event.subscribe('auth.statusChange', onStatusChange);    
    	  
	};

   
     	
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

</script>

						<c:set var="message" value="${requestScope.datastr}" />
						<c:if test="${not empty message}">

						<srcipt>
							var el = getDocumentById("newgamem");
							el.style.display = "";
							
						</srcipt>
    					</c:if>


<div class="vcenter">
	<div class="hcenter">
		<div id="bkg">
		
		
		<div class="vcenter">
		<div class="mhcenter">
		<div id="loading">loading...</div>
		<progress id="p" max="100"><span>0</span>%</progress>
			<div id="btncontainer" style="display: none;" > 
		
				<button class="btn" onclick="startMenus('loadgamem','load')">Continue Game</button>
				<button class="btn" onclick="startMenus('newgamem', 'new')">New Game</button>
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
			
			
		</div>
	</div>
</div>

</body>
</html> 