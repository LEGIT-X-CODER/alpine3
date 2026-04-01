package com.alpine;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.util.stream.Collectors;

/**
 * MathOpsServlet — Handles all mathematical operations.
 * POST /api/math
 * Request  JSON: { "op": "sin", "a": 30, "b": null }
 * Response JSON: { "result": "0.5", "operation": "sin(30°)" }
 *
 * Supported operations:
 *   sin, cos, tan, sqrt, log, log10, abs, ceil, floor,
 *   factorial, add, sub, mul, div, pow, mod
 */
public class MathOpsServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");

        String body = req.getReader().lines().collect(Collectors.joining());
        JsonObject json = gson.fromJson(body, JsonObject.class);
        String op = json.has("op") ? json.get("op").getAsString().toLowerCase() : "";
        double a  = json.has("a") && !json.get("a").isJsonNull()
                    ? json.get("a").getAsDouble() : 0;
        double b  = json.has("b") && !json.get("b").isJsonNull()
                    ? json.get("b").getAsDouble() : 0;

        JsonObject out = new JsonObject();
        try {
            double result;
            String label;
            switch (op) {
                // Trigonometry (degrees input)
                case "sin":
                    result = Math.sin(Math.toRadians(a));
                    label  = "sin(" + a + "°)";
                    break;
                case "cos":
                    result = Math.cos(Math.toRadians(a));
                    label  = "cos(" + a + "°)";
                    break;
                case "tan":
                    result = Math.tan(Math.toRadians(a));
                    label  = "tan(" + a + "°)";
                    break;
                // Roots & logs
                case "sqrt":
                    if (a < 0) throw new ArithmeticException("Cannot sqrt a negative number");
                    result = Math.sqrt(a);
                    label  = "√" + a;
                    break;
                case "log":
                    if (a <= 0) throw new ArithmeticException("log undefined for ≤ 0");
                    result = Math.log(a);
                    label  = "ln(" + a + ")";
                    break;
                case "log10":
                    if (a <= 0) throw new ArithmeticException("log10 undefined for ≤ 0");
                    result = Math.log10(a);
                    label  = "log₁₀(" + a + ")";
                    break;
                // Rounding
                case "abs":
                    result = Math.abs(a);
                    label  = "|" + a + "|";
                    break;
                case "ceil":
                    result = Math.ceil(a);
                    label  = "⌈" + a + "⌉";
                    break;
                case "floor":
                    result = Math.floor(a);
                    label  = "⌊" + a + "⌋";
                    break;
                // Factorial (integer only)
                case "factorial":
                    int n = (int) a;
                    if (n < 0) throw new ArithmeticException("Factorial undefined for negatives");
                    if (n > 20) throw new ArithmeticException("Input too large (max 20)");
                    long fact = 1;
                    for (int i = 2; i <= n; i++) fact *= i;
                    result = fact;
                    label  = n + "!";
                    break;
                // Arithmetic
                case "add":
                    result = a + b;
                    label  = a + " + " + b;
                    break;
                case "sub":
                    result = a - b;
                    label  = a + " − " + b;
                    break;
                case "mul":
                    result = a * b;
                    label  = a + " × " + b;
                    break;
                case "div":
                    if (b == 0) throw new ArithmeticException("Division by zero");
                    result = a / b;
                    label  = a + " ÷ " + b;
                    break;
                case "pow":
                    result = Math.pow(a, b);
                    label  = a + " ^ " + b;
                    break;
                case "mod":
                    if (b == 0) throw new ArithmeticException("Modulo by zero");
                    result = a % b;
                    label  = a + " mod " + b;
                    break;
                default:
                    out.addProperty("error", "Unknown operation: " + op);
                    res.getWriter().write(gson.toJson(out));
                    return;
            }
            // Format: trim unnecessary decimals
            String formatted = (result == Math.floor(result) && !Double.isInfinite(result))
                               ? String.valueOf((long) result)
                               : String.format("%.6f", result).replaceAll("0+$", "")
                                                               .replaceAll("\\.$", "");
            out.addProperty("result", formatted);
            out.addProperty("operation", label);
        } catch (ArithmeticException ae) {
            out.addProperty("error", ae.getMessage());
        } catch (Exception e) {
            out.addProperty("error", "Calculation error: " + e.getMessage());
        }
        res.getWriter().write(gson.toJson(out));
    }
}
