package com.gescom.mail.service;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Component;

/**
 * Rellena las plantillas de correo (carpeta templates/email).
 *
 * <ul>
 *   <li>{{variable}} se sustituye escapando el HTML (así un nombre con "&lt;" no rompe el correo).</li>
 *   <li>{{{variable}}} se sustituye tal cual; solo se usa para insertar el contenido en el diseño común.</li>
 *   <li>Si una plantilla pide una variable que no se ha enviado, se lanza un error: es un fallo de programación.</li>
 * </ul>
 *
 * Cada correo tiene una versión HTML ({@code nombre.html}, dentro de {@code layout.html}) y una de texto plano
 * ({@code nombre.txt}) para los clientes de correo que no muestran HTML.
 */
@Component
public class TemplateRenderer {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\{(\\w+)}}}|\\{\\{(\\w+)}}");
    private static final String BASE = "/templates/email/";

    private final Map<String, String> cache = new ConcurrentHashMap<>();

    /** Versión HTML: la plantilla dentro del diseño común. */
    public String renderHtml(EmailTemplate template, Map<String, String> variables) {
        String content = fill(load(template.resource() + ".html"), variables, true);
        Map<String, String> layoutVariables = new HashMap<>(variables);
        layoutVariables.put("content", content);
        return fill(load("layout.html"), layoutVariables, true);
    }

    /** Versión de texto plano: sin escapar nada. */
    public String renderText(EmailTemplate template, Map<String, String> variables) {
        return fill(load(template.resource() + ".txt"), variables, false);
    }

    static String escapeHtml(String value) {
        StringBuilder out = new StringBuilder(value.length() + 16);
        for (char c : value.toCharArray()) {
            switch (c) {
                case '&' -> out.append("&amp;");
                case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;");
                case '"' -> out.append("&quot;");
                case '\'' -> out.append("&#39;");
                default -> out.append(c);
            }
        }
        return out.toString();
    }

    private String fill(String text, Map<String, String> variables, boolean escape) {
        Matcher matcher = PLACEHOLDER.matcher(text);
        StringBuilder out = new StringBuilder();
        while (matcher.find()) {
            boolean raw = matcher.group(1) != null;
            String name = raw ? matcher.group(1) : matcher.group(2);
            String value = variables.get(name);
            if (value == null) {
                throw new IllegalArgumentException("La plantilla usa la variable '" + name + "' y no se ha enviado");
            }
            String replacement = (escape && !raw) ? escapeHtml(value) : value;
            matcher.appendReplacement(out, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(out);
        return out.toString();
    }

    private String load(String fileName) {
        return cache.computeIfAbsent(fileName, name -> {
            try (InputStream in = TemplateRenderer.class.getResourceAsStream(BASE + name)) {
                if (in == null) {
                    throw new IllegalStateException("No existe la plantilla " + BASE + name);
                }
                return new String(in.readAllBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                throw new UncheckedIOException(e);
            }
        });
    }
}
