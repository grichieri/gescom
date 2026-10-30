package com.gescom.backend.controller;

import com.gescom.backend.dto.IncidenceRequest;
import com.gescom.backend.dto.IncidenceResponse;
import com.gescom.backend.exception.ArchivoNoValidoException;
import com.gescom.backend.service.IncidenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * POST /api/incidences en multipart, tal como lo envía el front (partes "incidencia" y "fotos").
 * Se prueba solo el controlador (el servicio es un mock), sin base de datos.
 */
class IncidencesControllerMultipartTest {

    private static final String INCIDENCIA_JSON =
            "{\"communityId\":1,\"reportedByUserId\":5,\"name\":\"Fuga en el garaje\",\"priority\":2}";

    private IncidenceService incidenceService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        incidenceService = mock(IncidenceService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new IncidencesController(incidenceService))
                .setControllerAdvice(new ErrorHandler())
                .build();
    }

    @Test
    @SuppressWarnings("unchecked")
    void multipartConFotosLlegaAlServicio() throws Exception {
        IncidenceResponse creada = new IncidenceResponse();
        creada.setIncidenceId(7L);
        creada.setStatus((short) 1);
        when(incidenceService.guardar(any(IncidenceRequest.class), anyList())).thenReturn(creada);

        mockMvc.perform(multipart("/api/incidences")
                        .file(new MockMultipartFile("incidencia", "", MediaType.APPLICATION_JSON_VALUE, INCIDENCIA_JSON.getBytes()))
                        .file(new MockMultipartFile("fotos", "1.jpg", "image/jpeg", new byte[]{1}))
                        .file(new MockMultipartFile("fotos", "2.png", "image/png", new byte[]{2})))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidenceId").value(7))
                .andExpect(jsonPath("$.status").value(1));

        ArgumentCaptor<IncidenceRequest> request = ArgumentCaptor.forClass(IncidenceRequest.class);
        ArgumentCaptor<List<MultipartFile>> fotos = ArgumentCaptor.forClass(List.class);
        verify(incidenceService).guardar(request.capture(), fotos.capture());
        assertEquals("Fuga en el garaje", request.getValue().getName());
        assertEquals(2, fotos.getValue().size());
    }

    @Test
    void jsonSigueUsandoElPostDeSiempre() throws Exception {
        when(incidenceService.guardar(any(IncidenceRequest.class))).thenReturn(new IncidenceResponse());

        mockMvc.perform(post("/api/incidences").contentType(MediaType.APPLICATION_JSON).content(INCIDENCIA_JSON))
                .andExpect(status().isOk());

        verify(incidenceService).guardar(any(IncidenceRequest.class));
        verify(incidenceService, never()).guardar(any(IncidenceRequest.class), anyList());
    }

    @Test
    void fotoNoValidaDevuelve400ConElMensaje() throws Exception {
        when(incidenceService.guardar(any(IncidenceRequest.class), anyList()))
                .thenThrow(new ArchivoNoValidoException("Solo se admiten fotos JPG, PNG o WEBP"));

        mockMvc.perform(multipart("/api/incidences")
                        .file(new MockMultipartFile("incidencia", "", MediaType.APPLICATION_JSON_VALUE, INCIDENCIA_JSON.getBytes()))
                        .file(new MockMultipartFile("fotos", "a.gif", "image/gif", new byte[]{1})))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Solo se admiten fotos JPG, PNG o WEBP"));
    }

    @Test
    void incidenciaSinTituloDevuelve400() throws Exception {
        String sinTitulo = "{\"communityId\":1,\"reportedByUserId\":5,\"name\":\"\"}";

        mockMvc.perform(multipart("/api/incidences")
                        .file(new MockMultipartFile("incidencia", "", MediaType.APPLICATION_JSON_VALUE, sinTitulo.getBytes())))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(incidenceService);
    }
}
