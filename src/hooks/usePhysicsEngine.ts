
import { useRef, useEffect } from 'react';
import { Engine, Render, World, Runner, Mouse, MouseConstraint } from 'matter-js';
import { createLargeTower, createGround, createCatapult } from '../utils/gameObjects';

export const usePhysicsEngine = (sceneRef: React.RefObject<HTMLDivElement>) => {
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();

  useEffect(() => {
    if (!sceneRef.current) return;

    // Use fixed dimensions instead of responsive sizing
    const canvasWidth = 1200;
    const canvasHeight = 600;

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer with fixed dimensions
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'transparent',
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create segmented ground with gaps
    const groundSegments = createGround(canvasWidth, canvasHeight);
    World.add(engine.world, groundSegments);

    const catapult = createCatapult(canvasWidth, canvasHeight);
    World.add(engine.world, catapult);

    // Position single large tower properly on the right ground segment
    const groundLevel = canvasHeight - 10;
    const largeTower = createLargeTower(canvasWidth * 0.8, groundLevel);
    World.add(engine.world, largeTower);

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
    if (!engineRef.current || !renderRef.current) return;

    // Use fixed dimensions
    const canvasWidth = 1200;
    const canvasHeight = 600;
    const groundLevel = canvasHeight - 10;

    // Create single large tower on the right ground segment
    const largeTower = createLargeTower(canvasWidth * 0.8, groundLevel);
    World.add(engineRef.current.world, largeTower);
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
    renderRef,
    recreateBuildings,
    removeBodiesExceptStatic,
  };
};
