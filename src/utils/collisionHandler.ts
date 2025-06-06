
import { Events, Engine, Body } from 'matter-js';

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
          
          // Mark block for destruction using Set
          destroyedBlocksRef.current.add(block);
          setBlocksDestroyed(prev => prev + 1);
          setScore(prev => prev + 10);
        }
      }
    });
  });
};
