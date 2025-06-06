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

  // Play Trump "Tariff" sound effect
  audioManager.playTrumpTariff();

  const radianAngle = (angle * Math.PI) / 180;
  
  // Doubled the force again for maximum power
  const force = power * 4; // Doubled again from *2 to *4
  
  console.log('Calculated force:', { radianAngle, force });

  // Get canvas dimensions for responsive positioning
  const canvasWidth = renderRef.current.canvas.width;
  const canvasHeight = renderRef.current.canvas.height;
  
  // Position bomb at catapult location (15% from left, above ground)
  const bombX = canvasWidth * 0.15;
  const bombY = canvasHeight - 200; // Above the catapult
  
  const bomb = createBomb(bombX, bombY);
  
  // Apply force based on angle and power with doubled multiplier
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
    // Remove the bomb immediately when it explodes
    World.remove(engine.world, bomb);
  }, 3000);

  setBombsLeft(prev => prev - 1);
  setGameStarted(true);

  toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
};

const explodeBomb = (engine: Engine, bomb: Body) => {
  const explosionRadius = 120; // Larger initial blast
  const explosionForce = 25;
  
  console.log('Creating bomb explosion at:', bomb.position);
  
  // Create visual explosion effect
  createBombExplosionEffect(engine, bomb.position.x, bomb.position.y, explosionRadius);
  
  // Apply explosion force to all blocks in range
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
        console.log('Bomb explosion force applied to block:', body.id);
        
        // The collision detection system will handle the hit counting and potential cascading
      }
    }
  });
};

// Create visual explosion effect for bombs
const createBombExplosionEffect = (engine: Engine, x: number, y: number, maxRadius: number) => {
  const explosionEffects: Body[] = [];
  
  // Create multiple explosion rings for dramatic effect
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const explosionEffect = Body.create({
        position: { x, y },
        render: {
          fillStyle: i === 0 ? '#FFFF00' : '#FF6600', // Yellow center, orange outer
          strokeStyle: '#FF0000',
          lineWidth: 2,
        },
        isStatic: true,
        isSensor: true,
        label: 'explosion',
      });
      
      // Make it a circle shape
      const initialRadius = 10 + i * 5;
      Body.setVertices(explosionEffect, [
        { x: x - initialRadius, y: y - initialRadius },
        { x: x + initialRadius, y: y - initialRadius },
        { x: x + initialRadius, y: y + initialRadius },
        { x: x - initialRadius, y: y + initialRadius }
      ]);
      
      World.add(engine.world, explosionEffect);
      explosionEffects.push(explosionEffect);
      
      // Animate this ring
      let currentRadius = initialRadius;
      const targetRadius = maxRadius - i * 20;
      const expansionRate = 15;
      
      const expandRing = () => {
        if (currentRadius < targetRadius) {
          currentRadius += expansionRate;
          
          const newVertices = [
            { x: x - currentRadius, y: y - currentRadius },
            { x: x + currentRadius, y: y - currentRadius },
            { x: x + currentRadius, y: y + currentRadius },
            { x: x - currentRadius, y: y + currentRadius }
          ];
          
          Body.setVertices(explosionEffect, newVertices);
          
          // Fade the explosion
          const opacity = Math.max(0.1, 1 - (currentRadius / targetRadius) * 0.9);
          explosionEffect.render.fillStyle = i === 0 ? 
            `rgba(255, 255, 0, ${opacity})` : 
            `rgba(255, 102, 0, ${opacity})`;
          
          setTimeout(expandRing, 40);
        }
      };
      
      expandRing();
    }, i * 100); // Stagger the rings
  }
  
  // Clean up all explosion effects
  setTimeout(() => {
    explosionEffects.forEach(effect => {
      World.remove(engine.world, effect);
    });
  }, 2000);
};
