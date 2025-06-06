
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
        
        console.log('Bomb hit block!', { block: block.id, bomb: bomb.id });
        
        // Mark block for destruction using Set
        if (!destroyedBlocksRef.current.has(block)) {
          destroyedBlocksRef.current.add(block);
          setBlocksDestroyed(prev => prev + 1);
          setScore(prev => prev + 10);
          
          // Create explosion effect by applying force to nearby bodies
          const explosionRadius = 100;
          const explosionForce = 0.02;
          
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
              }
            }
          });
        }
      }
    });
  });
};
