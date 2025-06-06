
import { Bodies, Body } from 'matter-js';
import { scaleValue, scalePosition } from './scalingUtils';

export const createGround = (canvasWidth: number, canvasHeight: number, scale: number) => {
  // Create segmented ground with gaps - positioned at the very bottom
  const groundY = canvasHeight - scaleValue(10, scale);
  const groundHeight = scaleValue(20, scale);
  const grounds = [];
  
  // Left ground segment (under catapult area) - scaled positioning
  const leftGroundWidth = scaleValue(540, scale);
  const leftGround = Bodies.rectangle(leftGroundWidth / 2, groundY, leftGroundWidth, groundHeight, {
    isStatic: true,
    label: 'ground',
    render: {
      fillStyle: '#8B4513',
      strokeStyle: '#654321',
      lineWidth: 1,
    },
  });
  grounds.push(leftGround);
  
  // Right ground segment (under building area) - scaled positioning
  const rightGroundStart = scaleValue(720, scale);
  const rightGroundWidth = scaleValue(480, scale);
  const rightGround = Bodies.rectangle(
    rightGroundStart + rightGroundWidth / 2, 
    groundY, 
    rightGroundWidth, 
    groundHeight, 
    {
      isStatic: true,
      label: 'ground',
      render: {
        fillStyle: '#8B4513',
        strokeStyle: '#654321',
        lineWidth: 1,
      },
    }
  );
  grounds.push(rightGround);
  
  return grounds;
};

export const createCatapult = (canvasWidth: number, canvasHeight: number, scale: number) => {
  // Scaled position for catapult
  const x = scaleValue(240, scale);
  const groundLevel = canvasHeight - scaleValue(10, scale);
  const catapultHeight = scaleValue(180, scale);
  const y = groundLevel - catapultHeight;
  
  return Bodies.rectangle(x, y, scaleValue(120, scale), scaleValue(120, scale), {
    isStatic: true,
    label: 'catapult',
    render: {
      fillStyle: '#8B4513',
      sprite: {
        texture: '/lovable-uploads/cdb2d2c0-0e95-4dcd-8c9f-832245349c16.png',
        xScale: 0.6 * scale,
        yScale: 0.6 * scale,
      }
    },
  });
};

export const createBomb = (x: number, y: number, scale: number) => {
  return Bodies.circle(x, y, scaleValue(30, scale), {
    label: 'bomb',
    restitution: 0.3,
    friction: 0.4,
    density: 1.5,
    render: {
      fillStyle: '#FF0000',
      sprite: {
        texture: '/lovable-uploads/ee772c58-4b67-4dfa-8718-a30d36b28466.png',
        xScale: 0.16 * scale,
        yScale: 0.16 * scale,
      }
    },
  });
};

export const createLargeTower = (x: number, groundY: number, scale: number) => {
  const blocks = [];
  const blockWidth = scaleValue(30, scale);
  const blockHeight = scaleValue(20, scale);
  
  // Create a tower - 12 blocks wide by 20 blocks high
  const width = 12;
  const height = 20;

  // The groundY is the center of the ground body (50px from bottom)
  // We need to calculate the actual ground surface (top of the ground)
  const groundHeight = scaleValue(20, scale);
  const groundSurface = groundY - (groundHeight / 2);

  console.log('Creating tower with corrected positioning:', {
    groundY,
    groundHeight,
    groundSurface,
    blockHeight,
    scale
  });

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - width / 2) * blockWidth;
      // Position blocks starting from the ground surface, building upwards
      // Each block sits on top of the previous row
      const blockY = groundSurface - (row * blockHeight) - (blockHeight / 2);

      const block = Bodies.rectangle(blockX, blockY, blockWidth, blockHeight, {
        label: 'block',
        restitution: 0.2,
        friction: 0.7,
        density: 0.6,
        render: {
          fillStyle: getChineseFlagBlockColor(row, col, width, height),
          strokeStyle: '#333',
          lineWidth: 1,
        },
      });

      // Add hit tracking to each block - increased from 4 to 8 hits required
      (block as any).hitCount = 0;
      (block as any).maxHits = 8;

      blocks.push(block);
    }
  }

  return blocks;
};

// Legacy function for backwards compatibility
export const createBuilding = (x: number, groundY: number, width?: number, height?: number, scale: number = 1) => {
  return createLargeTower(x, groundY, scale);
};

const getChineseFlagBlockColor = (row: number, col: number, width: number, height: number): string => {
  const redColor = '#DE2910';
  const yellowColor = '#FFDE00';
  
  // Create a pattern that resembles the Chinese flag layout
  const isLargeStarArea = row < height * 0.3 && col < width * 0.3;
  
  // Small stars positions
  const isSmallStar1 = row === Math.floor(height * 0.15) && col === Math.floor(width * 0.4);
  const isSmallStar2 = row === Math.floor(height * 0.25) && col === Math.floor(width * 0.45);
  const isSmallStar3 = row === Math.floor(height * 0.35) && col === Math.floor(width * 0.4);
  const isSmallStar4 = row === Math.floor(height * 0.3) && col === Math.floor(width * 0.35);
  
  // Large star center
  const isLargeStarCenter = row === Math.floor(height * 0.2) && col === Math.floor(width * 0.2);
  
  if (isLargeStarCenter || isSmallStar1 || isSmallStar2 || isSmallStar3 || isSmallStar4) {
    return yellowColor;
  }
  
  // Some yellow blocks near star areas to create star-like patterns
  if (isLargeStarArea && (row + col) % 4 === 0) {
    return yellowColor;
  }
  
  return redColor;
};
