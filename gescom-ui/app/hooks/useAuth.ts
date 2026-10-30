import { useState } from "react";
import { fetchIdentity, loginRequest } from "~/api/auth";
import { flushPendingAvatar } from "~/api/users";
import { ApiError, clearToken, getToken } from "~/api/client";
import type { CommunityRole } from "~/types";
import * as store from "~/data/store";
import type { Session } from "~/data/store";
import { communitiesOfUser, roleOf } from "~/utils/roles";
import { useData } from "./useData";

type LoginResult = { ok: true; needsCommunity: boolean } | { ok: false; error: string };

/** Sesión actual: quién es el usuario, en qué comunidad trabaja y qué cargo tiene en ella. */
export function useAuth() {
  const { data, reload: reloadData } = useData();
  const [session, setSession] = useState<Session>(store.loadSession);

  // Sin token no hay sesión, aunque quedara un usuario guardado
  const user = getToken() ? (data.users.find((u) => u.userId === session.userId) ?? null) : null;
  const communityIds = user ? communitiesOfUser(data, user) : [];
  // La comunidad elegida solo vale si el usuario sigue perteneciendo a ella
  const community =
    user && session.communityId !== null && communityIds.includes(session.communityId)
      ? (data.communities.find((c) => c.communityId === session.communityId) ?? null)
      : null;
  const role: CommunityRole = user ? (community ? roleOf(data, user, community.communityId) : user.type === 1 ? "superadmin" : "none") : "none";

  const changeSession = (next: Session) => {
    store.saveSession(next);
    setSession(next);
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      await loginRequest(email.trim(), password);
      // Si se registró con foto, ahora que hay token se sube (antes de leer la identidad, para traer ya la URL)
      const mine = await fetchIdentity();
      const uploaded = await flushPendingAvatar(mine.user.email, mine.user.userId);
      const identity = uploaded ? await fetchIdentity() : mine;
      const u = identity.user;
      if (u.isDisabled || !u.isActive) throw new ApiError(403, "Tu cuenta está desactivada. Contacta con tu administrador.");
      if (!u.isValidated) throw new ApiError(403, "Debes verificar tu correo antes de iniciar sesión.");
      if (u.type !== 1 && identity.communities.length === 0) throw new ApiError(403, "No perteneces a ninguna comunidad activa.");

      store.saveData(store.applyIdentity(store.loadData(), identity));
      // Con una sola comunidad se entra directamente; si hay varias (o es superadmin) se elige
      const single = u.type !== 1 && identity.communities.length === 1;
      changeSession({ userId: u.userId, communityId: single ? identity.communities[0].communityId : null });
      reloadData();
      return { ok: true, needsCommunity: !single };
    } catch (e) {
      clearToken();
      return { ok: false, error: e instanceof ApiError ? e.message : "No se pudo iniciar sesión." };
    }
  };

  const logout = () => {
    clearToken();
    changeSession({ userId: null, communityId: null });
  };

  return {
    user,
    community,
    role,
    /** Comunidades entre las que puede elegir el usuario */
    communityIds,
    login,
    logout,
    selectCommunity: (communityId: number | null) => changeSession({ ...session, communityId }),
    /** Vuelve a leer sesión y datos (lo usa el menú lateral al cambiar de pantalla) */
    reload: () => {
      reloadData();
      setSession(store.loadSession());
    },
  };
}
