package com.gescom.backend.service;

import com.gescom.backend.exception.ArchivoNoValidoException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

/** Prueba FileStorageService sobre una carpeta temporal (no hace falta arrancar Spring ni la base de datos). */
class FileStorageServiceTest {

    @TempDir
    Path tmp;

    private FileStorageService storage;

    @BeforeEach
    void setUp() {
        storage = new FileStorageService(tmp.toString());
    }

    @Test
    void guardaElArchivoYDevuelveSuUrlPublica() throws Exception {
        MockMultipartFile foto = new MockMultipartFile("fotos", "fuga.JPG", "image/jpeg", new byte[]{1, 2, 3});

        String url = storage.guardar(foto, "incidencias");

        assertTrue(url.matches("/upload/incidencias/[0-9a-f-]{36}\\.jpg"), url);
        Path enDisco = tmp.resolve(url.substring("/upload/".length()));
        assertArrayEquals(new byte[]{1, 2, 3}, Files.readAllBytes(enDisco));
    }

    @Test
    void noUsaElNombreDelClienteParaLaRuta() {
        MockMultipartFile foto = new MockMultipartFile("fotos", "../../etc/passwd", "image/png", new byte[]{1});

        String url = storage.guardar(foto, "incidencias");

        // el nombre es un UUID y la extensión sale del tipo: el archivo queda dentro de la carpeta
        assertTrue(url.matches("/upload/incidencias/[0-9a-f-]{36}\\.png"), url);
    }

    @Test
    void borraElArchivoDeUnaUrl() {
        String url = storage.guardar(new MockMultipartFile("fotos", "a.png", "image/png", new byte[]{1}), "incidencias");
        Path enDisco = tmp.resolve(url.substring("/upload/".length()));

        storage.borrar(url);

        assertFalse(Files.exists(enDisco));
    }

    // ---------- validarImagen (IMG-B04) ----------

    private static final byte[] JPG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0x10};
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};
    private static final byte[] WEBP = {'R', 'I', 'F', 'F', 1, 2, 3, 4, 'W', 'E', 'B', 'P', 'V', 'P'};

    @Test
    void aceptaJpgPngYWebpDeVerdad() {
        assertDoesNotThrow(() -> storage.validarImagen(new MockMultipartFile("fotos", "a.jpg", "image/jpeg", JPG)));
        assertDoesNotThrow(() -> storage.validarImagen(new MockMultipartFile("fotos", "a.png", "image/png", PNG)));
        assertDoesNotThrow(() -> storage.validarImagen(new MockMultipartFile("fotos", "a.webp", "image/webp", WEBP)));
    }

    @Test
    void rechazaUnArchivoVacio() {
        var e = assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "a.jpg", "image/jpeg", new byte[0])));
        assertTrue(e.getMessage().contains("vacía"));
    }

    @Test
    void rechazaTiposNoPermitidos() {
        assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "a.gif", "image/gif", "GIF89a".getBytes())));
        assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "a.pdf", "application/pdf", "%PDF-1.7".getBytes())));
        assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "a", null, JPG)));
    }

    @Test
    void rechazaUnArchivoQueDiceSerImagenPeroNoLoEs() {
        // un ejecutable renombrado a .jpg: el cliente dice image/jpeg, pero los bytes no son de un JPG
        byte[] exe = {'M', 'Z', (byte) 0x90, 0, 3, 0, 0, 0};
        assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "virus.jpg", "image/jpeg", exe)));
        // un PNG enviado como JPG tampoco cuadra
        assertThrows(ArchivoNoValidoException.class,
                () -> storage.validarImagen(new MockMultipartFile("fotos", "a.jpg", "image/jpeg", PNG)));
    }

    @Test
    void noBorraNadaFueraDeLaCarpetaDeSubidas() throws Exception {
        Path fuera = Files.writeString(tmp.getParent().resolve("no-borrar-" + System.nanoTime() + ".txt"), "x");
        try {
            storage.borrar("/upload/../" + fuera.getFileName());
            assertTrue(Files.exists(fuera));
        } finally {
            Files.deleteIfExists(fuera);
        }
    }
}
