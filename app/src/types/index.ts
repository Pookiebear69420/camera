export interface Filter {
  id: string;
  name: string;
  preview: string;
  cssFilter: string;
  isFavorite: boolean;
  isCustom: boolean;
  adjustments?: FilterAdjustments;
}

export interface FilterAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  sepia: number;
  grayscale: number;
  invert: number;
  blur: number;
  warmth: number;
  tint: number;
  vignette: number;
  grain: number;
  red: number;
  green: number;
  blue: number;
  cyan: number;
  magenta: number;
  yellow: number;
  orange?: number;
}

export interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  filterId: string;
  filterName: string;
  adjustments: FilterAdjustments;
}

export interface CameraSettings {
  iso: number;
  shutterSpeed: number;
  aperture: number;
  flashEnabled: boolean;
}

export const DEFAULT_ADJUSTMENTS: FilterAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
  blur: 0,
  warmth: 0,
  tint: 0,
  vignette: 0,
  grain: 0,
  red: 100,
  green: 100,
  blue: 100,
  cyan: 100,
  magenta: 100,
  yellow: 100,
};
