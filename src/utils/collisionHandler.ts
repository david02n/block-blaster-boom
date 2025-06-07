import { Events, Engine, Body, World, Bodies } from 'matter-js';

export const setupCollisionDetection = (
  engine: Engine,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;
      
      // Check if bomb hits a block or character
      if ((bodyA.label === 'bomb' && (bodyB.label === 'block' || bodyB.label === 'character')) || 
          ((bodyA.label === 'block' || bodyA.label === 'character') && bodyB.label === 'bomb')) {
        
        const isCharacter = bodyA.label === 'character' || bodyB.label === 'character';
        const target = bodyA.label === 'block' || bodyA.label === 'character' ? bodyA : bodyB;
        const bomb = bodyA.label === 'bomb' ? bodyA : bodyB;
        
        // Only process if target hasn't been destroyed yet
        if (!destroyedBlocksRef.current.has(target)) {
          if (isCharacter) {
            // Character hit logic
            (target as any).health = ((target as any).health || 5) - 1;
            (target as any).showHealthBar = true;
            console.log('Character hit! Health:', (target as any).health);
            setScore(prev => prev + 10); // More points for hitting character
            if ((target as any).health <= 0) {
              console.log('Character defeated!');
              explodeCharacter(engine, target, destroyedBlocksRef, setBlocksDestroyed, setScore);
            }
          } else {
            // Block logic (existing)
            (target as any).hitCount = ((target as any).hitCount || 0) + 1;
            if ((target as any).hitCount >= 8) {
              console.log('Block exploding after', (target as any).hitCount, 'hits');
              explodeBlock(engine, target, destroyedBlocksRef, setBlocksDestroyed, setScore);
            } else {
              target.render.fillStyle = darkenColor(target.render.fillStyle as string);
              console.log('Block damaged, hits:', (target as any).hitCount);
              setScore(prev => prev + 2);
            }
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
  
  const explosionRadius = 60; // Reduced from 80 to 60 for more focused explosions
  const explosionForce = 8; // Reduced from 15 to 8 for less destructive force
  
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
  
  // Damage affected blocks with a delay to create cascade effect - but less damage
  setTimeout(() => {
    affectedBlocks.forEach((affectedBlock) => {
      if (!destroyedBlocksRef.current.has(affectedBlock)) {
        // Increment hit count by only 1 for explosion damage (reduced from previous)
        (affectedBlock as any).hitCount = ((affectedBlock as any).hitCount || 0) + 1;
        
        // Check if this block should also explode - now requires 8 hits total
        if ((affectedBlock as any).hitCount >= 8) {
          console.log('Cascade explosion triggered for block:', affectedBlock.id);
          // Recursive explosion!
          explodeBlock(engine, affectedBlock, destroyedBlocksRef, setBlocksDestroyed, setScore);
        } else {
          // Just damage the block
          affectedBlock.render.fillStyle = darkenColor(affectedBlock.render.fillStyle as string);
          console.log('Block damaged by explosion, hits:', (affectedBlock as any).hitCount);
          setScore(prev => prev + 1); // Reduced score for explosion damage
        }
      }
    });
  }, 150); // Slightly longer delay for cascade effect
};

// Create visual explosion effect with proper circle shape
const createExplosionEffect = (engine: Engine, x: number, y: number, maxRadius: number) => {
  const explosionEffects: Body[] = [];
  
  // Create initial explosion effect
  const explosionEffect = Bodies.circle(x, y, 5, {
    render: {
      fillStyle: '#FF6600',
      strokeStyle: '#FF0000',
      lineWidth: 3,
    },
    isStatic: true,
    isSensor: true,
    label: 'explosion',
  });
  
  World.add(engine.world, explosionEffect);
  explosionEffects.push(explosionEffect);
  
  // Animate explosion expansion
  let currentRadius = 5;
  const expansionRate = 10;
  
  const expandExplosion = () => {
    if (currentRadius < maxRadius) {
      currentRadius += expansionRate;
      
      // Create a new circle body with the expanded radius
      World.remove(engine.world, explosionEffect);
      
      const newExplosionEffect = Bodies.circle(x, y, currentRadius, {
        render: {
          fillStyle: `rgba(255, 102, 0, ${1 - (currentRadius / maxRadius) * 0.8})`,
          strokeStyle: '#FF0000',
          lineWidth: 3,
        },
        isStatic: true,
        isSensor: true,
        label: 'explosion',
      });
      
      World.add(engine.world, newExplosionEffect);
      explosionEffects.push(newExplosionEffect);
      
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

// Add this function for red particle burst
const explodeCharacter = (
  engine: Engine,
  character: Body,
  destroyedBlocksRef: React.MutableRefObject<Set<Body>>,
  setBlocksDestroyed: (value: React.SetStateAction<number>) => void,
  setScore: (value: React.SetStateAction<number>) => void
) => {
  destroyedBlocksRef.current.add(character);
  setBlocksDestroyed(prev => prev + 1);
  setScore(prev => prev + 50); // Big score for defeating character
  // Red particle burst effect
  createRedParticleBurst(engine, character.position.x, character.position.y);
  World.remove(engine.world, character);
};

const createRedParticleBurst = (engine: Engine, x: number, y: number) => {
  const particles: Body[] = [];
  const numParticles = 20;
  for (let i = 0; i < numParticles; i++) {
    const angle = (2 * Math.PI * i) / numParticles;
    const speed = 8 + Math.random() * 4;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const particle = Bodies.circle(x, y, 6, {
      label: 'character-particle',
      isStatic: false,
      isSensor: true,
      render: {
        fillStyle: '#d90429',
        strokeStyle: '#a10015',
        lineWidth: 1,
      },
    });
    Body.setVelocity(particle, { x: vx, y: vy });
    particles.push(particle);
  }
  World.add(engine.world, particles);
  setTimeout(() => {
    World.remove(engine.world, particles);
  }, 900);
};
