package com.gescom.backend.config;

import com.gescom.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Sirve los archivos subidos: GET /upload/incidencias/<uuid>.jpg devuelve el archivo guardado en disco. */
@Configuration
@RequiredArgsConstructor
public class UploadsConfig implements WebMvcConfigurer {

    private final FileStorageService fileStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Spring exige que una carpeta acabe en "/"; toUri() solo la añade si la carpeta ya existe
        String carpeta = fileStorageService.getRaiz().toUri().toString();
        registry.addResourceHandler(FileStorageService.URL_PREFIX + "**")
                .addResourceLocations(carpeta.endsWith("/") ? carpeta : carpeta + "/");
    }
}
