
import { Bodies, Body, Engine } from 'matter-js';
import { scaleValue, scalePosition } from './scalingUtils';

export const createGround = (canvasWidth: number, canvasHeight: number, scale: number, groundTopY: number) => {
  // Create segmented ground with gaps - positioned at groundTopY
  const groundHeight = scaleValue(20, scale);
  const groundCenterY = groundTopY + (groundHeight / 2);
  const grounds = [];
  
  // Left ground segment (under catapult area) - scaled positioning
  const leftGroundWidth = scaleValue(540, scale);
  const leftGround = Bodies.rectangle(leftGroundWidth / 2, groundCenterY, leftGroundWidth, groundHeight, {
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
    groundCenterY, 
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

  console.log('Creating tower with blocks properly positioned on ground:', {
    groundTopY,
    blockHeight,
    scale,
    bottomRowCenterY: groundTopY - (blockHeight / 2),
    bottomRowBottomEdge: groundTopY
  });

  // Temporarily reduce gravity during tower creation if engine is provided
  const originalGravity = engine?.world.gravity.y;
  if (engine) {
    engine.world.gravity.y = 0.1; // Reduced gravity during construction
  }

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - width / 2) * blockWidth;
      // Position blocks so their bottom edges sit on the ground
      // Bottom row centers should be at groundTopY - (blockHeight / 2)
      // Each subsequent row is one blockHeight higher
      const blockY = groundTopY - (blockHeight / 2) - (row * blockHeight);

      console.log(`Block at row ${row}, col ${col}: Y = ${blockY}, bottom edge = ${blockY + blockHeight/2}`);

      const block = Bodies.rectangle(blockX, blockY, blockWidth, blockHeight, {
        label: 'block',
        restitution: 0.1, // Reduced bounce to prevent instability
        friction: 0.8, // Increased friction for stability
        density: 0.4, // Reduced density to prevent compression
        render: {
          fillStyle: getChineseFlagBlockColor(row, col, width, height),
          strokeStyle: '#333',
          lineWidth: 1,
        },
        // Make blocks sleep initially to prevent immediate settling
        isSleeping: true,
      });

      // Add hit tracking to each block
      (block as any).hitCount = 0;
      (block as any).maxHits = 8;

      blocks.push(block);
    }
  }

  // Restore original gravity after a short delay to allow positioning
  if (engine && originalGravity !== undefined) {
    setTimeout(() => {
      engine.world.gravity.y = originalGravity;
      // Wake up blocks gradually to prevent sudden collapse
      blocks.forEach((block, index) => {
        setTimeout(() => {
          Body.setStatic(block, false);
          block.isSleeping = false;
        }, index * 2); // Stagger awakening by 2ms per block
      });
    }, 100); // Wait 100ms before restoring gravity
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
