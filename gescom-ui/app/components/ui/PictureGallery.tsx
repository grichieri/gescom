import { useState } from "react";
import type { IncidencePicture } from "~/types";
import { isUploadedImage } from "~/utils/images";
import Button from "./Button";
import Icon from "./Icon";
import Modal from "./Modal";

/** Miniatura: la foto si está disponible; si solo se conoce la ruta del archivo, un marcador con su nombre. */
function Thumb({ picture, className }: { picture: IncidencePicture; className: string }) {
  if (isUploadedImage(picture.url)) return <img src={picture.url} alt="" className={`${className} object-cover`} />;
  return (
    <span className={`${className} flex flex-col items-center justify-center gap-1 bg-gray-50 p-2 text-center text-gray-400`}>
      <Icon name="image" className="h-6 w-6" />
      <span className="max-w-full truncate text-[11px] text-gray-500">{picture.url.split("/").pop()}</span>
    </span>
  );
}

/** Galería de fotos de una incidencia: miniaturas que se amplían en una ventana, con anterior/siguiente. */
export default function PictureGallery({ pictures }: { pictures: IncidencePicture[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (pictures.length === 0) return <p className="mt-2 text-sm text-gray-500">No se adjuntaron fotos.</p>;

  const current = openIndex === null ? null : pictures[openIndex];

  return (
    <>
      <ul className="mt-2 flex flex-wrap gap-3">
        {pictures.map((p, index) => (
          <li key={p.pictureId}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ver la foto ${index + 1} de ${pictures.length}`}
              className="block overflow-hidden rounded-lg border border-gray-200 hover:ring-2 hover:ring-brand-green focus-visible:ring-2 focus-visible:ring-brand-green"
            >
              <Thumb picture={p} className="h-24 w-24" />
            </button>
          </li>
        ))}
      </ul>

      {current && openIndex !== null && (
        <Modal
          size="lg"
          title={`Foto ${openIndex + 1} de ${pictures.length}`}
          onClose={() => setOpenIndex(null)}
          footer={
            <>
              <Button variant="secondary" disabled={openIndex === 0} onClick={() => setOpenIndex(openIndex - 1)}>
                Anterior
              </Button>
              <Button variant="secondary" disabled={openIndex === pictures.length - 1} onClick={() => setOpenIndex(openIndex + 1)}>
                Siguiente
              </Button>
              <Button onClick={() => setOpenIndex(null)}>Cerrar</Button>
            </>
          }
        >
          {isUploadedImage(current.url) ? (
            <img src={current.url} alt={`Foto ${openIndex + 1} de la incidencia`} className="mx-auto max-h-[60vh] rounded-lg object-contain" />
          ) : (
            <Thumb picture={current} className="mx-auto h-48 w-full rounded-lg" />
          )}
        </Modal>
      )}
    </>
  );
}
