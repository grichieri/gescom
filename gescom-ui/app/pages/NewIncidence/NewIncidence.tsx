import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Modal from "~/components/ui/Modal";
import PageHeader from "~/components/ui/PageHeader";
import MultiImageField from "~/components/form/MultiImageField";
import FormActions from "~/components/form/FormActions";
import SegmentedField from "~/components/form/SegmentedField";
import SelectField from "~/components/form/SelectField";
import TextAreaField from "~/components/form/TextAreaField";
import TextField from "~/components/form/TextField";
import Alert from "~/components/ui/Alert";
import { createIncidence } from "~/api/incidences";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { MAX_INCIDENCE_PICTURES, PRIORITY_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import { propertyLabel } from "~/utils/format";
import { canManage } from "~/utils/roles";
import * as v from "~/utils/validation";

type IncidenceFormValues = {
  name: string;
  propertyId: string; // "" = zona común
  priority: string;
  description: string;
  pictures: string[];
};

export default function NewIncidence() {
  useDocumentTitle("Nueva incidencia");
  const community = useRequireCommunity();
  const { user, role } = useAuth();
  const { data } = useData();
  const navigate = useNavigate();
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<IncidenceFormValues>({ name: "", propertyId: "", priority: "1", description: "", pictures: [] }, (values) => ({
    name: v.required(values.name, "El título") || (values.name.length > 150 ? "Máximo 150 caracteres" : ""),
    description: v.required(values.description, "La descripción"),
  }));

  if (!community || !user) return null;

  // Solo quien gestiona la comunidad asigna prioridad; el resto la deja en «Baja» y la administración la revisa
  const canSetPriority = canManage(role);
  const properties = data.properties.filter((p) => p.communityId === community.communityId);

  const onSubmit = async (values: IncidenceFormValues) => {
    setSending(true);
    setError("");
    try {
      // POST /api/incidences: el back devuelve la incidencia creada, con su incidenceId
      const created = await createIncidence(
        {
          communityId: community.communityId,
          propertyId: values.propertyId === "" ? null : Number(values.propertyId),
          reportedByUserId: user.userId, // TODO: cuando exista el login del back, lo sacará él del token
          name: values.name.trim(),
          priority: canSetPriority ? (Number(values.priority) as 1 | 2 | 3) : 1,
          description: values.description.trim(),
        },
        values.pictures,
      );
      setCreatedId(created.incidenceId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reportar la incidencia.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader title="Detalles de la incidencia" subtitle="Por favor, describe el problema con la mayor claridad posible." />

      <Card className="max-w-3xl">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <TextField label="Título de la incidencia" placeholder="Ej: Rotura de cristal en portal 1" maxLength={150} {...form.field("name")} />

          <div className={canSetPriority ? "grid gap-5 sm:grid-cols-2" : undefined}>
            <SelectField
              label="Ubicación"
              hint="Elige tu vivienda o deja «Zona común»"
              options={[
                { value: "", label: "Zona común" },
                ...properties.map((p) => ({ value: String(p.propertyId), label: propertyLabel(p) })),
              ]}
              {...form.field("propertyId")}
            />
            {canSetPriority && (
              <SegmentedField
                label="Prioridad"
                value={form.values.priority}
                onChange={(value) => form.setValue("priority", value)}
                options={[1, 2, 3].map((p) => ({ value: String(p), label: PRIORITY_LABELS[p as 1 | 2 | 3] }))}
              />
            )}
          </div>

          <TextAreaField label="Descripción detallada" placeholder="Explica qué ha sucedido y dónde exactamente..." {...form.field("description")} />

          <MultiImageField
            label="Fotos (opcional)"
            hint={`Puedes adjuntar hasta ${MAX_INCIDENCE_PICTURES} fotos.`}
            images={form.values.pictures}
            max={MAX_INCIDENCE_PICTURES}
            onChange={(images) => form.setValue("pictures", images)}
          />

          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Comunidad</p>
            <p className="font-bold text-brand-dark">{community.name}</p>
          </div>

          <FormActions>
            <Button variant="secondary" onClick={() => navigate("/incidences")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? "Enviando…" : "Reportar incidencia"}
            </Button>
          </FormActions>
        </form>
      </Card>

      {createdId !== null && (
        <Modal
          title="¡Incidencia reportada!"
          onClose={() => navigate("/incidences")}
          footer={
            <>
              <Button variant="secondary" onClick={() => navigate("/incidences")}>
                Ir al listado
              </Button>
              <Button onClick={() => navigate(`/incidences/${createdId}`)}>Ver incidencia</Button>
            </>
          }
        >
          Hemos registrado tu incidencia y se ha notificado a la administración de la comunidad.
        </Modal>
      )}
    </>
  );
}
