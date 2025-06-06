
import { Engine, World, Body, Bodies } from 'matter-js';
import { createBomb } from './gameObjects';
import { audioManager } from './audioUtils';
import { applyExplosionDamage } from './collisionHandler';
import { toast } from 'sonner';

export const fireBomb = (
  engine: Engine,
  renderRef: React.RefObject<any>,
  power: number,
  angle: number,
  bombsLeft: number,
  setBombsLeft: (value: React.SetStateAction<number>) => void,
  setGameStarted: (value: React.SetStateAction<boolean>) => void
) => {
  if (bombsLeft <= 0 || !renderRef.current) {
    console.log('Cannot fire bomb:', { engine: !!engine, bombsLeft, render: !!renderRef.current });
    return;
  }

  console.log('Firing bomb with:', { power, angle, bombsLeft });

  // Play Trump "Tariff" sound effect
  audioManager.playTrumpTariff();

  const radianAngle = (angle * Math.PI) / 180;
  
  // Maximum force for ultimate power
  const force = power / 1;
  
  console.log('Calculated force:', { radianAngle, force });

  // Get canvas dimensions for responsive positioning
  const canvasWidth = renderRef.current.canvas.width;
  const canvasHeight = renderRef.current.canvas.height;
  
  // Position bomb at catapult location (15% from left, above ground)
  const bombX = canvasWidth * 0.15;
  const bombY = canvasHeight - 200; // Above the catapult
  
  const bomb = createBomb(bombX, bombY);
  
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
    explodeBomb(engine, bomb, renderRef);
    // Remove the bomb immediately when it explodes
    World.remove(engine.world, bomb);
  }, 3000);

  setBombsLeft(prev => prev - 1);
  setGameStarted(true);

  toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
};

const explodeBomb = (engine: Engine, bomb: Body, renderRef: React.RefObject<any>) => {
  const explosionRadius = 150;
  const explosionForce = 20;
  const explosionEffects: Body[] = [];
  
  console.log('Creating explosion at:', bomb.position);
  
  // Create initial explosion effect
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
  explosionEffects.push(explosionEffect);
  
  // Animate explosion expansion
  let currentRadius = 5;
  const maxRadius = explosionRadius;
  const expansionRate = 15;
  
  const expandExplosion = () => {
    if (currentRadius < maxRadius) {
      currentRadius += expansionRate;
      
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
      explosionEffects.push(newExplosion);
      
      setTimeout(expandExplosion, 50);
    } else {
      // Clean up all explosion effects after expansion is complete
      setTimeout(() => {
        console.log('Cleaning up explosion effects');
        explosionEffects.forEach(effect => {
          World.remove(engine.world, effect);
        });
      }, 500);
    }
  };
  
  expandExplosion();
  
  // Apply explosion force and damage to blocks
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
        
        // Apply explosion damage using the collision system
        // We need to pass the required functions - this will be handled in the Game component
        (body as any).needsExplosionDamage = true;
      }
    }
  });
};
