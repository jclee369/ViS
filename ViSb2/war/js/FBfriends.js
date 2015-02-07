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
	
///////////////////////////////////////////
// invites
	
	function sendInvite(to, message, callback) {
		  var options = {
		    method: 'apprequests'
		  };
		  if(to) options.to = to;
		  if(message) options.message = message;
		  FB.ui(options, function(response) {
		    if(callback) callback(response);
		  });
	}
	
	
	function onInvite() {
		  sendInvite(null,'Come and play Villages in Space with me!  Lets build our own town.', function(response) {
		    console.log('sendInvite',response);
		  });
		}
	
	
	
	

			
		