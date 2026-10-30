import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import EmptyState from "~/components/ui/EmptyState";
import Icon from "~/components/ui/Icon";
import PageHeader from "~/components/ui/PageHeader";
import CityProvinceFields from "~/components/form/CityProvinceFields";
import FormActions from "~/components/form/FormActions";
import PropertyForm, { type PropertyFormValues } from "~/components/form/PropertyForm";
import SegmentedField from "~/components/form/SegmentedField";
import TextField from "~/components/form/TextField";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import type { NewPropertyInput } from "~/data/store";
import { COMMUNITY_TYPE_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import { locationOf, propertyLabel } from "~/utils/format";
import * as v from "~/utils/validation";

type CommunityValues = {
  name: string;
  type: string; // "1" Edificio, "2" Chalet
  nif: string;
  address: string;
  zipCode: string;
  provinceId: string;
  cityId: string;
};

/** Sirve para crear (/communities/new) y para editar (/communities/:id/edit) una comunidad. */
export default function NewCommunity() {
  const { id } = useParams();
  const editing = id !== undefined;
  useDocumentTitle(editing ? "Editar comunidad" : "Nueva comunidad");

  const { role } = useAuth();
  const { data, addCommunity, updateCommunity } = useData();
  const navigate = useNavigate();
  const existing = editing ? data.communities.find((c) => String(c.communityId) === id) : undefined;

  const initialLocation = locationOf(existing?.cityId ?? null);
  const form = useForm<CommunityValues>(
    {
      name: existing?.name ?? "",
      type: String(existing?.type ?? 1),
      nif: existing?.nif ?? "",
      address: existing?.address ?? "",
      zipCode: existing?.zipCode ?? "",
      provinceId: initialLocation.province ? String(initialLocation.province.provinceId) : "",
      cityId: existing ? String(existing.cityId) : "",
    },
    (values) => ({
      name: v.required(values.name, "El nombre"),
      nif: v.required(values.nif, "El CIF"),
      address: v.required(values.address, "La dirección"),
      zipCode: v.zipCode(values.zipCode),
      provinceId: v.required(values.provinceId, "La provincia"),
      cityId: v.required(values.cityId, "La ciudad"),
    }),
  );

  // Propiedades que se van añadiendo mientras se crea la comunidad
  const [properties, setProperties] = useState<NewPropertyInput[]>([]);
  const [addingProperty, setAddingProperty] = useState(false);

  if (role !== "superadmin") return <Alert tone="error">Solo el superadministrador puede gestionar comunidades.</Alert>;
  if (editing && !existing) {
    return (
      <EmptyState title="Comunidad no encontrada" action={<Button onClick={() => navigate("/communities")}>Volver a comunidades</Button>} />
    );
  }

  const addProperty = (values: PropertyFormValues) => {
    setProperties((prev) => [
      ...prev,
      { address: values.address.trim(), blockPortal: values.blockPortal.trim() || null, zipCode: values.zipCode.trim() },
    ]);
    setAddingProperty(false);
  };

  const onSubmit = (values: CommunityValues) => {
    const input = {
      name: values.name.trim(),
      type: Number(values.type) as 1 | 2,
      nif: values.nif.trim().toUpperCase(),
      address: values.address.trim(),
      zipCode: values.zipCode.trim(),
      cityId: Number(values.cityId),
    };
    if (existing) {
      updateCommunity(existing.communityId, input);
      navigate(`/communities/${existing.communityId}`);
    } else {
      navigate(`/communities/${addCommunity(input, properties)}`);
    }
  };

  return (
    <>
      <PageHeader
        title={editing ? "Editar comunidad" : "Registrar nueva comunidad"}
        subtitle="Completa la información técnica y administrativa"
      />

      <div className="max-w-3xl space-y-6">
        <form id="community-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <Card title="Datos generales">
            <div className="space-y-5">
              <TextField label="Nombre de la comunidad" placeholder="Ej: Residencial Los Álamos" {...form.field("name")} />
              <SegmentedField
                label="Tipo"
                value={form.values.type}
                onChange={(value) => form.setValue("type", value)}
                options={[
                  { value: "1", label: COMMUNITY_TYPE_LABELS[1] },
                  { value: "2", label: COMMUNITY_TYPE_LABELS[2] },
                ]}
              />
              <TextField label="Dirección completa" placeholder="Calle, número, bloque..." {...form.field("address")} />
              <div className="grid gap-5 sm:grid-cols-2">
                <CityProvinceFields
                  provinceId={form.values.provinceId}
                  cityId={form.values.cityId}
                  onChange={(next) => form.setValues(next)}
                  errors={{ provinceId: form.field("provinceId").error, cityId: form.field("cityId").error }}
                />
                <TextField label="Código postal" placeholder="28001" inputMode="numeric" maxLength={5} {...form.field("zipCode")} />
                <TextField label="CIF" placeholder="H12345678" {...form.field("nif")} />
              </div>
            </div>
          </Card>
        </form>

        {/* Los <form> no pueden anidarse: las propiedades van fuera del formulario principal */}
        {!editing && (
          <Card
            title="Propiedades de la comunidad"
            action={
              !addingProperty && (
                <Button variant="secondary" size="sm" onClick={() => setAddingProperty(true)}>
                  <Icon name="plus" className="h-4 w-4" />
                  Añadir propiedades
                </Button>
              )
            }
          >
            <p className="mb-4 text-sm text-gray-500">Registra cada vivienda, portal y bloque que compone esta comunidad.</p>

            {properties.length > 0 && (
              <ul className="mb-4 divide-y divide-gray-100 rounded-lg border border-gray-200 text-sm">
                {properties.map((p, index) => (
                  <li key={`${p.address}-${index}`} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span>
                      <span className="block font-medium text-brand-dark">{propertyLabel({ ...p, propertyId: 0, communityId: 0 })}</span>
                      <span className="text-xs text-gray-500">CP {p.zipCode}</span>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setProperties((prev) => prev.filter((_, i) => i !== index))}>
                      Quitar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {properties.length === 0 && !addingProperty && (
              <p className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                Aún no has añadido propiedades a esta comunidad.
              </p>
            )}

            {addingProperty && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <PropertyForm
                  submitLabel="Añadir a la lista"
                  defaultZipCode={form.values.zipCode}
                  onSubmit={addProperty}
                  onCancel={() => setAddingProperty(false)}
                />
              </div>
            )}
          </Card>
        )}

        <FormActions>
          <Button variant="secondary" onClick={() => navigate(editing ? `/communities/${id}` : "/communities")}>
            Cancelar
          </Button>
          <Button type="submit" form="community-form">
            {editing ? "Guardar cambios" : "Guardar comunidad"}
          </Button>
        </FormActions>
      </div>
    </>
  );
}
