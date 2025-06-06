import { Bodies, Body } from 'matter-js';

export const createGround = (canvasWidth: number, canvasHeight: number) => {
  // Create segmented ground with gaps - positioned at the very bottom
  const groundY = canvasHeight - 10;
  const groundHeight = 20;
  const grounds = [];
  
  // Left ground segment (under catapult area) - fixed positioning
  const leftGroundWidth = 540; // Fixed width instead of percentage
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
  
  // Right ground segment (under building area) - fixed positioning
  const rightGroundStart = 720; // Fixed position instead of percentage
  const rightGroundWidth = 480; // Fixed width instead of percentage
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

export const createCatapult = (canvasWidth: number, canvasHeight: number) => {
  // Fixed position for catapult
  const x = 240; // Fixed position instead of percentage
  const groundLevel = canvasHeight - 10;
  const catapultHeight = 120; // Increased height to position catapult higher
  const y = groundLevel - catapultHeight; // This will position the catapult higher above ground
  
  return Bodies.rectangle(x, y, 120, 120, {
    isStatic: true,
    label: 'catapult',
    render: {
      fillStyle: '#8B4513',
      sprite: {
        texture: '/lovable-uploads/cdb2d2c0-0e95-4dcd-8c9f-832245349c16.png',
        xScale: 0.6,
        yScale: 0.6,
      }
    },
  });
};

export const createBomb = (x: number, y: number) => {
  return Bodies.circle(x, y, 30, {
    label: 'bomb',
    restitution: 0.3,
    friction: 0.4,
    density: 1.5,
    render: {
      fillStyle: '#FF0000',
      sprite: {
        texture: '/lovable-uploads/ee772c58-4b67-4dfa-8718-a30d36b28466.png',
        xScale: 0.16,
        yScale: 0.16,
      }
    },
  });
};

export const createLargeTower = (x: number, groundY: number) => {
  const blocks = [];
  const blockWidth = 30;
  const blockHeight = 20;
  
  // Create a tower - 12 blocks wide by 20 blocks high
  const width = 12;
  const height = 20;

  // Calculate the actual ground surface level
  const actualGroundLevel = groundY + 10;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - width / 2) * blockWidth;
      const blockY = actualGroundLevel - (row * blockHeight) - (blockHeight / 2);

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

      // Add hit tracking to each block
      (block as any).hitCount = 0;
      (block as any).maxHits = 4;

      blocks.push(block);
    }
  }

  return blocks;
};

// Legacy function for backwards compatibility
export const createBuilding = (x: number, groundY: number, width?: number, height?: number) => {
  return createLargeTower(x, groundY);
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
