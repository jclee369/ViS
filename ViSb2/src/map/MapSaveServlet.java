package map;
import java.io.IOException;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.CompositeFilter;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Text;

/////NOTE will eventually send in json object as a whole maybe,, 
//because quicker than search through to delete blocks when they are removed?
//will see how each effect performance,, later
@SuppressWarnings("serial")
public class MapSaveServlet extends HttpServlet {
	public void processRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		
		String olddata = "";
		String newdata = "";
		String mapdata = req.getParameter("datastr");
		String[] tokens;
		tokens = mapdata.split(",");
		
		//truncate uid and (bld or bull)
		String tiledata = tokens[0] +","+ tokens[1] +","+ tokens[2] +","+ tokens[3] +","+ 
				tokens[4] +","+ tokens[5] +","+ tokens[6];
		
		Text mdata = null;
		String build = tokens[8];
		
		//grab cookies
		Cookie[] cookies = req.getCookies();
		String mapname = "";
		if (cookies != null) {
		 for (Cookie cookie : cookies) {
		   if(cookie.getName().equals("mapname")){
			 mapname = cookie.getValue();  
		   }
		  }
		}
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();	
		
		Key userKey = KeyFactory.createKey("User", tokens[7]);
		Entity user = null;
		Entity map = null;
	
		
		//test to see if user found in datastore
		//Entity.get() method throws exception if no entities found --> using query
		Filter keyFilter =
				  new FilterPredicate("userID", 
				                      FilterOperator.EQUAL,
				                      tokens[7]);
		Query q = new Query("User").setFilter(keyFilter);
		
		PreparedQuery pq = ds.prepare(q);
		Entity result = pq.asSingleEntity();
		int numElts = 0;	//number of elements in array used to store old tile list from datastore 
		if(result == null){ // if user does not exist yet
			user = new Entity("User", userKey);
			user.setProperty("userID", tokens[7]); //can't seem to search for key,  place this heres
			ds.put(user);
			
			map = new Entity("Map", mapname+tokens[7], user.getKey());  //map a child of user
			
			mdata = new Text(tiledata);

			map.setProperty("mapname", mapname);
			if(build.equals("bld")) //if build
				map.setProperty("tile_list", mdata);
			ds.put(map);
			
			
		}
		else{ // if user exist, find mapname belonging to user 
			user = result;
			Filter mapnameFilter = new FilterPredicate("mapname", 
                    FilterOperator.EQUAL,
                    mapname);
			
			Query q1 = new Query("Map").setAncestor(user.getKey()).setFilter(mapnameFilter);
			
			PreparedQuery mpq = ds.prepare(q1);
			map = mpq.asSingleEntity();
			if(map != null){ // if  map exists 
					Text fetched;
					
					if( (fetched =(Text) (map.getProperty("tile_list"))) != null){ /*if tile_list exists */
						olddata = fetched.getValue();
						if(build.equals("bld")){ // if build 
							newdata = olddata + "|" + tiledata;
							mdata = new Text(newdata);
						}
						if(build.equals("bull")){ // if bulldoze 
							String[] oldtoks = olddata.split("\\|");
							if(oldtoks.length >= 1){
								for(int i=0; i < oldtoks.length; i++){
									if(oldtoks[i].equals(tiledata))
										//remove element -- will leave extra element at end
										if( i < oldtoks.length-1){ //if element to remove not last element
											numElts = oldtoks.length - ( i + 1 ) ;
											System.arraycopy( oldtoks, i + 1, oldtoks, i, numElts ) ; 
										}
								    	break;
								}
								//minus 1 to cut off last not needed value
								
								for(int k=0;  k < oldtoks.length - 1; k++){
									newdata += oldtoks[k] + "|";
								}
								newdata = newdata.substring(0, newdata.length()-1); //chop off last |
							
								mdata = new Text(newdata);
							}//end if len >1
							//else length = 0, do nothing here because mdata=null already
						}//end if bulldoze
					}//end if tile_list
					else{ // tiledata does not exist
						if(build.equals("bld"))
							mdata = new Text(tiledata);	
						
					}
			}
			else{ // map does not exist yet 
				map = new Entity("Map", mapname+tokens[7], user.getKey());
				if(build.equals("bld"))
					mdata = new Text(tiledata);
				map.setProperty("mapname", mapname);
				//user.setProperty("map_list", mapname);
			}
			map.setProperty("tile_list", mdata);
			ds.put(map);
		
		}//end if user exists
		
		String url = "/game.jsp";
		RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(url);
		try {
			dispatcher.forward(req, resp);
		} catch (ServletException e) {
			e.printStackTrace();
		}
		
		return;
	}
		
	 /**
     * Handles the HTTP
     * <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP
     * <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

}
	
		

