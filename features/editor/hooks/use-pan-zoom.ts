import { useCallback, useState } from "react";

import type { ViewportState, ZoomBand } from "../types/editor";

const HARD_MIN_SCALE = 0.12;
const HARD_MAX_SCALE = 8;
const SOFT_MIN_ZONE = 0.24;
const SOFT_MAX_ZONE = 4.8;
const BAND_HYSTERESIS = 0.08;

function getNextScale(currentScale: number, delta: number) {
  const factor = Math.max(0.05, 1 + delta);
  let next = currentScale * factor;

  if (next < SOFT_MIN_ZONE) {
    next = SOFT_MIN_ZONE - (SOFT_MIN_ZONE - next) * 0.35;
  }

  if (next > SOFT_MAX_ZONE) {
    next = SOFT_MAX_ZONE + (next - SOFT_MAX_ZONE) * 0.35;
  }

  return Math.min(HARD_MAX_SCALE, Math.max(HARD_MIN_SCALE, next));
}

function getNextBand(scale: number, previousBand: ZoomBand): ZoomBand {
  const farCutoff = 0.75;
  const nearCutoff = 1.4;
  const ultraCutoff = 2.4;

  if (previousBand === "far") {
    return scale > farCutoff + BAND_HYSTERESIS ? "base" : "far";
  }

  if (previousBand === "base") {
    if (scale < farCutoff - BAND_HYSTERESIS) {
      return "far";
    }
    if (scale > nearCutoff + BAND_HYSTERESIS) {
      return "near";
    }
    return "base";
  }

  if (previousBand === "near") {
    if (scale < nearCutoff - BAND_HYSTERESIS) {
      return "base";
    }
    if (scale > ultraCutoff + BAND_HYSTERESIS) {
      return "ultra";
    }
    return "near";
  }

  return scale < ultraCutoff - BAND_HYSTERESIS ? "near" : "ultra";
}

export function usePanZoom() {
  const [viewport, setViewport] = useState<ViewportState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [zoomBand, setZoomBand] = useState<ZoomBand>("base");

  const panBy = useCallback((dx: number, dy: number) => {
    setViewport((state) => ({
      ...state,
      offsetX: state.offsetX + dx,
      offsetY: state.offsetY + dy,
    }));
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setViewport((state) => {
      const nextScale = getNextScale(state.scale, delta);
      setZoomBand((band) => getNextBand(nextScale, band));

      return {
        ...state,
        scale: nextScale,
      };
    });
  }, []);

  const resetView = useCallback(() => {
    setViewport({ scale: 1, offsetX: 0, offsetY: 0 });
    setZoomBand("base");
  }, []);

  return {
    viewport,
    zoomBand,
    panBy,
    zoomBy,
    resetView,
  };
}
