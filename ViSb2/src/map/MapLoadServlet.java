package map;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;


public class MapLoadServlet extends HttpServlet {

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
		
		
		DatastoreService ds = DatastoreServiceFactory.getDatastoreService();	
		
		//find user in datastore
		Filter keyFilter =
				  new FilterPredicate("userID", 
				                      FilterOperator.EQUAL,
				                      userID);
		Query q = new Query("User").setFilter(keyFilter);
		
		PreparedQuery pq = ds.prepare(q);
		Entity user = pq.asSingleEntity();
		
		if(user == null){ //if does not exist, no maps saved (map a child of user and always programmatically created with user)
			resp.setContentType("text/plain");
			resp.setCharacterEncoding("UTF-8");
			resp.setHeader("Cache-Control", "no-cache");
			PrintWriter out = resp.getWriter();
			out.print("no maps saved.");
			out.flush();
			out.close();
			return;
		}
		else{ /* user exists, find saved maps */
			Query q1 = new Query("Map").setAncestor(user.getKey());
			
			PreparedQuery mpq = ds.prepare(q1);
			List<Entity> mresults = mpq.asList(FetchOptions.Builder.withDefaults());
			
			//get map names and append to string
			String mapList = "";
			for(Entity entry: mresults){
				String mapname = (String) entry.getProperty("mapname");
				mapList += mapname + ",";
			}
			mapList = mapList.substring(0, mapList.length() - 1);  //remove last comma
			
			
			//send string mapList in response
			resp.setContentType("text/plain");
			resp.setCharacterEncoding("UTF-8");
			resp.setHeader("Cache-Control", "no-cache");
			PrintWriter out = resp.getWriter();
			out.print(mapList);
			out.flush();
			out.close();
			
		}
		
     
        
		
		String url = "/index.jsp";
        RequestDispatcher dispatcher = getServletContext().getRequestDispatcher(url);
        dispatcher.forward(req, resp);
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

