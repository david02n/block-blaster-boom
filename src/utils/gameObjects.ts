import { Bodies, Body, Engine } from 'matter-js';
import { scaleValue, scalePosition } from './scalingUtils';

export const createGround = (canvasWidth: number, canvasHeight: number, scale: number, groundTopY: number) => {
  // Create continuous ground without gaps - positioned at groundTopY
  const groundHeight = scaleValue(40, scale); // Increased thickness for stability
  const groundCenterY = groundTopY + (groundHeight / 2);
  const grounds = [];
  
  // Create multiple overlapping ground segments to ensure NO GAPS
  const segmentWidth = canvasWidth * 0.3; // Wider segments with overlap
  const segments = Math.ceil(canvasWidth / (segmentWidth * 0.8)) + 2; // Extra segments with overlap
  
  for (let i = 0; i < segments; i++) {
    const segmentX = (i * segmentWidth * 0.8) - (segmentWidth * 0.1); // Overlap segments
    const ground = Bodies.rectangle(segmentX, groundCenterY, segmentWidth, groundHeight, {
      isStatic: true,
      label: 'ground',
      render: {
        fillStyle: '#8B4513',
        strokeStyle: '#654321',
        lineWidth: 1,
      },
    });
    grounds.push(ground);
  }
  
  // Add extra ground segments specifically under the tower area
  const towerX = canvasWidth * 0.8;
  const towerGroundWidth = canvasWidth * 0.4; // Wide coverage under tower
  const towerGround = Bodies.rectangle(towerX, groundCenterY, towerGroundWidth, groundHeight, {
    isStatic: true,
    label: 'ground',
    render: {
      fillStyle: '#8B4513',
      strokeStyle: '#654321',
      lineWidth: 1,
    },
  });
  grounds.push(towerGround);
  
  console.log('Created overlapping ground segments:', {
    segments: segments + 1,
    groundCenterY: groundCenterY,
    topY: groundTopY,
    canvasWidth,
    towerX,
    towerGroundWidth
  });
  
  return grounds;
};

export const createCatapult = (canvasWidth: number, canvasHeight: number, scale: number, groundTopY: number) => {
  // Scaled position for catapult
  const x = scaleValue(240, scale);
  const catapultHeight = scaleValue(120, scale);
  const y = groundTopY - (catapultHeight / 2);
  
  return Bodies.rectangle(x, y, scaleValue(120, scale), catapultHeight, {
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

export const createLargeTower = (x: number, groundTopY: number, scale: number, engine?: Engine) => {
  const blocks = [];
  const blockWidth = scaleValue(30, scale);
  const blockHeight = scaleValue(20, scale);
  
  // Create a tower - 12 blocks wide by 20 blocks high
  const width = 12;
  const height = 20;

  console.log('Building tower with ground coverage:', {
    groundTopY,
    blockWidth,
    blockHeight,
    scale,
    towerCenterX: x,
    towerBottomY: groundTopY - (blockHeight / 2)
  });

  // Disable gravity completely during construction
  const originalGravity = engine?.world.gravity.y;
  if (engine) {
    engine.world.gravity.y = 0;
    console.log('Gravity disabled for tower construction');
  }

  // Build from bottom row (row 0) to top row (row height-1)
  for (let row = 0; row < height; row++) {
    console.log(`Building row ${row} of ${height}`);
    
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - (width - 1) / 2) * blockWidth;
      
      // Position blocks EXACTLY on the ground surface
      // Bottom row sits directly on groundTopY
      const blockY = groundTopY - (blockHeight / 2) - (row * blockHeight);

      console.log(`Block row ${row}, col ${col}: X=${blockX}, Y=${blockY}, bottomEdge=${blockY + blockHeight/2}, groundTopY=${groundTopY}`);

      const block = Bodies.rectangle(blockX, blockY, blockWidth, blockHeight, {
        label: 'block',
        restitution: 0.1,
        friction: 0.9,
        density: 0.3,
        render: {
          fillStyle: getChineseFlagBlockColor(row, col, width, height),
          strokeStyle: '#333',
          lineWidth: 1,
        },
        // Start as static to prevent any movement during construction
        isStatic: true,
      });

      // Add hit tracking to each block
      (block as any).hitCount = 0;
      (block as any).maxHits = 8;

      blocks.push(block);
    }
  }

  // Add all blocks to world while static
  if (engine) {
    console.log(`Adding ${blocks.length} static blocks to world`);
  }

  // Restore physics after construction with increased wait time
  if (engine && originalGravity !== undefined) {
    setTimeout(() => {
      console.log('Restoring gravity and making blocks dynamic');
      engine.world.gravity.y = originalGravity;
      
      // Make blocks dynamic row by row from bottom to top with longer delays
      for (let row = 0; row < height; row++) {
        setTimeout(() => {
          const rowBlocks = blocks.filter((_, index) => Math.floor(index / width) === row);
          rowBlocks.forEach(block => {
            Body.setStatic(block, false);
          });
          console.log(`Row ${row} blocks made dynamic`);
        }, row * 100); // Increased delay between rows
      }
    }, 1000); // Increased initial wait time
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
