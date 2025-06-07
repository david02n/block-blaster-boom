
import { Bodies, Body, Constraint } from 'matter-js';

export const createGround = (canvasWidth: number, canvasHeight: number) => {
  // Create segmented ground with gaps - positioned 25px up from bottom
  const groundY = canvasHeight - 35; //ed up 25px from bottom
  const groundHeight = 10
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
  const catapultHeight = 180; // Increased height again to position catapult even higher
  const y = groundLevel - catapultHeight; // This will position the catapult much higher above ground
  
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

export const createBuilding = (layout: any, x: number, groundY: number) => {
  const blocks: Body[] = [];
  const constraints: Constraint[] = [];
  const blockSize = 25; // 25px blocks
  const buildingCenterX = x;
  const actualGroundLevel = groundY -90; // Base ground level
  const verticalOffset = 25; // Additional offset for building

  // Create blocks from grid, skipping cells covered by objects
  layout.grid.forEach((row, rowIndex) => {
    row.forEach((blockType, colIndex) => {
      // Skip empty spaces
      if (blockType === 0) return;

      // Check if this cell is covered by any object
      const isCovered = layout.objects.some(obj =>
        colIndex >= obj.x && colIndex < obj.x + obj.w &&
        rowIndex >= obj.y && rowIndex < obj.y + obj.h
      );

      // Skip if this cell is covered by an object
      if (isCovered) return;

      // Calculate block position relative to the bottom of the building
      // Add small gap between blocks (2 pixels)
      const gap = 2;
      
      // Calculate grid position (centered)
      const gridX = (colIndex - layout.grid[0].length / 2) * (blockSize + gap);
      const gridY = (layout.grid.length - rowIndex - 1) * (blockSize + gap);
      
      // Position relative to building center and ground
      const blockX = buildingCenterX + gridX;
      const blockY = actualGroundLevel - gridY + verticalOffset;

      // Create regular block
      const block = Bodies.rectangle(blockX, blockY, blockSize, blockSize, {
        label: 'block',
        restitution: 0.1, // Reduced bounciness
        friction: 1.0, // Increased friction
        density: 1.5, // Increased density for stability
        render: {
          fillStyle: '#8B4513',
          strokeStyle: '#654321',
          lineWidth: 1,
          sprite: {
            texture: layout.blockTypes[blockType].texture,
            xScale: 0.5,
            yScale: 0.5,
          }
        },
      });
      blocks.push(block);
    });
  });

  // Create character block as a physics body
  layout.objects.forEach(object => {
    if (object.type === 'character') {
      // Calculate position for character
      const gap = 2;
      const gridX = (object.x - layout.grid[0].length / 2) * (blockSize + gap);
      const gridY = (layout.grid.length - object.y - 1) * (blockSize + gap);
      const objX = buildingCenterX + gridX;
      const objY = actualGroundLevel - gridY + verticalOffset;

      // Create character block with exact dimensions
      const characterBlock = Bodies.rectangle(
        objX,
        objY,
        blockSize * 3, // Make character block wider for stability
        blockSize * 2, // Make character block taller
        {
          label: 'character',
          restitution: 0.1,
          friction: 1.0,
          density: 1.5,
          isStatic: false,
          render: {
            fillStyle: '#8B4513',
            strokeStyle: '#654321',
            lineWidth: 1,
            sprite: {
              texture: object.texture,
              xScale: 0.5, // Half size
              yScale: 0.5  // Half size
            }
          }
        }
      );
      blocks.push(characterBlock);
    }
  });

  return {
    blocks,
    constraints
  };
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
