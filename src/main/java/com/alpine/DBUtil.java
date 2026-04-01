package com.alpine;

import java.sql.*;

/**
 * DBUtil - Derby Embedded Database Utility
 * Handles connection and auto-creates the students table on first run.
 * Derby stores data at: /opt/alpine-webtech/derbydb
 */
public class DBUtil {

    // Derby database path on Alpine VM
    private static final String DB_PATH =
        System.getProperty("derby.db.path", "/opt/alpine-webtech/derbydb");

    private static final String DB_URL =
        "jdbc:derby:" + DB_PATH + ";create=true";

    static {
        try {
            // Load Derby embedded driver
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
            initSchema();
        } catch (Exception e) {
            throw new RuntimeException("DBUtil init failed: " + e.getMessage(), e);
        }
    }

    /** Creates the students table if it doesn't already exist */
    private static void initSchema() throws SQLException {
        try (Connection conn = getConnection();
             Statement stmt = conn.createStatement()) {
            try {
                stmt.executeUpdate(
                    "CREATE TABLE students (" +
                    "  id      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY," +
                    "  name    VARCHAR(100) NOT NULL," +
                    "  roll_no VARCHAR(30)  NOT NULL," +
                    "  branch  VARCHAR(60)  NOT NULL," +
                    "  cgpa    DOUBLE       NOT NULL" +
                    ")"
                );
                System.out.println("[DBUtil] Table 'students' created.");
            } catch (SQLException e) {
                // X0Y32 = table already exists — safe to ignore
                if (!"X0Y32".equals(e.getSQLState())) throw e;
                System.out.println("[DBUtil] Table 'students' already exists.");
            }
        }
    }

    /** Returns a new Derby Connection */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }
}
