import { useEffect, useState } from "react";
import { getIncidence, type IncidenceDetailData } from "~/api/incidences";

/** Una incidencia con sus fotos y comentarios, pedida al back. `setDetail` deja actualizar lo que se ve tras guardar un cambio. */
export function useIncidence(incidenceId: number) {
  const [detail, setDetail] = useState<IncidenceDetailData | undefined>(undefined);
  const [state, setState] = useState({ loading: true, error: "", notFound: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false; // evita pintar la respuesta de otra incidencia si se cambia de página
    setState({ loading: true, error: "", notFound: false });
    getIncidence(incidenceId)
      .then((found) => {
        if (cancelled) return;
        setDetail(found);
        setState({ loading: false, error: "", notFound: false });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setDetail(undefined);
        const status = (e as { status?: number }).status;
        setState({
          loading: false,
          notFound: status === 404,
          error: status === 404 ? "" : e instanceof Error ? e.message : "No se pudo cargar la incidencia.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [incidenceId, attempt]);

  return { detail, setDetail, ...state, retry: () => setAttempt((n) => n + 1) };
}
