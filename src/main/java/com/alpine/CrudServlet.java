package com.alpine;

import com.google.gson.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;
import java.util.stream.Collectors;

/**
 * CrudServlet — Full REST CRUD for the 'students' Derby table.
 *
 * GET    /api/students          → list all students
 * GET    /api/students?id=N     → get single student
 * POST   /api/students          → create  { name, roll_no, branch, cgpa }
 * PUT    /api/students?id=N     → update  { name, roll_no, branch, cgpa }
 * DELETE /api/students?id=N     → delete
 */
public class CrudServlet extends HttpServlet {

    private final Gson gson = new Gson();

    // ── READ ─────────────────────────────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String idParam = req.getParameter("id");

        try (Connection conn = DBUtil.getConnection()) {
            if (idParam != null) {
                // Single record
                PreparedStatement ps = conn.prepareStatement(
                    "SELECT * FROM students WHERE id = ?");
                ps.setInt(1, Integer.parseInt(idParam));
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    res.getWriter().write(gson.toJson(rowToJson(rs)));
                } else {
                    res.setStatus(404);
                    res.getWriter().write("{\"error\":\"Student not found\"}");
                }
            } else {
                // All records
                ResultSet rs = conn.createStatement()
                    .executeQuery("SELECT * FROM students ORDER BY id");
                JsonArray arr = new JsonArray();
                while (rs.next()) arr.add(rowToJson(rs));
                res.getWriter().write(gson.toJson(arr));
            }
        } catch (Exception e) {
            sendError(res, 500, e.getMessage());
        }
    }

    // ── CREATE ────────────────────────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        JsonObject body = parseBody(req);

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO students (name, roll_no, branch, cgpa) VALUES (?,?,?,?)",
                Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, body.get("name").getAsString());
            ps.setString(2, body.get("roll_no").getAsString());
            ps.setString(3, body.get("branch").getAsString());
            ps.setDouble(4, body.get("cgpa").getAsDouble());
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            JsonObject out = new JsonObject();
            out.addProperty("message", "Student created");
            out.addProperty("id", keys.getInt(1));
            res.setStatus(201);
            res.getWriter().write(gson.toJson(out));
        } catch (Exception e) {
            sendError(res, 500, e.getMessage());
        }
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String idParam = req.getParameter("id");
        if (idParam == null) { sendError(res, 400, "id param required"); return; }
        JsonObject body = parseBody(req);

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "UPDATE students SET name=?, roll_no=?, branch=?, cgpa=? WHERE id=?");
            ps.setString(1, body.get("name").getAsString());
            ps.setString(2, body.get("roll_no").getAsString());
            ps.setString(3, body.get("branch").getAsString());
            ps.setDouble(4, body.get("cgpa").getAsDouble());
            ps.setInt(5, Integer.parseInt(idParam));
            int rows = ps.executeUpdate();
            if (rows == 0) { sendError(res, 404, "Student not found"); return; }
            res.getWriter().write("{\"message\":\"Student updated\"}");
        } catch (Exception e) {
            sendError(res, 500, e.getMessage());
        }
    }

    // ── DELETE ────────────────────────────────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String idParam = req.getParameter("id");
        if (idParam == null) { sendError(res, 400, "id param required"); return; }

        try (Connection conn = DBUtil.getConnection()) {
            PreparedStatement ps = conn.prepareStatement(
                "DELETE FROM students WHERE id=?");
            ps.setInt(1, Integer.parseInt(idParam));
            int rows = ps.executeUpdate();
            if (rows == 0) { sendError(res, 404, "Student not found"); return; }
            res.getWriter().write("{\"message\":\"Student deleted\"}");
        } catch (Exception e) {
            sendError(res, 500, e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private JsonObject parseBody(HttpServletRequest req) throws IOException {
        String body = req.getReader().lines().collect(Collectors.joining());
        return gson.fromJson(body, JsonObject.class);
    }

    private JsonObject rowToJson(ResultSet rs) throws SQLException {
        JsonObject obj = new JsonObject();
        obj.addProperty("id",      rs.getInt("id"));
        obj.addProperty("name",    rs.getString("name"));
        obj.addProperty("roll_no", rs.getString("roll_no"));
        obj.addProperty("branch",  rs.getString("branch"));
        obj.addProperty("cgpa",    rs.getDouble("cgpa"));
        return obj;
    }

    private void sendError(HttpServletResponse res, int status, String msg)
            throws IOException {
        res.setStatus(status);
        res.getWriter().write("{\"error\":\"" + msg + "\"}");
    }
}
