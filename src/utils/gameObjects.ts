import { Bodies } from 'matter-js';

export const createGround = () => {
  return Bodies.rectangle(500, 580, 1000, 40, {
    isStatic: true,
    label: 'ground',
    render: {
      fillStyle: '#8B4513',
    },
  });
};

export const createCatapult = () => {
  return Bodies.rectangle(100, 520, 80, 80, {
    isStatic: true,
    label: 'catapult',
    render: {
      fillStyle: '#654321',
    },
  });
};

export const createBomb = (x: number, y: number) => {
  return Bodies.circle(x, y, 20, {
    label: 'bomb',
    restitution: 0.3,
    friction: 0.4,
    density: 1.5, // Increased density for more impact
    render: {
      sprite: {
        texture: '/lovable-uploads/ee772c58-4b67-4dfa-8718-a30d36b28466.png',
        xScale: 0.08, // Scale down the image to fit the circle
        yScale: 0.08,
      }
    },
  });
};

export const createBuilding = (x: number, groundY: number, width: number, height: number) => {
  const blocks = [];
  const blockWidth = 25;
  const blockHeight = 15;

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
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#F39C12', // Orange
    '#E74C3C', // Dark Red
  ];
  
  return colors[(row + col) % colors.length];
};
