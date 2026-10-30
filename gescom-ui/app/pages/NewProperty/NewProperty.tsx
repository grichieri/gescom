import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import EmptyState from "~/components/ui/EmptyState";
import PageHeader from "~/components/ui/PageHeader";
import PropertyForm, { type PropertyFormValues } from "~/components/form/PropertyForm";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

export default function NewProperty() {
  useDocumentTitle("Añadir propiedad");
  const { id } = useParams();
  const { role } = useAuth();
  const { data, addProperty } = useData();
  const navigate = useNavigate();
  const [added, setAdded] = useState(0);

  const community = data.communities.find((c) => String(c.communityId) === id);

  if (role !== "superadmin") return <Alert tone="error">Solo el superadministrador puede añadir propiedades.</Alert>;
  if (!community) {
    return <EmptyState title="Comunidad no encontrada" action={<Button onClick={() => navigate("/communities")}>Volver a comunidades</Button>} />;
  }

  const back = () => navigate(`/communities/${community.communityId}`);

  const onSubmit = (values: PropertyFormValues, addAnother: boolean) => {
    addProperty(community.communityId, {
      address: values.address.trim(),
      blockPortal: values.blockPortal.trim() || null,
      zipCode: values.zipCode.trim(),
    });
    if (addAnother) setAdded((n) => n + 1);
    else back();
  };

  return (
    <>
      <PageHeader title="Añadir propiedad" subtitle={`${community.name} · Registro de nueva vivienda`} />
      <Card title="Datos de la propiedad" className="max-w-2xl">
        {added > 0 && (
          <div className="mb-5">
            <Alert tone="success">
              {added === 1 ? "Propiedad guardada." : `${added} propiedades guardadas.`} Puedes añadir otra.
            </Alert>
          </div>
        )}
        <PropertyForm
          submitLabel="Guardar propiedad"
          addAnotherLabel="Guardar y añadir otra propiedad"
          defaultZipCode={community.zipCode}
          onSubmit={onSubmit}
          onCancel={back}
        />
      </Card>
    </>
  );
}
