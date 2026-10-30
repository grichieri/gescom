import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { UNAUTHORIZED_EVENT } from "~/api/client";
import { useAuth } from "~/hooks/useAuth";
import { DATA_CHANGED } from "~/hooks/useData";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * Estructura común de las pantallas internas: menú lateral + cabecera + contenido.
 * Este componente NO se desmonta al navegar entre pantallas, así que vuelve a leer la
 * sesión cada vez que cambia la ruta (por ejemplo, tras elegir otra comunidad).
 */
export default function AppLayout() {
  const auth = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    auth.reload();
    setMenuOpen(false); // en móvil, el menú se cierra al cambiar de pantalla
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Si otra pantalla guarda cambios (por ejemplo, la foto de perfil), el menú se actualiza al momento
  useEffect(() => {
    const onChanged = () => auth.reload();
    window.addEventListener(DATA_CHANGED, onChanged);
    return () => window.removeEventListener(DATA_CHANGED, onChanged);
  }); // sin lista de dependencias: así `auth.reload` es siempre el de este pintado

  // El back ha rechazado el token (caducado): la sesión ya está borrada, se vuelve a leer y se va al login
  useEffect(() => {
    const onUnauthorized = () => auth.reload();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  // Sin sesión se vuelve al login
  useEffect(() => {
    if (!auth.user) navigate("/login", { replace: true });
  }, [auth.user, navigate]);

  if (!auth.user) return null;

  const handleLogout = () => {
    auth.logout();
    setMenuOpen(false);
  };

  const sidebar = (
    <Sidebar user={auth.user} community={auth.community} role={auth.role} pathname={pathname} canSwitchCommunity={auth.communityIds.length > 1} onLogout={handleLogout} />
  );

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar community={auth.community} showSwitch={auth.communityIds.length > 1} pathname={pathname} onMenu={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-8">
          <Outlet />
        </main>
        <footer className="px-8 py-4 text-xs text-gray-400">© 2026 GESCOM. Gestión Comunitaria Inteligente.</footer>
      </div>
    </div>
  );
}
