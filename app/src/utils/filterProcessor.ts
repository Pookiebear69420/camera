import type { FilterAdjustments } from '@/types';

export function generateCSSFilter(adjustments: FilterAdjustments): string {
  const filters: string[] = [];
  
  if (adjustments.brightness !== 100) {
    filters.push(`brightness(${adjustments.brightness}%)`);
  }
  if (adjustments.contrast !== 100) {
    filters.push(`contrast(${adjustments.contrast}%)`);
  }
  if (adjustments.saturation !== 100) {
    filters.push(`saturate(${adjustments.saturation}%)`);
  }
  if (adjustments.hue !== 0) {
    filters.push(`hue-rotate(${adjustments.hue}deg)`);
  }
  if (adjustments.sepia !== 0) {
    filters.push(`sepia(${adjustments.sepia}%)`);
  }
  if (adjustments.grayscale !== 0) {
    filters.push(`grayscale(${adjustments.grayscale}%)`);
  }
  if (adjustments.invert !== 0) {
    filters.push(`invert(${adjustments.invert}%)`);
  }
  if (adjustments.blur !== 0) {
    filters.push(`blur(${adjustments.blur}px)`);
  }
  
  return filters.join(' ') || 'none';
}

export function applyFilterToCanvas(
  canvas: HTMLCanvasElement,
  imageData: ImageData,
  adjustments: FilterAdjustments
): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) return imageData;

  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;

  // Apply brightness and contrast
  const brightness = adjustments.brightness / 100;
  const contrast = adjustments.contrast / 100;
  const contrastFactor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  // Apply saturation
  const saturation = adjustments.saturation / 100;

  // Apply color channel adjustments
  const redMult = adjustments.red / 100;
  const greenMult = adjustments.green / 100;
  const blueMult = adjustments.blue / 100;
  const cyanMult = adjustments.cyan / 100;
  const magentaMult = adjustments.magenta / 100;
  const yellowMult = adjustments.yellow / 100;

  // Apply warmth
  const warmth = adjustments.warmth / 100;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    r *= brightness;
    g *= brightness;
    b *= brightness;

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Saturation
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    r = gray + (r - gray) * saturation;
    g = gray + (g - gray) * saturation;
    b = gray + (b - gray) * saturation;

    // Color channel adjustments
    r *= redMult;
    g *= greenMult;
    b *= blueMult;

    // CMY adjustments (approximate)
    const c = 255 - r;
    const m = 255 - g;
    const y = 255 - b;
    
    r = 255 - (c * cyanMult);
    g = 255 - (m * magentaMult);
    b = 255 - (y * yellowMult);

    // Warmth (add orange/yellow)
    r += warmth * 30;
    g += warmth * 15;

    // Sepia
    if (adjustments.sepia > 0) {
      const sepiaAmount = adjustments.sepia / 100;
      const sr = (r * 0.393) + (g * 0.769) + (b * 0.189);
      const sg = (r * 0.349) + (g * 0.686) + (b * 0.168);
      const sb = (r * 0.272) + (g * 0.534) + (b * 0.131);
      r = r * (1 - sepiaAmount) + sr * sepiaAmount;
      g = g * (1 - sepiaAmount) + sg * sepiaAmount;
      b = b * (1 - sepiaAmount) + sb * sepiaAmount;
    }

    // Grayscale
    if (adjustments.grayscale > 0) {
      const grayAmount = adjustments.grayscale / 100;
      const grayVal = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = r * (1 - grayAmount) + grayVal * grayAmount;
      g = g * (1 - grayAmount) + grayVal * grayAmount;
      b = b * (1 - grayAmount) + grayVal * grayAmount;
    }

    // Invert
    if (adjustments.invert > 0) {
      const invAmount = adjustments.invert / 100;
      r = r * (1 - invAmount) + (255 - r) * invAmount;
      g = g * (1 - invAmount) + (255 - g) * invAmount;
      b = b * (1 - invAmount) + (255 - b) * invAmount;
    }

    // Hue rotation
    if (adjustments.hue !== 0) {
      const hueRad = (adjustments.hue * Math.PI) / 180;
      const cosA = Math.cos(hueRad);
      const sinA = Math.sin(hueRad);
      
      const hr = (0.299 + 0.701 * cosA + 0.168 * sinA) * r +
                 (0.587 - 0.587 * cosA + 0.330 * sinA) * g +
                 (0.114 - 0.114 * cosA - 0.497 * sinA) * b;
      const hg = (0.299 - 0.299 * cosA - 0.328 * sinA) * r +
                 (0.587 + 0.413 * cosA + 0.035 * sinA) * g +
                 (0.114 - 0.114 * cosA + 0.292 * sinA) * b;
      const hb = (0.299 - 0.300 * cosA + 1.250 * sinA) * r +
                 (0.587 - 0.588 * cosA - 1.050 * sinA) * g +
                 (0.114 + 0.886 * cosA - 0.200 * sinA) * b;
      
      r = hr;
      g = hg;
      b = hb;
    }

    // Clamp values
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  // Apply grain
  if (adjustments.grain > 0) {
    const grainAmount = adjustments.grain * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * grainAmount;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
  }

  // Apply vignette
  if (adjustments.vignette > 0) {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
    const vignetteStrength = adjustments.vignette / 100;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const vignette = 1 - (dist / maxDist) * vignetteStrength;
        
        const idx = (y * width + x) * 4;
        data[idx] *= vignette;
        data[idx + 1] *= vignette;
        data[idx + 2] *= vignette;
      }
    }
  }

  return new ImageData(data, width, height);
}

export function createFilteredImage(
  sourceCanvas: HTMLCanvasElement,
  adjustments: FilterAdjustments
): string {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) return '';

  const imageData = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const processedData = applyFilterToCanvas(sourceCanvas, imageData, adjustments);
  
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;
  const outputCtx = outputCanvas.getContext('2d');
  
  if (!outputCtx) return '';
  
  outputCtx.putImageData(processedData, 0, 0);
  return outputCanvas.toDataURL('image/jpeg', 0.95);
}
