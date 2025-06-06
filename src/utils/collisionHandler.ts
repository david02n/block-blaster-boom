
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
          
          // Mark block for destruction using Set
          destroyedBlocksRef.current.add(block);
          setBlocksDestroyed(prev => prev + 1);
          setScore(prev => prev + 10);
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
