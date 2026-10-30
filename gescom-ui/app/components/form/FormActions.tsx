/** Fila de botones al pie de un formulario (Cancelar / Guardar). */
export default function FormActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-6">{children}</div>;
}
