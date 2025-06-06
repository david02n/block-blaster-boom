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
          fillStyle: getBlockColor(row, col),
          strokeStyle: '#333',
          lineWidth: 1,
        },
      });

      blocks.push(block);
    }
  }

  return blocks;
};

const getBlockColor = (row: number, col: number): string => {
  const colors = [
    '#FFFFFF', // White for main building structure
    '#E8E8E8', // Light gray
    '#D0D0D0', // Medium gray
    '#B8B8B8', // Darker gray
    '#4A90E2', // Blue for windows/details
    '#2E5BBA', // Darker blue
    '#87CEEB', // Sky blue
    '#F0F8FF', // Alice blue
  ];
  
  return colors[(row + col) % colors.length];
};
