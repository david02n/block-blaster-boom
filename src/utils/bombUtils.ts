
import { Engine, World, Body, Bodies } from 'matter-js';
import { createBomb } from './gameObjects';
import { toast } from 'sonner';

export const fireBomb = (
  engine: Engine,
  power: number,
  angle: number,
  bombsLeft: number,
  setBombsLeft: (value: React.SetStateAction<number>) => void,
  setGameStarted: (value: React.SetStateAction<boolean>) => void
) => {
  if (bombsLeft <= 0) {
    console.log('Cannot fire bomb:', { engine: !!engine, bombsLeft });
    return;
  }

  console.log('Firing bomb with:', { power, angle, bombsLeft });

  const radianAngle = (angle * Math.PI) / 180;
  
  // Maximum force for ultimate power
  const force = power / 1;
  
  console.log('Calculated force:', { radianAngle, force });

  // Adjusted position to match the new catapult position
  const bomb = createBomb(120, 380);
  
  // Apply force based on angle and power
  const forceVector = {
    x: Math.cos(radianAngle) * force,
    y: Math.sin(radianAngle) * force,
  };
  
  console.log('Applying force vector:', forceVector);
  
  World.add(engine.world, bomb);
  
  // Apply force after a small delay to ensure bomb is in world
  setTimeout(() => {
    Body.applyForce(bomb, bomb.position, forceVector);
    console.log('Force applied to bomb at position:', bomb.position);
  }, 10);

  // Explode bomb after 3 seconds
  setTimeout(() => {
    console.log('Bomb exploding at position:', bomb.position);
    explodeBomb(engine, bomb);
  }, 3000);

  // Remove bomb after 8 seconds (cleanup)
  setTimeout(() => {
    console.log('Removing bomb from world');
    World.remove(engine.world, bomb);
  }, 8000);

  setBombsLeft(prev => prev - 1);
  setGameStarted(true);

  toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
};

const explodeBomb = (engine: Engine, bomb: Body) => {
  const explosionRadius = 150;
  const explosionForce = 20; // Increased from 2 to 20 for extremely powerful blast
  
  console.log('Creating explosion at:', bomb.position);
  
  // Create visual explosion effect
  const explosionEffect = Bodies.circle(bomb.position.x, bomb.position.y, 5, {
    isStatic: true,
    isSensor: true,
    label: 'explosion',
    render: {
      fillStyle: '#FF6600',
      strokeStyle: '#FF0000',
      lineWidth: 3,
    },
  });
  
  World.add(engine.world, explosionEffect);
  
  // Animate explosion expansion
  let currentRadius = 5;
  const maxRadius = explosionRadius;
  const expansionRate = 15;
  
  const expandExplosion = () => {
    if (currentRadius < maxRadius) {
      currentRadius += expansionRate;
      
      // Remove old explosion effect
      World.remove(engine.world, explosionEffect);
      
      // Create new larger explosion effect
      const newExplosion = Bodies.circle(bomb.position.x, bomb.position.y, currentRadius, {
        isStatic: true,
        isSensor: true,
        label: 'explosion',
        render: {
          fillStyle: `rgba(255, 102, 0, ${1 - (currentRadius / maxRadius) * 0.8})`,
          strokeStyle: '#FF0000',
          lineWidth: 2,
        },
      });
      
      World.add(engine.world, newExplosion);
      
      setTimeout(expandExplosion, 50);
      
      // Remove explosion effect when it reaches max radius
      if (currentRadius >= maxRadius) {
        setTimeout(() => {
          World.remove(engine.world, newExplosion);
        }, 500);
      }
    }
  };
  
  expandExplosion();
  
  // Apply explosion force to blocks
  engine.world.bodies.forEach((body) => {
    if (body.label === 'block' && !body.isStatic) {
      const distance = Math.sqrt(
        Math.pow(body.position.x - bomb.position.x, 2) + 
        Math.pow(body.position.y - bomb.position.y, 2)
      );
      
      if (distance < explosionRadius) {
        // Calculate force direction from explosion center to block
        const forceX = (body.position.x - bomb.position.x) / distance * explosionForce;
        const forceY = (body.position.y - bomb.position.y) / distance * explosionForce;
        Body.applyForce(body, body.position, { x: forceX, y: forceY });
        console.log('Explosion force applied to block:', body.id);
      }
    }
  });
};
