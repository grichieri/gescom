import { useEffect } from "react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Botones al pie de la ventana */
  footer?: React.ReactNode;
  /** Ancho de la ventana: "lg" para contenidos grandes, como una foto */
  size?: "md" | "lg";
};

export default function Modal({ title, onClose, children, footer, size = "md" }: ModalProps) {
  // Cerrar con la tecla Escape; el listener se retira al desmontar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${size === "lg" ? "max-w-3xl" : "max-w-md"} rounded-xl bg-white p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-brand-dark">{title}</h2>
        <div className="mt-3 text-sm text-gray-600">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
