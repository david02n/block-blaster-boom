import React, { useRef, useEffect } from 'react';
import { Engine, Render, World, Bodies, Body, Mouse, MouseConstraint, Runner } from 'matter-js';

const TerrainDestruction = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine>();
  const renderRef = useRef<Render>();
  const runnerRef = useRef<Runner>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;
    const buildingCenterX = width * 0.75; // Position object 75% across
    const groundLevel = height - 10; // Ground level offset

    // Initialize physics engine
    const engine = Engine.create();
    engine.world.gravity.y = 1.0; // Increased gravity
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: canvas,
      engine: engine,
      options: {
        width: width,
        height: height,
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

    // Create ground
    const ground = Bodies.rectangle(
      width / 2,
      groundLevel,
      width,
      20,
      {
        isStatic: true,
        label: 'ground',
        render: {
          fillStyle: '#654321',
        },
      }
    );
    World.add(engine.world, ground);

    // Create building blocks with physics
    const img = new Image();
    img.src = '/lovable-uploads/my_object.png';
    img.onload = () => {
      const scale = 0.5; // Reduce by half
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Create building blocks
      const buildingBlocks = [];
      const blockSize = 25;
      const gap = 2;
      
      // Create grid of blocks
      const rows = 10;
      const cols = 8;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const block = Bodies.rectangle(
            buildingCenterX + (col - cols/2) * (blockSize + gap),
            groundLevel - (row * (blockSize + gap)),
            blockSize,
            blockSize,
            {
              label: 'block',
              restitution: 0.2,
              friction: 0.7,
              render: {
                fillStyle: '#8B4513',
                strokeStyle: '#654321',
                lineWidth: 1,
              },
            }
          );
          buildingBlocks.push(block);
        }
      }
      
      // Create character block
      const character = Bodies.rectangle(
        buildingCenterX,
        groundLevel - scaledHeight - 20,
        scaledWidth,
        scaledHeight,
        {
          label: 'character',
          restitution: 0.2,
          friction: 0.7,
          render: {
            fillStyle: '#8B4513',
            strokeStyle: '#654321',
            lineWidth: 1,
            sprite: {
              texture: '/lovable-uploads/my_object.png',
              xScale: scale,
              yScale: scale,
            }
          },
        }
      );
      buildingBlocks.push(character);

      // Add all blocks to world
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
    };

    // Handle block destruction
    const handleBlockDestruction = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find and remove blocks near click point
      const bodiesToRemove = engine.world.bodies.filter(body => {
        if (body.label === 'ground' || body.label === 'character') return false;
        const dx = x - body.position.x;
        const dy = y - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 30; // 30px radius
      });

      World.remove(engine.world, bodiesToRemove);
    };

    canvas.addEventListener('click', handleBlockDestruction);

    return () => {
      canvas.removeEventListener('click', handleBlockDestruction);
      if (renderRef.current) {
        Render.stop(renderRef.current);
      }
      if (runnerRef.current && engineRef.current) {
        Runner.stop(runnerRef.current);
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
};

export default TerrainDestruction;
