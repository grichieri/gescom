import { useEffect, useState } from "react";

/** Como useState, pero el valor se guarda en localStorage y se recupera al abrir la pantalla. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial; // JSON dañado o localStorage no disponible
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sin espacio o bloqueado: la aplicación sigue funcionando sin guardar
    }
  }, [key, value]);

  return [value, setValue] as const;
}
