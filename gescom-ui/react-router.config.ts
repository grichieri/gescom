import type { Config } from "@react-router/dev/config";

export default {
  // Modo SPA: todo se pinta en el navegador (como una app de Vite). Los datos y la sesión se leen de
  // localStorage al abrir cada pantalla; en el servidor no existe, por eso no se renderiza allí.
  ssr: false,
} satisfies Config;
