
	
   
    
   ///////////////////////////////////////////////////////////////
   // social plugins:  'like' and 'share'
   //FB.ui(
   //		  {
   // 		   method: 'share',
   // 		   href: 'https://developers.facebook.com/docs/'
   // 		 }, function(response){}
   //);
    
    FB.api(
    	    "/me/og.likes",
    	    "POST",
    	    {
    	        "object": "https://developers.facebook.com/docs/"
    	    },
    	    function (response) {
    	      if (response && !response.error) {
    	        /* handle the result */
    	      }
    	    }
    	);    
   
  
    