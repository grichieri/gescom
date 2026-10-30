import { Link } from "react-router";
import logo from "~/assets/logo.png";
import logoClaro from "~/assets/logo-claro.png";

type SplitAuthLayoutProps = {
  /** Imagen de fondo del panel izquierdo */
  image: string;
  headline: string;
  text: string;
  /** Contenido extra del panel izquierdo (cita, pasos...) */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

/** Pantallas de entrada con panel de marca a la izquierda y formulario a la derecha. */
export function SplitAuthLayout({ image, headline, text, aside, children }: SplitAuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-dark p-10 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <img src={logoClaro} alt="GESCOM" className="relative h-14 w-auto self-start" />
        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight">{headline}</h1>
          <p className="mt-4 text-gray-200">{text}</p>
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <div className="relative text-xs text-gray-300">© 2026 GESCOM. Gestión Comunitaria Inteligente.</div>
      </div>
      <div className="flex items-center justify-center px-6 py-10 sm:px-12">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}

/** Pantallas sencillas centradas (recuperación de contraseña, verificación de correo). */
export function CenteredAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/login" className="mb-8">
        <img src={logo} alt="GESCOM" className="h-14 w-auto" />
      </Link>
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">{children}</div>
      <p className="mt-6 text-sm text-gray-500">
        ¿Necesitas ayuda?{" "}
        <a href="mailto:soporte@gescom.es" className="font-bold text-brand-green hover:underline">
          Contactar con soporte
        </a>
      </p>
    </div>
  );
}
