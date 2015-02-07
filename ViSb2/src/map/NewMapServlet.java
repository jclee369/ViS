package map;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.*;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Text;




@SuppressWarnings("serial")
public class NewMapServlet extends HttpServlet {

	public void processRequest(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		
		String mapdata = req.getParameter("datastr");
		String[] tokens = mapdata.split(",");
		
		Cookie[] cookies = req.getCookies();
		String mapname = "";
		Text tmp = new Text("");
		if (cookies != null) {
		 for (Cookie cookie : cookies) {
		 
		   if(cookie.getName().equals("mapname")){
			 mapname = cookie.getValue();  
		   }
		  }
		}
		
		String url = "/game.jsp";
		RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(url);
       
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();	
		
		String mdata = "";
		Key userKey = KeyFactory.createKey("User", tokens[0]);
		//Key userKey = new KeyFactory.Builder("User", tokens[0]).addChild("Map", "map").getKey();
		Entity user = null;
		Entity map = null;
		
		//test to see if user found in datastore
		//Entity.get() method throws exception if no entities found --> using query
		Filter keyFilter =
				  new FilterPredicate("userID", 
				                      FilterOperator.EQUAL,
				                      tokens[0]);
		Query q = new Query("User").setFilter(keyFilter);
		
		PreparedQuery pq = ds.prepare(q);
		Entity result = pq.asSingleEntity();
		//if does not exist create new
		if(result == null){ /* if user does not exist yet */
			user = new Entity("User", userKey);
			user.setProperty("userID", tokens[0]); //can't seem to search for key,  place this heres
			ds.put(user);
			
			map = new Entity("Map", mapname+tokens[0], user.getKey()); //map child of user
			
			//map_list = mapname;
			//map.setProperty("tile_list", "");  //to init tile_list
			map.setProperty("mapname", mapname);
			//user.setProperty("map_list", map_list);
			ds.put(map);
			
			
		}
		else{ /* if user exist, get mapname, get current tile_list and append tile */
			user = result;
			
			Filter mapnameFilter = new FilterPredicate("mapname", 
                    FilterOperator.EQUAL,
                    mapname);
			
			Query q1 = new Query("Map").setAncestor(user.getKey()).setFilter(mapnameFilter);
			
			PreparedQuery mpq = ds.prepare(q1);
			Entity mresult = mpq.asSingleEntity();
			if(mresult != null){ /* if  map exists */
				resp.setContentType("text/plain");
				resp.setCharacterEncoding("UTF-8");
				resp.setHeader("Cache-Control", "no-cache");
				PrintWriter out = resp.getWriter();
				out.print("A map with this name already exists!");
				out.flush();
				out.close();
				//req.setAttribute("msg", "A map with this name already exist!"); //send message
				try {
					url = "/index.jsp";
					dispatcher = getServletContext().getRequestDispatcher(url);
					dispatcher.forward(req, resp);
					return;
				} catch (ServletException e) {
					e.printStackTrace();
				}
			}else{ /* map name not used yet */
				map = new Entity("Map", mapname+tokens[0], user.getKey());
				//map.setProperty("tile_list", "");  //to init tile_list
				map.setProperty("mapname", mapname);
				//map_list = mapname;
				//user.setProperty("map_list", map_list);
				ds.put(map);
			}
			
		}
				
		//MemcacheService memcache = MemcacheServiceFactory.getMemcacheService();
		//String cacheKey = "User:" + userKey;
				
		
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
	
		

