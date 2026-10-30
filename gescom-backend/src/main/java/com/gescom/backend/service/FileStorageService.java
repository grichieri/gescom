package com.gescom.backend.service;

import com.gescom.backend.exception.ArchivoNoValidoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Locale;
import java.util.UUID;

/**
 * Guarda en disco los archivos subidos (por ahora, las fotos de las incidencias).
 * Cada archivo se guarda en <gescom.uploads.dir>/<carpeta>/<uuid>.<ext> y se publica en
 * /upload/<carpeta>/<uuid>.<ext> (lo sirve UploadsConfig). En la base de datos se guarda esa URL.
 */
@Service
public class FileStorageService {

    /** Prefijo de las URL públicas de los archivos subidos. */
    public static final String URL_PREFIX = "/upload/";

    /**
     * Tipos de imagen que se aceptan y la extensión con la que se guardan.
     * El tamaño máximo está en application.yaml (spring.servlet.multipart).
     */
    public static final Map<String, String> TIPOS_PERMITIDOS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");

    private final Path raiz;

    public FileStorageService(@Value("${gescom.uploads.dir:uploads}") String uploadsDir) {
        this.raiz = Paths.get(uploadsDir).toAbsolutePath().normalize();
    }

    /** Carpeta raíz donde se guardan los archivos. */
    public Path getRaiz() {
        return raiz;
    }

    /**
     * Guarda el archivo con un nombre aleatorio (nunca con el nombre que manda el cliente)
     * y devuelve su URL pública, por ejemplo /upload/incidencias/3f2a...jpg
     */
    public String guardar(MultipartFile archivo, String carpeta) {
        String nombre = UUID.randomUUID() + TIPOS_PERMITIDOS.getOrDefault(archivo.getContentType(), "");
        Path destino = raiz.resolve(carpeta).resolve(nombre).normalize();
        try {
            Files.createDirectories(destino.getParent());
            try (InputStream in = archivo.getInputStream()) {
                Files.copy(in, destino);
            }
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo guardar el archivo " + nombre, e);
        }
        return URL_PREFIX + carpeta + "/" + nombre;
    }

    /**
     * Comprueba que el archivo es una imagen que aceptamos. No basta con el Content-Type, porque lo
     * decide el cliente: también se miran los primeros bytes del archivo (su "firma").
     */
    public void validarImagen(MultipartFile archivo) {
        String nombre = archivo.getOriginalFilename() == null ? "sin nombre" : archivo.getOriginalFilename();
        if (archivo.isEmpty()) {
            throw new ArchivoNoValidoException("La foto \"" + nombre + "\" está vacía");
        }
        String tipo = archivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.containsKey(tipo)) {
            throw new ArchivoNoValidoException("Solo se admiten fotos JPG, PNG o WEBP (\"" + nombre + "\" no lo es)");
        }
        if (!firmaCoincide(cabecera(archivo), tipo)) {
            throw new ArchivoNoValidoException("El archivo \"" + nombre + "\" no es una imagen válida");
        }
    }

    /** Borra el archivo de una URL devuelta por guardar. Si no existe o la URL no es nuestra, no hace nada. */
    public void borrar(String url) {
        if (url == null || !url.startsWith(URL_PREFIX)) {
            return;
        }
        Path archivo = raiz.resolve(url.substring(URL_PREFIX.length())).normalize();
        if (!archivo.startsWith(raiz)) {
            return; // evita borrar fuera de la carpeta de subidas (p. ej. con "../")
        }
        try {
            Files.deleteIfExists(archivo);
        } catch (IOException e) {
            // no es grave: queda un archivo huérfano en disco
        }
    }

    /** Los 12 primeros bytes del archivo (o menos, si es más corto). */
    private static byte[] cabecera(MultipartFile archivo) {
        try (InputStream in = archivo.getInputStream()) {
            return in.readNBytes(12);
        } catch (IOException e) {
            throw new UncheckedIOException("No se pudo leer el archivo", e);
        }
    }

    /**
     * Firmas de cada formato:
     *  - JPG: FF D8 FF
     *  - PNG: 89 50 4E 47 0D 0A 1A 0A  (\x89PNG\r\n\x1a\n)
     *  - WEBP: "RIFF" + 4 bytes de tamaño + "WEBP"
     */
    private static boolean firmaCoincide(byte[] b, String tipo) {
        return switch (tipo) {
            case "image/jpeg" -> empiezaPor(b, 0, 0xFF, 0xD8, 0xFF);
            case "image/png" -> empiezaPor(b, 0, 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A);
            case "image/webp" -> empiezaPor(b, 0, 'R', 'I', 'F', 'F') && empiezaPor(b, 8, 'W', 'E', 'B', 'P');
            default -> false;
        };
    }

    private static boolean empiezaPor(byte[] b, int desde, int... esperados) {
        if (b.length < desde + esperados.length) {
            return false;
        }
        for (int i = 0; i < esperados.length; i++) {
            if ((b[desde + i] & 0xFF) != esperados[i]) {
                return false;
            }
        }
        return true;
    }
    /** ".jpg" a partir del nombre original; solo letras y números, para no colar rutas raras. */
    private static String extension(String nombreOriginal) {
        if (nombreOriginal == null || !nombreOriginal.contains(".")) {
            return "";
        }
        String ext = nombreOriginal.substring(nombreOriginal.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return ext.matches("[a-z0-9]{1,5}") ? "." + ext : "";
    }
}
