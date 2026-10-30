import { Link } from "react-router";
import Icon from "~/components/ui/Icon";
import type { Community } from "~/types";

const titles: [RegExp, string][] = [
  [/^\/dashboard/, "Inicio"],
  [/^\/communities\/new/, "Registrar nueva comunidad"],
  [/^\/communities\/\d+\/edit/, "Editar comunidad"],
  [/^\/communities\/\d+\/properties\/new/, "Añadir propiedad"],
  [/^\/communities\/\d+/, "Detalle de comunidad"],
  [/^\/communities/, "Panel de control"],
  [/^\/incidences\/new/, "Reportar nueva incidencia"],
  [/^\/incidences\/\d+/, "Detalle de incidencia"],
  [/^\/incidences/, "Panel de incidencias"],
  [/^\/users\/new/, "Añadir nuevo usuario"],
  [/^\/users\/\d+\/edit/, "Editar usuario"],
  [/^\/users/, "Usuarios"],
  [/^\/profile/, "Mi perfil"],
];

type TopbarProps = {
  community: Community | null;
  /** true si el usuario puede cambiar entre varias comunidades */
  showSwitch: boolean;
  pathname: string;
  onMenu: () => void;
};

export default function Topbar({ community, showSwitch, pathname, onMenu }: TopbarProps) {
  const title = titles.find(([re]) => re.test(pathname))?.[1] ?? "GESCOM";

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-8">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onMenu} aria-label="Abrir menú" className="rounded-lg p-1.5 text-brand-dark hover:bg-gray-100 lg:hidden">
          <Icon name="menu" />
        </button>
        <h2 className="text-lg font-bold text-brand-dark">{title}</h2>
      </div>
      {community && (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <span className="hidden sm:inline">Comunidad:</span>
          <span className="rounded-full bg-brand-bg px-3 py-1 font-bold text-brand-green">{community.name}</span>
          {showSwitch && (
            <Link to="/communities" className="text-xs font-bold text-brand-green hover:underline">
              Cambiar
            </Link>
          )}
        </p>
      )}
    </header>
  );
}
