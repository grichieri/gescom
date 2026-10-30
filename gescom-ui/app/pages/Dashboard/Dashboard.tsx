import { useNavigate } from "react-router";
import Card from "~/components/ui/Card";
import EmptyState from "~/components/ui/EmptyState";
import PageHeader from "~/components/ui/PageHeader";
import StatCard from "~/components/ui/StatCard";
import { ButtonLink } from "~/components/ui/Button";
import { PriorityBadge, StatusBadge } from "~/components/ui/Badge";
import { useAuth } from "~/hooks/useAuth";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import { useIncidences } from "~/hooks/useIncidences";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import { countByStatus, isOverdue, newestFirst } from "~/utils/format";
import { formatRelative } from "~/utils/formatDate";

export default function Dashboard() {
  useDocumentTitle("Inicio");
  const community = useRequireCommunity();
  const { user } = useAuth();
  const { incidences: communityIncidences, loading, error, retry } = useIncidences(community?.communityId); // vienen del back
  const navigate = useNavigate();

  if (!community || !user) return null;

  const incidences = communityIncidences;
  const counts = countByStatus(incidences);
  const overdue = incidences.filter(isOverdue).length;
  const recent = [...incidences].sort(newestFirst).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Hola, ${user.name}`}
        subtitle={`Resumen de ${community.name}`}
        actions={
          <ButtonLink to="/incidences/new">
            Nueva incidencia
          </ButtonLink>
        }
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error">
            {error}{" "}
            <Button size="sm" variant="secondary" onClick={retry}>
              Reintentar
            </Button>
          </Alert>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Cada tarjeta lleva al listado de incidencias ya filtrado (estado = 1, 2 o 3; plazo = vencido) */}
        <StatCard label="Pendientes" value={counts.pending} tone="red" to="/incidences?estado=1" />
        <StatCard label="En proceso" value={counts.inProgress} tone="orange" to="/incidences?estado=2" />
        <StatCard label="Resueltas" value={counts.resolved} tone="green" to="/incidences?estado=3" />
        <StatCard label="Fuera de plazo" value={overdue} tone="gray" to="/incidences?plazo=vencido" />
      </div>

      <Card
        title="Incidencias recientes"
        action={
          <ButtonLink to="/incidences" variant="ghost" size="sm">
            Ver todas
          </ButtonLink>
        }
      >
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500">Cargando incidencias…</p>
        ) : recent.length === 0 ? (
          <EmptyState title="Todavía no hay incidencias" description="Cuando alguien reporte una, aparecerá aquí." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((i) => (
              <li key={i.incidenceId}>
                <button
                  type="button"
                  onClick={() => navigate(`/incidences/${i.incidenceId}`)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-left hover:bg-brand-bg"
                >
                  <span>
                    <span className="block font-bold text-brand-dark">{i.name}</span>
                    <span className="text-xs text-gray-500">{formatRelative(i.createdDate)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <PriorityBadge priority={i.priority} />
                    <StatusBadge status={i.status} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
