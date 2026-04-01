package com.alpine;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.util.stream.Collectors;

/**
 * StringOpsServlet — Handles all string operations.
 * POST /api/string
 * Request  JSON: { "op": "reverse", "s1": "hello", "s2": "" }
 * Response JSON: { "result": "olleh", "operation": "Reverse of 'hello'" }
 *
 * Supported operations:
 *   length, reverse, palindrome, concat, initials,
 *   wordcount, togglecase, vowels, consonants, uppercase, lowercase
 */
public class StringOpsServlet extends HttpServlet {

    private final Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {
        res.setContentType("application/json;charset=UTF-8");

        String body = req.getReader().lines().collect(Collectors.joining());
        JsonObject json = gson.fromJson(body, JsonObject.class);
        String op = json.has("op") ? json.get("op").getAsString().toLowerCase() : "";
        String s1 = json.has("s1") ? json.get("s1").getAsString() : "";
        String s2 = json.has("s2") ? json.get("s2").getAsString() : "";

        JsonObject out = new JsonObject();
        try {
            String result;
            String label;
            switch (op) {
                case "length":
                    result = String.valueOf(s1.length());
                    label = "Length of \"" + s1 + "\"";
                    break;
                case "reverse":
                    result = new StringBuilder(s1).reverse().toString();
                    label = "Reverse of \"" + s1 + "\"";
                    break;
                case "palindrome":
                    String rev = new StringBuilder(s1).reverse().toString();
                    boolean isPalin = s1.equalsIgnoreCase(rev);
                    result = isPalin ? "✅ YES — Palindrome" : "❌ NO — Not a Palindrome";
                    label = "Palindrome check for \"" + s1 + "\"";
                    break;
                case "concat":
                    result = s1 + s2;
                    label = "\"" + s1 + "\" + \"" + s2 + "\"";
                    break;
                case "initials":
                    String[] words = s1.trim().split("\\s+");
                    StringBuilder initials = new StringBuilder();
                    for (String w : words) if (!w.isEmpty()) initials.append(w.charAt(0));
                    result = initials.toString().toUpperCase();
                    label = "Initials of \"" + s1 + "\"";
                    break;
                case "wordcount":
                    int wc = s1.trim().isEmpty() ? 0 : s1.trim().split("\\s+").length;
                    result = String.valueOf(wc);
                    label = "Word count in \"" + s1 + "\"";
                    break;
                case "togglecase":
                    StringBuilder toggled = new StringBuilder();
                    for (char c : s1.toCharArray())
                        toggled.append(Character.isUpperCase(c)
                            ? Character.toLowerCase(c) : Character.toUpperCase(c));
                    result = toggled.toString();
                    label = "Toggle case of \"" + s1 + "\"";
                    break;
                case "vowels":
                    long vowelCount = s1.chars()
                        .filter(c -> "aeiouAEIOU".indexOf(c) >= 0).count();
                    result = String.valueOf(vowelCount);
                    label = "Vowel count in \"" + s1 + "\"";
                    break;
                case "consonants":
                    long consCount = s1.chars()
                        .filter(c -> Character.isLetter(c) && "aeiouAEIOU".indexOf(c) < 0)
                        .count();
                    result = String.valueOf(consCount);
                    label = "Consonant count in \"" + s1 + "\"";
                    break;
                case "uppercase":
                    result = s1.toUpperCase();
                    label = "Uppercase of \"" + s1 + "\"";
                    break;
                case "lowercase":
                    result = s1.toLowerCase();
                    label = "Lowercase of \"" + s1 + "\"";
                    break;
                default:
                    out.addProperty("error", "Unknown operation: " + op);
                    res.getWriter().write(gson.toJson(out));
                    return;
            }
            out.addProperty("result", result);
            out.addProperty("operation", label);
        } catch (Exception e) {
            out.addProperty("error", e.getMessage());
        }
        res.getWriter().write(gson.toJson(out));
    }
}
