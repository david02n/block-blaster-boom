
import { Events, Engine, Body, World } from 'matter-js';

export const setupCollisionDetection = (
  engine: Engine,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      
      // Check if bomb hits a block
      if ((bodyA.label === 'bomb' && bodyB.label === 'block') || 
          (bodyA.label === 'block' && bodyB.label === 'bomb')) {
        
        const block = bodyA.label === 'block' ? bodyA : bodyB;
        const bomb = bodyA.label === 'bomb' ? bodyA : bodyB;
        
        // Only process if block hasn't been destroyed yet
        if (!destroyedBlocksRef.current.has(block)) {
          console.log('Bomb hit block!', { block: block.id, bomb: bomb.id });
          
          // Increment hit count
          (block as any).hitCount = ((block as any).hitCount || 0) + 1;
          
          // Check if block should be destroyed
          if ((block as any).hitCount >= (block as any).maxHits) {
            // Mark block for destruction using Set
            destroyedBlocksRef.current.add(block);
            setBlocksDestroyed(prev => prev + 1);
            setScore(prev => prev + 10);
            console.log('Block destroyed after', (block as any).hitCount, 'hits');
          } else {
            // Block hit but not destroyed - change appearance to show damage
            block.render.fillStyle = darkenColor(block.render.fillStyle as string);
            console.log('Block damaged, hits:', (block as any).hitCount);
            setScore(prev => prev + 2); // Small score for hitting but not destroying
          }
        }
      }
    });
  });

  // Check for blocks falling off the island (screen boundaries)
  const checkBoundaries = () => {
    const canvasWidth = engine.render?.canvas?.width || 1920;
    const canvasHeight = engine.render?.canvas?.height || 1080;
    const groundLevel = canvasHeight - 80; // Ground is 40px high, so top is at height - 80
    
    const blocksToRemove: Body[] = [];
    
    engine.world.bodies.forEach((body) => {
      if (body.label === 'block' && !destroyedBlocksRef.current.has(body)) {
        // Check if block fell off the sides or below the screen
        if (body.position.x < -50 || 
            body.position.x > canvasWidth + 50 || 
            body.position.y > canvasHeight + 100) {
          
          console.log('Block fell off island:', { 
            id: body.id, 
            x: body.position.x, 
            y: body.position.y 
          });
          
          blocksToRemove.push(body);
          destroyedBlocksRef.current.add(body);
          setBlocksDestroyed(prev => prev + 1);
          setScore(prev => prev + 5); // Less points for blocks that just fall off
        }
      }
    });
    
    // Remove fallen blocks from the world
    if (blocksToRemove.length > 0) {
      World.remove(engine.world, blocksToRemove);
    }
  };

  // Check boundaries every frame
  Events.on(engine, 'beforeUpdate', checkBoundaries);
};

// Helper function to darken a color to show damage
const darkenColor = (color: string): string => {
  // Simple darkening by reducing brightness
  if (color === '#DE2910') return '#B01F0A'; // Darker red
  if (color === '#FFDE00') return '#CCA500'; // Darker yellow
  return color;
};

// Function to handle explosion damage to blocks
export const applyExplosionDamage = (
  block: Body,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  if (destroyedBlocksRef.current.has(block)) return;
  
  // Increment hit count for explosion damage
  (block as any).hitCount = ((block as any).hitCount || 0) + 1;
  
  // Check if block should be destroyed
  if ((block as any).hitCount >= (block as any).maxHits) {
    // Mark block for destruction
    destroyedBlocksRef.current.add(block);
    setBlocksDestroyed(prev => prev + 1);
    setScore(prev => prev + 10);
    console.log('Block destroyed by explosion after', (block as any).hitCount, 'hits');
  } else {
    // Block hit but not destroyed - change appearance to show damage
    block.render.fillStyle = darkenColor(block.render.fillStyle as string);
    console.log('Block damaged by explosion, hits:', (block as any).hitCount);
    setScore(prev => prev + 2); // Small score for hitting but not destroying
  }
};
