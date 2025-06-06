
export interface ScaleConfig {
  baseWidth: number;
  baseHeight: number;
  currentWidth: number;
  currentHeight: number;
  scale: number;
}

export const calculateScale = (containerWidth: number, containerHeight: number): ScaleConfig => {
  const baseWidth = 1200;
  const baseHeight = 600;
  
  // Calculate scale factor based on container size while maintaining aspect ratio
  const scaleX = containerWidth / baseWidth;
  const scaleY = containerHeight / baseHeight;
  
  // Use the smaller scale to ensure everything fits
  const scale = Math.min(scaleX, scaleY, 1); // Cap at 1 to prevent upscaling
  
  return {
    baseWidth,
    baseHeight,
    currentWidth: containerWidth,
    currentHeight: containerHeight,
    scale,
  };
};

export const scaleValue = (value: number, scale: number): number => {
  return value * scale;
};

export const scalePosition = (x: number, y: number, scale: number): { x: number; y: number } => {
  return {
    x: x * scale,
    y: y * scale,
  };
};
