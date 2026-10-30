import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SplitAuthLayout } from "~/components/layout/AuthLayout";
import Button from "~/components/ui/Button";
import TextField from "~/components/form/TextField";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import heroImage from "~/assets/hero-login.jpg";

/**
 * PANTALLA DE DEMOSTRACIÓN (solo para la presentación): no habla con el back ni crea ningún usuario.
 * Va en /demo-registro y sigue un guion, sea cual sea lo escrito (así no depende de erratas en directo):
 *
 *   1. Al pasar del USUARIO a la CONTRASEÑA (con clic o con Tab) por primera vez  -> USUARIO_EXISTE
 *   2. Al volver a pasar del usuario a la contraseña (ya con otro usuario)       -> USUARIO_OK
 *   3. A partir de ahí, cada vez que se pulsa "Registrarse" sale el siguiente mensaje de GUION.
 *
 * Al volver a escribir en el usuario o en la contraseña, el mensaje desaparece. Escape reinicia todo.
 * Para quitarla: borrar esta carpeta y la línea "demo-registro" de routes.ts.
 */

/** Primer paso al contraseña (por ejemplo con "AitorTilla"): el usuario ya existe. */
const USUARIO_EXISTE = "Ese usuario ya existe. ¿Seguro que eres tú?";

/** Segundo paso a la contraseña (por ejemplo con "Aitor_Tilla_OE"): usuario aceptado. */
const USUARIO_OK = "¡Ese sí es mi gaditano! Ahora la contraseña, ¡pisha!";

/** Contraseñas: un mensaje por intento. Después del último se repite el último. Cámbialos a tu gusto. */
const GUION: string[] = [
  "Lo siento, esa contraseña ya está registrada. \nIntenta una diferente.",
  "Contraseña inválida: \nDebe ser más larga.",
  "Contraseña inválida: \nPisha, ponle algún chirmbolito.",
  "Contraseña inválida: \nCasi lo tienes campeón!! \nPonle algún numerito y alguna Mayúscula.",
  "Lo siento, esa contraseña ya está registrada. \nIntenta una diferente. 🤣😜🤡",
];

type Aviso = { id: number; texto: string; ok: boolean };

export default function DemoRegistro() {
  useDocumentTitle("Registro de usuario");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [pasosUsuario, setPasosUsuario] = useState(0); // 0 = nada aún, 1 = "ya existe", 2 = usuario aceptado
  const [intento, setIntento] = useState(0); // cuántas veces se ha pulsado "Registrarse" ya con usuario aceptado
  const [aviso, setAviso] = useState<Aviso | null>(null);

  const mostrar = (texto: string, ok = false) => setAviso((a) => ({ id: (a?.id ?? 0) + 1, texto, ok }));

  // Escape = empezar el guion de nuevo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPasosUsuario(0);
        setIntento(0);
        setAviso(null);
        setPassword("");
        setUsuario("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Se pasa del usuario a la contraseña (clic o Tab): salen los mensajes del usuario, de uno en uno. */
  const avanzarUsuario = (): boolean => {
    if (usuario.trim() === "" || pasosUsuario >= 2) return false;
    if (pasosUsuario === 0) mostrar(USUARIO_EXISTE);
    else mostrar(USUARIO_OK, true);
    setPasosUsuario((n) => n + 1);
    return true;
  };

  const registrar = (e: React.FormEvent) => {
    e.preventDefault();
    // Si se pulsa el botón sin haber pasado por la contraseña, también salen los mensajes del usuario
    if (avanzarUsuario()) return;
    if (password === "") {
      mostrar("Escribe una contraseña, anda."); // sin contraseña no se avanza en el guion
      return;
    }
    mostrar(GUION[Math.min(intento, GUION.length - 1)]);
    setIntento((n) => n + 1);
  };

  return (
    <SplitAuthLayout
      image={heroImage}
      headline="Gestiona tu comunidad de forma inteligente."
      text="La plataforma definitiva para la gestión de incidencias y convivencia en tu edificio."
    >
      {/* Animaciones del aviso: aparece con un pequeño salto y, si es un error, se sacude */}
      <style>{`
        @keyframes demo-sacudida {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(9px); }
          45% { transform: translateX(-7px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
        }
        @keyframes demo-aparece {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <h2 className="text-3xl font-bold text-brand-dark">Registro de usuario</h2>
      <p className="mt-1 text-gray-500">Crea tu cuenta en Gescom</p>

      <form onSubmit={registrar} noValidate className="mt-8 space-y-5">
        {aviso && (
          <div
            // la key cambia con cada aviso, para que la animación se repita aunque el texto sea el mismo
            key={aviso.id}
            role={aviso.ok ? "status" : "alert"}
            className={`whitespace-pre-line text-center rounded-xl border-2 px-5 py-4 text-lg font-bold leading-snug shadow-sm ${
              aviso.ok ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-red-300 bg-red-50 text-red-700"
            }`}
            style={{
              animation: aviso.ok
                ? "demo-aparece 0.25s ease-out"
                : "demo-aparece 0.2s ease-out, demo-sacudida 0.5s ease-in-out 0.1s",
            }}
          >
            <span className="mr-2 text-2xl" aria-hidden="true">
              {aviso.ok ? "🎉" : "🚫"}
            </span>
            {aviso.texto}
          </div>
        )}

        <TextField
          label="Usuario"
          type="text"
          placeholder="Nombre de usuario"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
          value={usuario}
          onChange={(e) => {
            setUsuario(e.target.value);
            setAviso(null); // al volver a escribir, desaparece el aviso
          }}
        />

        {/* Contraseña visible a propósito: el público tiene que leer lo que se escribe */}
        <TextField
          label="Contraseña"
          type="text"
          placeholder="Escribe tu contraseña"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore
          value={password}
          onFocus={avanzarUsuario}
          onChange={(e) => {
            setPassword(e.target.value);
            setAviso(null); // al volver a escribir, desaparece el aviso
          }}
        />

        <Button type="submit" fullWidth>
          Registrarse
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{" "}
        <Link to="/login" className="font-bold text-brand-green hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </SplitAuthLayout>
  );
}
