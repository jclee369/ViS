package map;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;


public class MapGetServlet extends HttpServlet {

    /**
     * Processes requests for both HTTP
     * <code>GET</code> and
     * <code>POST</code> methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
     
        String userID = req.getParameter("datastr");
		
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
		
		
		
		//find user in datastore
		Filter keyFilter =
			  new FilterPredicate("userID", 
					  FilterOperator.EQUAL,
			                     userID);
		Query q = new Query("User").setFilter(keyFilter);
				
		PreparedQuery pq = ds.prepare(q);
		Entity user = pq.asSingleEntity();
		//if null error occurred
		
		//find map with mapname
		Filter mapFilter = new FilterPredicate("mapname",
							FilterOperator.EQUAL,
							mapname);
		
		Query q1 = new Query("Map").setAncestor(user.getKey()).setFilter(mapFilter);
			
		PreparedQuery mpq = ds.prepare(q1);
		Entity map = mpq.asSingleEntity();
		//if null error occured
		
		String tileList = null;
		if(map != null){
			//get tile_list make a string
			Text tmp = (Text) (map.getProperty("tile_list"));
			if(tmp != null)
				tileList = tmp.getValue();
		}
		
			
		//send string tileList in response
		resp.setContentType("text/plain");
		resp.setCharacterEncoding("UTF-8");
		resp.setHeader("Cache-Control", "no-cache");
		PrintWriter out = resp.getWriter();
		out.print(tileList);
		out.flush();
		out.close();
        
		
		String url = "/game.jsp";
        RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(url);
        dispatcher.forward(req, resp);
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

