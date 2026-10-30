package com.gescom.mail.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;

import org.junit.jupiter.api.Test;

class TemplateRendererTest {

    private final TemplateRenderer renderer = new TemplateRenderer();

    private Map<String, String> verificationData(String name) {
        return Map.of(
                "name", name,
                "url", "http://localhost:5173/verify?token=abc&x=1",
                "expiryNote", "Este enlace caduca en 24 horas.",
                "appName", "Gescom",
                "title", "Verifica tu cuenta de Gescom");
    }

    @Test
    void htmlIncluyeElEnlaceYElDisenoComun() {
        String html = renderer.renderHtml(EmailTemplate.VERIFICATION, verificationData("Ana"));

        assertThat(html).contains("http://localhost:5173/verify?token=abc&amp;x=1");
        assertThat(html).contains("Ana");
        assertThat(html).contains("<html");
        assertThat(html).doesNotContain("{{");
    }

    @Test
    void htmlEscapaElNombre() {
        String html = renderer.renderHtml(EmailTemplate.VERIFICATION, verificationData("<script>x</script>"));

        assertThat(html).doesNotContain("<script>");
        assertThat(html).contains("&lt;script&gt;");
    }

    @Test
    void textoPlanoNoEscapa() {
        String text = renderer.renderText(EmailTemplate.VERIFICATION, verificationData("A & B"));

        assertThat(text).contains("A & B");
        assertThat(text).contains("http://localhost:5173/verify?token=abc&x=1");
    }

    @Test
    void faltaUnaVariable() {
        assertThatThrownBy(() -> renderer.renderText(EmailTemplate.VERIFICATION, Map.of("name", "Ana")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("url");
    }

    @Test
    void escapeHtmlCubreLosCaracteresPeligrosos() {
        assertThat(TemplateRenderer.escapeHtml("<a href=\"x\">&'</a>"))
                .isEqualTo("&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
    }
}
