import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Button, { ButtonLink } from "~/components/ui/Button";
import Icon from "~/components/ui/Icon";
import PageHeader from "~/components/ui/PageHeader";
import SearchInput from "~/components/ui/SearchInput";
import StatCard from "~/components/ui/StatCard";
import Table, { type Column } from "~/components/ui/Table";
import { PriorityBadge, StatusBadge } from "~/components/ui/Badge";
import SelectField from "~/components/form/SelectField";
import Alert from "~/components/ui/Alert";
import { useData } from "~/hooks/useData";
import { useIncidences } from "~/hooks/useIncidences";
import { PRIORITY_LABELS, STATUS_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import type { Incidence } from "~/types";
import { countByStatus, isOverdue, newestFirst, propertyLabel } from "~/utils/format";
import { formatRelative } from "~/utils/formatDate";

export default function Incidences() {
  useDocumentTitle("Incidencias");
  const community = useRequireCommunity();
  const { data } = useData();
  const { incidences, loading, error, retry } = useIncidences(community?.communityId); // vienen del back
  const navigate = useNavigate();

  // El estado y "fuera de plazo" viven en la URL (?estado=1 y ?plazo=vencido), así el Dashboard puede enlazar
  // a un listado ya filtrado y el botón "Atrás" del navegador funciona.
  const [searchParams, setSearchParams] = useSearchParams();
  const estado = searchParams.get("estado") ?? "";
  const status = Object.keys(STATUS_LABELS).includes(estado) ? estado : ""; // ignora valores que no sean 1, 2 o 3
  const overdueOnly = searchParams.get("plazo") === "vencido";

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(status !== "");
  const [priority, setPriority] = useState("");

  // Si llega un estado por la URL, los filtros se muestran para que se vea qué está filtrando
  useEffect(() => {
    if (status !== "") setShowFilters(true);
  }, [status]);

  // Cambia (o quita, con null) uno o varios parámetros de la URL sin añadir entradas al historial
  const setUrlFilters = (changes: { estado?: string | null; plazo?: string | null }) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    setSearchParams(next, { replace: true });
  };

  if (!community) return null;

  const propertyOf = (i: Incidence) => data.properties.find((p) => p.propertyId === i.propertyId);
  const all = incidences;
  const counts = countByStatus(all);

  // Datos derivados: se calculan en cada render a partir del estado (no son estado)
  const visible = all
    .filter((i) => i.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((i) => status === "" || i.status === Number(status))
    .filter((i) => priority === "" || i.priority === Number(priority))
    .filter((i) => !overdueOnly || isOverdue(i))
    .sort(newestFirst);

  const columns: Column<Incidence>[] = [
    {
      header: "Incidencia",
      cell: (i) => <span className="font-bold text-brand-dark">{i.name}</span>,
    },
    { header: "Ubicación", cell: (i) => <span className="text-gray-600">{propertyLabel(propertyOf(i))}</span> },
    { header: "Prioridad", cell: (i) => <PriorityBadge priority={i.priority} /> },
    { header: "Estado", cell: (i) => <StatusBadge status={i.status} /> },
    { header: "Fecha", cell: (i) => <span className="whitespace-nowrap text-gray-500">{formatRelative(i.createdDate)}</span> },
  ];

  return (
    <>
      <PageHeader
        title="Incidencias comunitarias"
        subtitle={`Gestiona los reportes de mantenimiento en ${community.name}.`}
        actions={
          <ButtonLink to="/incidences/new">
            <Icon name="plus" className="h-4 w-4" />
            Nueva incidencia
          </ButtonLink>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pendientes" value={counts.pending} tone="red" />
        <StatCard label="En proceso" value={counts.inProgress} tone="orange" />
        <StatCard label="Resueltas" value={counts.resolved} tone="green" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar incidencia por título..." />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
            <Icon name="filter" className="h-4 w-4" />
            Filtrar
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 grid gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
          <SelectField
            label="Estado"
            placeholder="Todos"
            value={status}
            onChange={(e) => setUrlFilters({ estado: e.target.value })}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <SelectField
            label="Prioridad"
            placeholder="Todas"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={() => {
                setUrlFilters({ estado: null, plazo: null });
                setPriority("");
                setSearch("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {overdueOnly && (
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Mostrando:</span>
          <button
            type="button"
            onClick={() => setUrlFilters({ plazo: null })}
            aria-label="Quitar el filtro «Fuera de plazo»"
            className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
          >
            Fuera de plazo
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <Alert tone="error">
            {error}{" "}
            <button type="button" onClick={retry} className="font-bold underline">
              Reintentar
            </button>
          </Alert>
        </div>
      )}
      {loading && <p className="py-6 text-center text-sm text-gray-500">Cargando incidencias…</p>}

      {!loading && !error && (
        <Table
          columns={columns}
          rows={visible}
          rowKey={(i) => i.incidenceId}
          onRowClick={(i) => navigate(`/incidences/${i.incidenceId}`)}
          emptyMessage="No hay incidencias que coincidan con la búsqueda"
        />
      )}
      {!loading && !error && (
        <p className="mt-2 text-xs text-gray-500">
          Mostrando {visible.length} de {all.length} incidencias
        </p>
      )}
    </>
  );
}
