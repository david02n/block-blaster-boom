
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
          
          // Check if block should explode
          if ((block as any).hitCount >= (block as any).maxHits) {
            console.log('Block exploding after', (block as any).hitCount, 'hits');
            explodeBlock(engine, block, destroyedBlocksRef, setBlocksDestroyed, setScore);
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

// Function to explode a block and create a cascade effect
const explodeBlock = (
  engine: Engine,
  block: Body,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  // Mark this block as destroyed
  destroyedBlocksRef.current.add(block);
  setBlocksDestroyed(prev => prev + 1);
  setScore(prev => prev + 15); // Higher score for exploded blocks
  
  console.log('Block exploding at position:', block.position);
  
  const explosionRadius = 80; // Smaller radius for cascade effect
  const explosionForce = 15;
  
  // Create visual explosion effect
  createExplosionEffect(engine, block.position.x, block.position.y, explosionRadius);
  
  // Find all blocks within explosion radius
  const affectedBlocks: Body[] = [];
  
  engine.world.bodies.forEach((body) => {
    if (body.label === 'block' && !destroyedBlocksRef.current.has(body) && body !== block) {
      const distance = Math.sqrt(
        Math.pow(body.position.x - block.position.x, 2) + 
        Math.pow(body.position.y - block.position.y, 2)
      );
      
      if (distance < explosionRadius) {
        affectedBlocks.push(body);
        
        // Apply explosive force
        const forceX = (body.position.x - block.position.x) / distance * explosionForce;
        const forceY = (body.position.y - block.position.y) / distance * explosionForce;
        Body.applyForce(body, body.position, { x: forceX, y: forceY });
        
        console.log('Explosion force applied to block:', body.id);
      }
    }
  });
  
  // Remove the exploded block immediately
  World.remove(engine.world, block);
  
  // Damage affected blocks with a delay to create cascade effect
  setTimeout(() => {
    affectedBlocks.forEach((affectedBlock) => {
      if (!destroyedBlocksRef.current.has(affectedBlock)) {
        // Increment hit count
        (affectedBlock as any).hitCount = ((affectedBlock as any).hitCount || 0) + 1;
        
        // Check if this block should also explode (cascade!)
        if ((affectedBlock as any).hitCount >= (affectedBlock as any).maxHits) {
          console.log('Cascade explosion triggered for block:', affectedBlock.id);
          // Recursive explosion!
          explodeBlock(engine, affectedBlock, destroyedBlocksRef, setBlocksDestroyed, setScore);
        } else {
          // Just damage the block
          affectedBlock.render.fillStyle = darkenColor(affectedBlock.render.fillStyle as string);
          console.log('Block damaged by explosion, hits:', (affectedBlock as any).hitCount);
          setScore(prev => prev + 3); // Score for explosion damage
        }
      }
    });
  }, 100); // Small delay for cascade effect
};

// Create visual explosion effect
const createExplosionEffect = (engine: Engine, x: number, y: number, maxRadius: number) => {
  const explosionEffects: Body[] = [];
  
  // Create initial explosion effect
  const explosionEffect = Body.create({
    position: { x, y },
    render: {
      fillStyle: '#FF6600',
      strokeStyle: '#FF0000',
      lineWidth: 3,
    },
    isStatic: true,
    isSensor: true,
    label: 'explosion',
  });
  
  // Make it a circle shape
  Body.setVertices(explosionEffect, [
    { x: x - 5, y: y - 5 },
    { x: x + 5, y: y - 5 },
    { x: x + 5, y: y + 5 },
    { x: x - 5, y: y + 5 }
  ]);
  
  World.add(engine.world, explosionEffect);
  explosionEffects.push(explosionEffect);
  
  // Animate explosion expansion
  let currentRadius = 5;
  const expansionRate = 10;
  
  const expandExplosion = () => {
    if (currentRadius < maxRadius) {
      currentRadius += expansionRate;
      
      // Update the explosion effect size
      const newVertices = [
        { x: x - currentRadius, y: y - currentRadius },
        { x: x + currentRadius, y: y - currentRadius },
        { x: x + currentRadius, y: y + currentRadius },
        { x: x - currentRadius, y: y + currentRadius }
      ];
      
      Body.setVertices(explosionEffect, newVertices);
      
      // Fade the explosion
      const opacity = 1 - (currentRadius / maxRadius) * 0.8;
      explosionEffect.render.fillStyle = `rgba(255, 102, 0, ${opacity})`;
      
      setTimeout(expandExplosion, 30);
    } else {
      // Clean up explosion effects
      setTimeout(() => {
        explosionEffects.forEach(effect => {
          World.remove(engine.world, effect);
        });
      }, 200);
    }
  };
  
  expandExplosion();
};

// Helper function to darken a color to show damage
const darkenColor = (color: string): string => {
  // Simple darkening by reducing brightness
  if (color === '#DE2910') return '#B01F0A'; // Darker red
  if (color === '#FFDE00') return '#CCA500'; // Darker yellow
  if (color === '#B01F0A') return '#8B1508'; // Even darker red
  if (color === '#CCA500') return '#A08400'; // Even darker yellow
  return color;
};

// Function to handle explosion damage to blocks (kept for compatibility)
export const applyExplosionDamage = (
  block: Body,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  if (destroyedBlocksRef.current.has(block)) return;
  
  // This function is now handled by the explodeBlock function for better cascade effects
  console.log('applyExplosionDamage called but handled by explodeBlock system');
};
