import { useEffect, useState } from "react";
import { listIncidences, type IncidenceWithPictures } from "~/api/incidences";

/** Incidencias de una comunidad, pedidas al back. Devuelve también si está cargando y el error, si lo hay. */
export function useIncidences(communityId: number | undefined) {
  const [state, setState] = useState({ incidences: [] as IncidenceWithPictures[], loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (communityId === undefined) return;
    let cancelled = false; // evita pintar la respuesta de una comunidad que ya no se está viendo
    setState((prev) => ({ ...prev, loading: true, error: "" }));
    listIncidences(communityId)
      .then((incidences) => !cancelled && setState({ incidences, loading: false, error: "" }))
      .catch((e: unknown) =>
        !cancelled && setState({ incidences: [], loading: false, error: e instanceof Error ? e.message : "No se pudieron cargar las incidencias." }),
      );
    return () => {
      cancelled = true;
    };
  }, [communityId, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
