
import { Engine, World, Body } from 'matter-js';
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

  const bomb = createBomb(150, 450);
  
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

  setBombsLeft(prev => prev - 1);
  setGameStarted(true);

  // Remove bomb after 8 seconds
  setTimeout(() => {
    console.log('Removing bomb from world');
    World.remove(engine.world, bomb);
  }, 8000);

  toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
};
