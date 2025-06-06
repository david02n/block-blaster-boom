
import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Body, Events, Mouse, MouseConstraint, Runner } from 'matter-js';
import { GameUI } from './GameUI';
import { createBuilding, createBomb, createGround, createCatapult } from '../utils/gameObjects';
import { toast } from 'sonner';

export const Game = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();
  const destroyedBlocksRef = useRef<Set<Body>>(new Set());
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(-45);
  const [score, setScore] = useState(0);
  const [blocksDestroyed, setBlocksDestroyed] = useState(0);
  const [bombsLeft, setBombsLeft] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 1000,
        height: 600,
        wireframes: false,
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)',
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create runner (replaces deprecated Engine.run)
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create ground
    const ground = createGround();
    World.add(engine.world, ground);

    // Create catapult
    const catapult = createCatapult();
    World.add(engine.world, catapult);

    // Create buildings
    const building1 = createBuilding(700, 500, 4, 8);
    const building2 = createBuilding(850, 500, 3, 6);
    World.add(engine.world, [...building1, ...building2]);

    // Add mouse control
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });
    World.add(engine.world, mouseConstraint);

    // Collision detection for scoring
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

    // Start the engine and renderer
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      if (renderRef.current) {
        Render.stop(renderRef.current);
      }
      if (runnerRef.current && engineRef.current) {
        Runner.stop(runnerRef.current);
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  const fireBomb = () => {
    if (!engineRef.current || bombsLeft <= 0) {
      console.log('Cannot fire bomb:', { engine: !!engineRef.current, bombsLeft });
      return;
    }

    console.log('Firing bomb with:', { power, angle, bombsLeft });

    const engine = engineRef.current;
    const radianAngle = (angle * Math.PI) / 180;
    
    // Increase force multiplier for better visibility
    const force = power / 500; // Changed from 1000 to 500 for stronger force
    
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

    // Remove bomb after 8 seconds (increased from 5)
    setTimeout(() => {
      console.log('Removing bomb from world');
      World.remove(engine.world, bomb);
    }, 8000);

    toast(`Bomb fired! ${bombsLeft - 1} bombs remaining`);
  };

  const resetGame = () => {
    if (!engineRef.current) return;

    // Clear all bodies except ground and catapult
    const bodiesToRemove = engineRef.current.world.bodies.filter(
      body => body.label !== 'ground' && body.label !== 'catapult'
    );
    World.remove(engineRef.current.world, bodiesToRemove);

    // Reset game state
    setScore(0);
    setBlocksDestroyed(0);
    setBombsLeft(5);
    setGameStarted(false);
    destroyedBlocksRef.current.clear();

    // Recreate buildings
    const building1 = createBuilding(700, 500, 4, 8);
    const building2 = createBuilding(850, 500, 3, 6);
    World.add(engineRef.current.world, [...building1, ...building2]);

    toast('Game reset! Ready for destruction!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-50 flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div 
            ref={sceneRef} 
            className="w-full h-full border-2 border-gray-300 rounded-lg shadow-lg bg-gradient-to-b from-sky-200 to-green-200"
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="space-y-2 text-sm font-semibold">
              <div className="text-primary">Score: {score}</div>
              <div className="text-orange-600">Blocks Destroyed: {blocksDestroyed}</div>
              <div className="text-red-600">Bombs Left: {bombsLeft}</div>
            </div>
          </div>
        </div>
        <GameUI
          power={power}
          setPower={setPower}
          angle={angle}
          setAngle={setAngle}
          onFire={fireBomb}
          onReset={resetGame}
          bombsLeft={bombsLeft}
          score={score}
        />
      </div>
    </div>
  );
};
