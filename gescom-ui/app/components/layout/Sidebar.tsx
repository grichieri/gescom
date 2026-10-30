import logoClaro from "~/assets/logo-claro.png";
import { Link } from "react-router";
import Icon, { type IconName } from "~/components/ui/Icon";
import Avatar from "~/components/ui/Avatar";
import { ROLE_LABELS } from "~/data/labels";
import type { Community, CommunityRole, User } from "~/types";

type SidebarProps = {
  user: User;
  community: Community | null;
  role: CommunityRole;
  /** Ruta actual, para marcar el enlace activo */
  pathname: string;
  /** true si pertenece a más de una comunidad: así puede volver a la lista y elegir otra */
  canSwitchCommunity: boolean;
  onLogout: () => void;
};

type Item = { to: string; label: string; icon: IconName; needsCommunity?: boolean };

export default function Sidebar({ user, community, role, pathname, canSwitchCommunity, onLogout }: SidebarProps) {
  const isSuperadmin = role === "superadmin";
  const items: Item[] = [{ to: "/dashboard", label: "Inicio", icon: "home", needsCommunity: true }];
  // El superadmin y quien trabaja en varias comunidades ven siempre el enlace a la lista de comunidades
  if (isSuperadmin || canSwitchCommunity) items.push({ to: "/communities", label: "Comunidades", icon: "building" });
  items.push({ to: "/incidences", label: "Incidencias", icon: "incidents", needsCommunity: true });
  if (isSuperadmin || role === "administrator") items.push({ to: "/users", label: "Usuarios", icon: "users", needsCommunity: true });
  items.push({ to: "/profile", label: "Perfil", icon: "user" });

  // "Comunidades" solo se marca en su lista y en las fichas de comunidad
  const isActive = (to: string) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <aside className="flex h-full w-64 flex-col bg-brand-dark text-gray-200">
      <div className="px-6 py-6">
        <img src={logoClaro} alt="GESCOM" className="h-10 w-auto" />
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-1 px-3">
        {items.map((item) =>
          item.needsCommunity && !community ? (
            // Sin comunidad elegida estas pantallas no tienen datos que mostrar
            <span
              key={item.to}
              aria-disabled="true"
              title="Elige primero una comunidad (botón ENTRAR)"
              className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500"
            >
              <Icon name={item.icon} />
              {item.label}
            </span>
          ) : (
          <Link
            key={item.to}
            to={item.to}
            aria-current={isActive(item.to) ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.to) ? "bg-brand-green text-white" : "text-gray-300 hover:bg-white/10"
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
          ),
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
        >
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <Avatar user={user} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {user.name} {user.lastname}
          </p>
          <p className="truncate text-xs text-gray-400">
            {ROLE_LABELS[role]}
            {community ? ` · ${community.name}` : ""}
          </p>
        </div>
      </div>
    </aside>
  );
}
