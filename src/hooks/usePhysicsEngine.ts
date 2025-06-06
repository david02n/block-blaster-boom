
import { useRef, useEffect } from 'react';
import { Engine, Render, World, Runner, Mouse, MouseConstraint } from 'matter-js';
import { createBuilding, createGround, createCatapult } from '../utils/gameObjects';

export const usePhysicsEngine = (sceneRef: React.RefObject<HTMLDivElement>) => {
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();

  useEffect(() => {
    if (!sceneRef.current) return;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer with grass-themed background
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 1000,
        height: 600,
        wireframes: false,
        background: 'linear-gradient(180deg, #87CEEB 0%, #98E4D6 50%, #7CB342 100%)',
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create world objects
    const ground = createGround();
    World.add(engine.world, ground);

    const catapult = createCatapult();
    World.add(engine.world, catapult);

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
  }, [sceneRef]);

  const recreateBuildings = () => {
    if (!engineRef.current) return;

    const building1 = createBuilding(700, 500, 4, 8);
    const building2 = createBuilding(850, 500, 3, 6);
    World.add(engineRef.current.world, [...building1, ...building2]);
  };

  const removeBodiesExceptStatic = () => {
    if (!engineRef.current) return;

    const bodiesToRemove = engineRef.current.world.bodies.filter(
      body => body.label !== 'ground' && body.label !== 'catapult'
    );
    World.remove(engineRef.current.world, bodiesToRemove);
  };

  return {
    engineRef,
    recreateBuildings,
    removeBodiesExceptStatic,
  };
};
