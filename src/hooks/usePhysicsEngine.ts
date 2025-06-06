
import { useRef, useEffect } from 'react';
import { Engine, Render, World, Runner, Mouse, MouseConstraint } from 'matter-js';
import { createBuilding, createGround, createCatapult } from '../utils/gameObjects';

export const usePhysicsEngine = (sceneRef: React.RefObject<HTMLDivElement>) => {
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();

  useEffect(() => {
    if (!sceneRef.current) return;

    // Calculate responsive dimensions while maintaining 16:9 aspect ratio
    const container = sceneRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Use 16:9 aspect ratio (1920:1080)
    const aspectRatio = 16 / 9;
    let canvasWidth = containerWidth;
    let canvasHeight = containerWidth / aspectRatio;
    
    // If height is too tall, adjust based on height
    if (canvasHeight > containerHeight) {
      canvasHeight = containerHeight;
      canvasWidth = containerHeight * aspectRatio;
    }

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer with responsive dimensions and background image
    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: canvasWidth,
        height: canvasHeight,
        wireframes: false,
        background: 'transparent', // Make background transparent to show CSS background
        showAngleIndicator: false,
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Create world objects positioned on the actual ground level
    const ground = createGround(canvasWidth, canvasHeight);
    World.add(engine.world, ground);

    const catapult = createCatapult(canvasWidth, canvasHeight);
    World.add(engine.world, catapult);

    // Position buildings on the actual ground level (bottom of screen where grass is)
    const groundLevel = canvasHeight - 80; // Just above the actual ground physics body
    const building1 = createBuilding(canvasWidth * 0.6, groundLevel, 6, 10); // Main building - larger and central
    const building2 = createBuilding(canvasWidth * 0.8, groundLevel, 4, 7);  // Side building
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
    if (!engineRef.current || !renderRef.current) return;

    const canvasWidth = renderRef.current.canvas.width;
    const canvasHeight = renderRef.current.canvas.height;
    const groundLevel = canvasHeight - 80; // Match the actual ground level

    const building1 = createBuilding(canvasWidth * 0.6, groundLevel, 6, 10);
    const building2 = createBuilding(canvasWidth * 0.8, groundLevel, 4, 7);
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
    renderRef,
    recreateBuildings,
    removeBodiesExceptStatic,
  };
};
