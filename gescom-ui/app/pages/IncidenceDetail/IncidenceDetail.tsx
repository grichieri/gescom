import { useState } from "react";
import { Link, useParams } from "react-router";
import Alert from "~/components/ui/Alert";
import Avatar from "~/components/ui/Avatar";
import Button, { ButtonLink } from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import EmptyState from "~/components/ui/EmptyState";
import PictureGallery from "~/components/ui/PictureGallery";
import Icon from "~/components/ui/Icon";
import { PriorityBadge, RoleBadge, StatusBadge } from "~/components/ui/Badge";
import DateField from "~/components/form/DateField";
import SelectField from "~/components/form/SelectField";
import TextAreaField from "~/components/form/TextAreaField";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { useIncidence } from "~/hooks/useIncidence";
import { addComment as addCommentInBack, updateIncidence as updateIncidenceInBack } from "~/api/incidences";
import { PRIORITY_LABELS, STATUS_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import type { Incidence } from "~/types";
import { fullName, incidenceCode, isOverdue, propertyLabel } from "~/utils/format";
import { formatDate, formatDateTime, formatRelative, toInputDate } from "~/utils/formatDate";
import { canManage, roleOf } from "~/utils/roles";
import Info from "./Info";

export default function IncidenceDetail() {
  const { id } = useParams();
  const community = useRequireCommunity();
  const { user, role } = useAuth();
  const { data } = useData();

  // La incidencia, sus fotos y sus comentarios vienen del back; usuarios y viviendas siguen en local
  const { detail, setDetail, loading, error, notFound, retry } = useIncidence(Number(id));
  const incidence = detail;
  useDocumentTitle(incidence ? incidence.name : "Incidencia");

  // Estado de los formularios de gestión: el borrador del comentario y los selectores
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  if (!community || !user) return null;

  if (loading) return <p className="py-6 text-center text-sm text-gray-500">Cargando incidencia…</p>;

  if (error) {
    return (
      <Alert tone="error">
        {error}{" "}
        <button type="button" onClick={retry} className="font-bold underline">
          Reintentar
        </button>
      </Alert>
    );
  }

  if (notFound || !incidence || incidence.communityId !== community.communityId) {
    return (
      <EmptyState
        title="Incidencia no encontrada"
        description="No existe o pertenece a otra comunidad."
        action={<ButtonLink to="/incidences">Volver a incidencias</ButtonLink>}
      />
    );
  }

  const reporter = data.users.find((u) => u.userId === incidence.reportedByUserId);
  const property = data.properties.find((p) => p.propertyId === incidence.propertyId);
  const comments = [...incidence.comments].sort((a, b) => a.createdDate.localeCompare(b.createdDate));
  const pictures = [...incidence.pictures].sort((a, b) => a.pictureId - b.pictureId);
  const manager = canManage(role);

  // Los selectores muestran el valor guardado hasta que el usuario elige otro
  const statusValue = status ?? String(incidence.status);
  const priorityValue = priority ?? String(incidence.priority);
  // Plazo máximo de resolución ("YYYY-MM-DD"); vacío = sin plazo
  const deadlineValue = deadline ?? incidence.maxResolutionDate ?? "";
  // (vaciar el campo no cuenta como cambio: el back no admite quitar un plazo ya fijado)
  const deadlineChanged = deadlineValue !== "" && deadlineValue !== (incidence.maxResolutionDate ?? "");
  const changed = statusValue !== String(incidence.status) || priorityValue !== String(incidence.priority) || deadlineChanged;

  const saveChanges = async () => {
    setSaving(true);
    setActionError("");
    try {
      const updated = await updateIncidenceInBack(incidence.incidenceId, {
        status: Number(statusValue) as Incidence["status"],
        priority: Number(priorityValue) as Incidence["priority"],
        // Solo se envía si cambió (el back no admite fechas pasadas y así no se rechaza un plazo antiguo ya guardado)
        ...(deadlineChanged ? { maxResolutionDate: deadlineValue } : {}),
      });
      setDetail({ ...incidence, ...updated, comments: incidence.comments });
      setStatus(null);
      setPriority(null);
      setDeadline(null);
      setSaved(true);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const submitNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (note.trim() === "") {
      setNoteError("Escribe un comentario");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      const created = await addCommentInBack(incidence.incidenceId, user.userId, note);
      setDetail({ ...incidence, comments: [...incidence.comments, created] });
      setNote("");
      setNoteError("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "No se pudo publicar el comentario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Link to="/incidences" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-brand-green hover:underline">
        <Icon name="arrowLeft" className="h-4 w-4" />
        Volver a incidencias
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-brand-dark">{incidence.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Reportado {formatRelative(incidence.createdDate).toLowerCase()}
                  {reporter ? ` por ${fullName(reporter)}` : ""}
                </p>
              </div>
              <StatusBadge status={incidence.status} />
            </div>

            <h2 className="mt-6 text-[11px] font-bold uppercase tracking-wide text-gray-500">Descripción</h2>
            <p className="mt-2 whitespace-pre-line text-gray-700">{incidence.description || "Sin descripción."}</p>

            <h2 className="mt-6 text-[11px] font-bold uppercase tracking-wide text-gray-500">Evidencias fotográficas</h2>
            <PictureGallery pictures={pictures} />
          </Card>

          <Card title="Seguimiento de la incidencia">
            <ol className="space-y-5 border-l-2 border-gray-200 pl-5">
              <li className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand-green" />
                <p className="font-bold text-brand-dark">Incidencia reportada</p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(incidence.createdDate)}
                  {reporter ? ` · ${fullName(reporter)}` : ""}
                </p>
              </li>
              {comments.map((c) => {
                const author = data.users.find((u) => u.userId === c.userId);
                return (
                  <li key={c.commentId} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-gray-300" />
                    <div className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        {author && <Avatar user={author} size="sm" />}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-brand-dark">{author ? fullName(author) : "Usuario eliminado"}</span>
                          {author && <RoleBadge role={roleOf(data, author, incidence.communityId)} />}
                        </div>
                        <span className="ml-auto text-xs text-gray-500">{formatRelative(c.createdDate)}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{c.comment}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            {comments.length === 0 && <p className="mt-4 text-sm text-gray-500">Aún no hay comentarios de la administración.</p>}

            {manager ? (
              <form onSubmit={submitNote} noValidate className="mt-6">
                <TextAreaField
                  label="Añadir una nota"
                  rows={3}
                  placeholder="Añadir una nota o duda..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  error={noteError}
                />
                <div className="mt-3 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    Publicar comentario
                  </Button>
                </div>
              </form>
            ) : (
              <p className="mt-6 text-xs text-gray-500">Solo la administración, la presidencia y la conserjería pueden comentar.</p>
            )}
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          <Card title="Información general">
            <dl className="space-y-4">
              <Info label="Estado" value={STATUS_LABELS[incidence.status]} />
              <Info label="Prioridad" value={<PriorityBadge priority={incidence.priority} />} />
              <Info label="Incidencia" value={incidenceCode(incidence)} />
              <Info label="Ubicación" value={propertyLabel(property)} />
              <Info
                label="Fecha máxima de resolución"
                value={
                  incidence.maxResolutionDate ? (
                    <span className={isOverdue(incidence) ? "font-bold text-red-600" : ""}>
                      {formatDate(incidence.maxResolutionDate)}
                      {isOverdue(incidence) ? " · fuera de plazo" : ""}
                    </span>
                  ) : (
                    "Sin fecha límite"
                  )
                }
              />
            </dl>
          </Card>

          {manager && (
            <Card title="Gestionar incidencia">
              <div className="space-y-4">
                {saved && <Alert tone="success">Cambios guardados.</Alert>}
                {actionError && <Alert tone="error">{actionError}</Alert>}
                <SelectField
                  label="Estado"
                  value={statusValue}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setSaved(false);
                  }}
                  options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <SelectField
                  label="Prioridad"
                  value={priorityValue}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    setSaved(false);
                  }}
                  options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
                />
                <DateField
                  label="Plazo máximo de resolución"
                  value={deadlineValue}
                  min={toInputDate()}
                  onChange={(e) => {
                    setDeadline(e.target.value);
                    setSaved(false);
                  }}
                />
                <Button fullWidth disabled={!changed || saving} onClick={saveChanges}>
                  Guardar cambios
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
