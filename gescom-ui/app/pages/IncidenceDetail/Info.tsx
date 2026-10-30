/** Pareja etiqueta/valor de la ficha de una incidencia (componente propio de esta pantalla). */
export default function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-brand-dark">{value}</dd>
    </div>
  );
}
