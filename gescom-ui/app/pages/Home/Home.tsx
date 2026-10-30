import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";

/** Raíz del sitio: según haya sesión o no, lleva al panel, al selector de comunidades o al login. */
export default function Home() {
  const { user, community } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(!user ? "/login" : community ? "/dashboard" : "/communities", { replace: true });
  }, [user, community, navigate]);

  return null;
}
