
import { Bodies } from 'matter-js';

export const createGround = (canvasWidth: number, canvasHeight: number) => {
  // Position ground at the bottom where the green grass is visible
  const groundY = canvasHeight - 40; // Near the bottom of the screen
  return Bodies.rectangle(canvasWidth / 2, groundY, canvasWidth, 80, {
    isStatic: true,
    label: 'ground',
    render: {
      fillStyle: 'transparent', // Make ground invisible
      strokeStyle: 'transparent', // Make border invisible
      lineWidth: 0,
    },
  });
};

export const createCatapult = (canvasWidth: number, canvasHeight: number) => {
  // Position catapult at far left, sitting on the ground
  const x = canvasWidth * 0.15; // 15% from left edge
  const y = canvasHeight - 120; // Just above the ground level
  
  return Bodies.rectangle(x, y, 100, 100, {
    isStatic: true,
    label: 'catapult',
    render: {
      fillStyle: '#8B4513', // Fallback brown color if sprite fails
      sprite: {
        texture: '/lovable-uploads/cdb2d2c0-0e95-4dcd-8c9f-832245349c16.png',
        xScale: 0.5,  // Doubled from 0.25 to 0.5
        yScale: 0.5,  // Doubled from 0.25 to 0.5
      }
    },
  });
};

export const createBomb = (x: number, y: number) => {
  return Bodies.circle(x, y, 15, {
    label: 'bomb',
    restitution: 0.3,
    friction: 0.4,
    density: 1.5,
    render: {
      fillStyle: '#FF0000', // Fallback red color if sprite fails
      sprite: {
        texture: '/lovable-uploads/ee772c58-4b67-4dfa-8718-a30d36b28466.png',
        xScale: 0.08,
        yScale: 0.08,
      }
    },
  });
};

export const createBuilding = (x: number, groundY: number, width: number, height: number) => {
  const blocks = [];
  const blockWidth = 30;
  const blockHeight = 20;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const blockX = x + (col - width / 2) * blockWidth;
      const blockY = groundY - row * blockHeight - blockHeight / 2;

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

      blocks.push(block);
    }
  }

  return blocks;
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
