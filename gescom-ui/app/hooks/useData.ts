import { useState } from "react";
import type { Community, Incidence, RoleKind, User } from "~/types";
import type { DataState } from "~/data/seed";
import * as store from "~/data/store";
import type { Change, NewCommunityInput, NewIncidenceInput, NewPropertyInput, NewUserInput } from "~/data/store";

export const DATA_CHANGED = "gescom-data-changed";

/**
 * Datos de la aplicación para una pantalla.
 * Se leen de localStorage al abrir la pantalla (valor inicial de useState) y, cada vez que se
 * cambia algo, se guarda y se actualiza el estado para que la pantalla se vuelva a pintar.
 */
export function useData() {
  const [data, setData] = useState<DataState>(store.loadData);

  // Aplica un cambio sobre lo último guardado (por si otra pantalla lo modificó) y repinta
  const apply = <R>(change: Change<R>): R => {
    const [next, result] = change(store.loadData());
    store.saveData(next);
    setData(next);
    // Avisa al resto de la pantalla (p. ej. el menú lateral) de que hay datos nuevos
    window.dispatchEvent(new Event(DATA_CHANGED));
    return result;
  };

  return {
    data,
    /** Vuelve a leer localStorage (por ejemplo, el menú lateral al cambiar de pantalla) */
    reload: () => setData(store.loadData()),

    addIncidence: (input: NewIncidenceInput, pictures: string[]) => apply(store.createIncidence(input, pictures)),
    updateIncidence: (id: number, changes: Partial<Pick<Incidence, "status" | "priority" | "maxResolutionDate">>) =>
      apply(store.updateIncidence(id, changes)),
    addComment: (incidenceId: number, userId: number, text: string) => apply(store.addComment(incidenceId, userId, text)),

    registerUser: (input: NewUserInput, communityId: number) => apply(store.registerUser(input, communityId)),
    createUser: (input: NewUserInput, communityId: number, role: RoleKind | null, startDate: string, endDate: string | null, userIdFromBack?: number) =>
      apply(store.createUser(input, communityId, role, startDate, endDate, userIdFromBack)),
    updateUser: (userId: number, changes: Partial<User>) => apply(store.updateUser(userId, changes)),
    assignRole: (userId: number, communityId: number, role: RoleKind | null, startDate: string, endDate: string | null) =>
      apply(store.assignRole(userId, communityId, role, startDate, endDate)),

    addCommunity: (input: NewCommunityInput, properties: NewPropertyInput[]) => apply(store.addCommunity(input, properties)),
    updateCommunity: (communityId: number, changes: Partial<Community>) => apply(store.updateCommunity(communityId, changes)),
    addProperty: (communityId: number, input: NewPropertyInput) => apply(store.addProperty(communityId, input)),

    resetData: () => {
      store.resetData();
      setData(store.loadData());
    },
  };
}
