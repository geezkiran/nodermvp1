import type { OrbitMap } from "../types/editor";

const STORAGE_KEY = "noder.orbit-map.v1";

type StoredPayload = {
  version: 1;
  map: OrbitMap;
};

export function loadMap(): OrbitMap | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredPayload;
    if (parsed?.version !== 1 || !parsed.map) {
      return null;
    }

    return parsed.map;
  } catch {
    return null;
  }
}

export function saveMap(map: OrbitMap): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredPayload = {
    version: 1,
    map,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
