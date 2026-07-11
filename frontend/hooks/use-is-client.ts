"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Retourne `false` pendant le rendu serveur / la première passe d'hydratation,
 * puis `true` une fois côté client — sans déclencher de re-render via setState
 * dans un effect (évite le warning "cascading renders").
 */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,      // pas de source externe à écouter, ça ne change jamais après coup
    () => true,      // snapshot côté client
    () => false,     // snapshot côté serveur
  );
}