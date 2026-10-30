import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./useAuth";

/**
 * Para las pantallas que trabajan sobre la comunidad elegida:
 * si no hay ninguna seleccionada, lleva al selector de comunidades.
 */
export function useRequireCommunity() {
  const { community } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!community) navigate("/communities", { replace: true });
  }, [community, navigate]);

  return community;
}
