import { Engine, World, Body, Bodies } from 'matter-js';
import { createBomb } from './gameObjects';
import { audioManager } from './audioUtils';
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

  // Play random catapult sound effect
  audioManager.playRandomSound('catapult');

  const radianAngle = (angle * Math.PI) / 180;
  const force = power * 4;
  
  console.log('Calculated force:', { radianAngle, force });

  // Position bomb at the catapult location but higher up for proper launch
  const bombX = 240; // Match catapult X position
  const bombY = 360; // Position bomb higher above catapult for proper trajectory
  
  const bomb = createBomb(bombX, bombY);
  
  // Apply force based on angle and power - now supporting full 360 degrees
  const forceVector = {
    x: Math.cos(radianAngle) * force,
    y: -Math.sin(radianAngle) * force, // Negative Y for upward launch
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
    audioManager.playRandomSound('explosion');
    explodeBomb(engine, bomb);
    World.remove(engine.world, bomb);
    // Remove any constraints connected to the bomb
    const constraints = engine.world.constraints;
    for (let i = constraints.length - 1; i >= 0; i--) {
      if (constraints[i].bodyA === bomb || constraints[i].bodyB === bomb) {
        World.remove(engine.world, constraints[i]);
      }
    }
  }, 3000);

  setBombsLeft(prev => prev - 1);
  setGameStarted(true);

  toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
};

const explodeBomb = (engine: Engine, bomb: Body) => {
  const explosionRadius = 120;
  const explosionForce = 25;
  
  console.log('Creating bomb explosion at:', bomb.position);
  
  createBombExplosionEffect(engine, bomb.position.x, bomb.position.y, explosionRadius);
  
  engine.world.bodies.forEach((body) => {
    if (body.label === 'block' && !body.isStatic) {
      const distance = Math.sqrt(
        Math.pow(body.position.x - bomb.position.x, 2) + 
        Math.pow(body.position.y - bomb.position.y, 2)
      );
      
      if (distance < explosionRadius) {
        const forceX = (body.position.x - bomb.position.x) / distance * explosionForce;
        const forceY = (body.position.y - bomb.position.y) / distance * explosionForce;
        Body.applyForce(body, body.position, { x: forceX, y: forceY });
        console.log('Bomb explosion force applied to block:', body.id);
      }
    }
  });
};

const createBombExplosionEffect = (engine: Engine, x: number, y: number, maxRadius: number) => {
  const explosionEffects: Body[] = [];
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const initialRadius = 10 + i * 5;
      
      const explosionEffect = Bodies.circle(x, y, initialRadius, {
        render: {
          fillStyle: i === 0 ? '#FFFF00' : '#FF6600',
          strokeStyle: '#FF0000',
          lineWidth: 2,
        },
        isStatic: true,
        isSensor: true,
        label: 'explosion',
      });
      
      World.add(engine.world, explosionEffect);
      explosionEffects.push(explosionEffect);
      
      let currentRadius = initialRadius;
      const targetRadius = maxRadius - i * 20;
      const expansionRate = 15;
      
      const expandRing = () => {
        if (currentRadius < targetRadius) {
          currentRadius += expansionRate;
          
          World.remove(engine.world, explosionEffect);
          
          const newExplosionEffect = Bodies.circle(x, y, currentRadius, {
            render: {
              fillStyle: i === 0 ? 
                `rgba(255, 255, 0, ${Math.max(0.1, 1 - (currentRadius / targetRadius) * 0.9)})` : 
                `rgba(255, 102, 0, ${Math.max(0.1, 1 - (currentRadius / targetRadius) * 0.9)})`,
              strokeStyle: '#FF0000',
              lineWidth: 2,
            },
            isStatic: true,
            isSensor: true,
            label: 'explosion',
          });
          
          World.add(engine.world, newExplosionEffect);
          explosionEffects.push(newExplosionEffect);
          
          setTimeout(expandRing, 40);
        }
      };
      
      expandRing();
    }, i * 100);
  }
  
  setTimeout(() => {
    explosionEffects.forEach(effect => {
      World.remove(engine.world, effect);
    });
  }, 2000);
};
