import { Bodies, Body } from 'matter-js';

export const createGround = (canvasWidth: number, canvasHeight: number) => {
  // Create segmented ground with gaps
  const groundY = canvasHeight - 20; // Moved closer to bottom for better visual
  const groundHeight = 40; // Reduced height for cleaner look
  const grounds = [];
  
  // Left ground segment (under catapult area) - extended for better catapult support
  const leftGroundWidth = canvasWidth * 0.4; // Increased from 35% to 40%
  const leftGround = Bodies.rectangle(leftGroundWidth / 2, groundY, leftGroundWidth, groundHeight, {
    isStatic: true,
    label: 'ground',
    render: {
      fillStyle: 'transparent',
      strokeStyle: 'transparent',
      lineWidth: 0,
    },
  });
  grounds.push(leftGround);
  
  // Right ground segment (under building area) 
  const rightGroundStart = canvasWidth * 0.55; // Moved back to 55% for better gap
  const rightGroundWidth = canvasWidth * 0.45; // Adjusted to 45%
  const rightGround = Bodies.rectangle(
    rightGroundStart + rightGroundWidth / 2, 
    groundY, 
    rightGroundWidth, 
    groundHeight, 
    {
      isStatic: true,
      label: 'ground',
      render: {
        fillStyle: 'transparent',
        strokeStyle: 'transparent',
        lineWidth: 0,
      },
    }
  );
  grounds.push(rightGround);
  
  return grounds;
};

export const createCatapult = (canvasWidth: number, canvasHeight: number) => {
  // Position catapult properly on the ground level
  const x = canvasWidth * 0.15; // Back to 15% for better positioning
  const y = canvasHeight - 100; // Positioned to sit properly on ground
  
  return Bodies.rectangle(x, y, 120, 120, { // Slightly smaller for better proportions
    isStatic: true,
    label: 'catapult',
    render: {
      fillStyle: '#8B4513', // Fallback brown color if sprite fails
      sprite: {
        texture: '/lovable-uploads/cdb2d2c0-0e95-4dcd-8c9f-832245349c16.png',
        xScale: 0.6,  // Adjusted for better fit
        yScale: 0.6,  // Adjusted for better fit
      }
    },
  });
};

export const createBomb = (x: number, y: number) => {
  return Bodies.circle(x, y, 30, { // Doubled radius from 15 to 30
    label: 'bomb',
    restitution: 0.3,
    friction: 0.4,
    density: 1.5,
    render: {
      fillStyle: '#FF0000', // Fallback red color if sprite fails
      sprite: {
        texture: '/lovable-uploads/ee772c58-4b67-4dfa-8718-a30d36b28466.png',
        xScale: 0.16, // Doubled from 0.08 to 0.16
        yScale: 0.16, // Doubled from 0.08 to 0.16
      }
    },
  });
};

export const createLargeTower = (x: number, groundY: number) => {
  const blocks = [];
  const blockWidth = 30;
  const blockHeight = 20;
  
  // Create a much larger tower - 12 blocks wide by 20 blocks high
  const width = 12;
  const height = 20;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - width / 2) * blockWidth;
      // Properly position blocks to sit on the ground
      const blockY = groundY - 40 - row * blockHeight - blockHeight / 2; // Adjusted to sit on ground

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

      // Add hit tracking to each block - increased from 2 to 4 hits
      (block as any).hitCount = 0;
      (block as any).maxHits = 4;

      blocks.push(block);
    }
  }

  return blocks;
};

// Legacy function for backwards compatibility - now creates the large tower
export const createBuilding = (x: number, groundY: number, width?: number, height?: number) => {
  return createLargeTower(x, groundY);
};

const getChineseFlagBlockColor = (row: number, col: number, width: number, height: number): string => {
  // Chinese flag has red background with yellow stars
  // We'll create a simplified pattern with red background and yellow accents for stars
  
  // Most blocks are red (Chinese flag background)
  const redColor = '#DE2910'; // Official Chinese flag red
  const yellowColor = '#FFDE00'; // Official Chinese flag yellow
  
  // Create a pattern that resembles the Chinese flag layout
  // Large star position (upper left area)
  const isLargeStarArea = row < height * 0.3 && col < width * 0.3;
  
  // Small stars positions (arranged around the large star)
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
  
  // Default red background
  return redColor;
};
