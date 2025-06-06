
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

    // Create renderer with new 1920x1080 dimensions
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 1920,
        height: 1080,
        wireframes: false,
        background: '#87CEEB', // Cartoon blue sky color
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create world objects with adjusted positions for new screen size
    const ground = createGround();
    World.add(engine.world, ground);

    const catapult = createCatapult();
    World.add(engine.world, catapult);

    const building1 = createBuilding(1400, 900, 4, 8);
    const building2 = createBuilding(1650, 900, 3, 6);
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

    const building1 = createBuilding(1400, 900, 4, 8);
    const building2 = createBuilding(1650, 900, 3, 6);
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
