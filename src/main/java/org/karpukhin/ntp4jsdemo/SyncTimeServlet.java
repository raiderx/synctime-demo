package org.karpukhin.ntp4jsdemo;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * @author Pavel Karpukhin
 * @since 31.08.16
 */
public class SyncTimeServlet extends HttpServlet {

    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        long ms = System.currentTimeMillis();

        long t = Long.parseLong(req.getParameter("t"));

        Map<String, Object> result = new HashMap<String, Object>();
        result.put("offset", ms - t);
        result.put("origtime", t);

        resp.setContentType("application/json");
        mapper.writeValue(resp.getOutputStream(), result);
        resp.getOutputStream().close();
    }
}
