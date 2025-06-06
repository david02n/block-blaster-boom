
import { useRef, useEffect, useState } from 'react';
import { Engine, Render, World, Runner, Mouse, MouseConstraint } from 'matter-js';
import { createLargeTower, createGround, createCatapult } from '../utils/gameObjects';
import { calculateScale } from '../utils/scalingUtils';

export const usePhysicsEngine = (sceneRef: React.RefObject<HTMLDivElement>) => {
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!sceneRef.current) return;

    // Get container dimensions
    const container = sceneRef.current;
    const containerRect = container.getBoundingClientRect();
    const canvasWidth = containerRect.width;
    const canvasHeight = containerRect.height;

    // Calculate scale factor
    const scaleConfig = calculateScale(canvasWidth, canvasHeight);
    setScale(scaleConfig.scale);

    // Create engine
    const engine = Engine.create();
    engine.world.gravity.y = 0.8;
    engineRef.current = engine;

    // Create renderer with dynamic dimensions
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

    // Create segmented ground with gaps using scale
    const groundSegments = createGround(canvasWidth, canvasHeight, scaleConfig.scale);
    World.add(engine.world, groundSegments);

    const catapult = createCatapult(canvasWidth, canvasHeight, scaleConfig.scale);
    World.add(engine.world, catapult);

    // Use a fixed ground level that doesn't change with resizing
    const fixedGroundLevel = canvasHeight - 50; // Fixed 50px from bottom
    
    console.log('Fixed ground positioning:', {
      canvasHeight,
      scale: scaleConfig.scale,
      fixedGroundLevel
    });
    
    const largeTower = createLargeTower(canvasWidth * 0.8, fixedGroundLevel, scaleConfig.scale);
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

    // Handle resize
    const handleResize = () => {
      if (!render || !sceneRef.current) return;
      
      const newRect = sceneRef.current.getBoundingClientRect();
      const newScaleConfig = calculateScale(newRect.width, newRect.height);
      
      render.canvas.width = newRect.width;
      render.canvas.height = newRect.height;
      render.options.width = newRect.width;
      render.options.height = newRect.height;
      
      setScale(newScaleConfig.scale);
    };

    window.addEventListener('resize', handleResize);

    // Start the engine and renderer
    Runner.run(runner, engine);
    Render.run(render);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    if (!engineRef.current || !renderRef.current || !sceneRef.current) return;

    // Get current dimensions and scale
    const containerRect = sceneRef.current.getBoundingClientRect();
    const canvasWidth = containerRect.width;
    const canvasHeight = containerRect.height;
    const scaleConfig = calculateScale(canvasWidth, canvasHeight);
    
    // Use the same fixed ground level
    const fixedGroundLevel = canvasHeight - 50;

    // Create single large tower on the right ground segment
    const largeTower = createLargeTower(canvasWidth * 0.8, fixedGroundLevel, scaleConfig.scale);
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
    scale,
  };
};
