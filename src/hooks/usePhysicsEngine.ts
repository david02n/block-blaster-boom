
import { useRef, useEffect } from 'react';
import { Engine, Render, World, Runner, Mouse, MouseConstraint } from 'matter-js';
import { createBuilding, createGround, createCatapult } from '../utils/gameObjects';
import { CHINA_BUILDING } from '../utils/buildingLayouts';

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

    // Create building with layout
    const buildingBlocks = createBuilding(
      CHINA_BUILDING,
      canvasWidth * 0.75, // Position building 75% across the screen
      canvasHeight
    ).blocks;
    World.add(engine.world, buildingBlocks);

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

    // Create building with layout
    const buildingBlocks = createBuilding(
      CHINA_BUILDING,
      canvasWidth * 0.8, // Position building 80% across the screen
      groundLevel
    ).blocks;
    World.add(engineRef.current.world, buildingBlocks);
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
