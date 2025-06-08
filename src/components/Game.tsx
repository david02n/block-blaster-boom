import React, { useRef, useEffect } from 'react';
import { useGameState } from '../hooks/useGameState';
import { usePhysicsEngine } from '../hooks/usePhysicsEngine';
import { setupCollisionDetection } from '../utils/collisionHandler';
import { fireBomb } from '../utils/bombUtils';
import { toast } from 'sonner';
import { Engine, World, Bodies, Body } from 'matter-js';
import { audioManager } from '../utils/audioUtils';
import { Button } from '@/components/ui/button';
import { Bomb, RotateCcw } from 'lucide-react';
import { RadialJoystick } from './RadialJoystick';

export const Game = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const healthBarCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameState();
  const { engineRef, renderRef, recreateBuildings, removeBodiesExceptStatic } = usePhysicsEngine(sceneRef);

  // Load sounds when component mounts
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Load all sound files
        await audioManager.loadSoundsFromDirectory('/lovable-uploads/catapult-sounds/');
        await audioManager.loadSoundsFromDirectory('/lovable-uploads/explosion-sounds/');
        console.log('All sounds loaded successfully');
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };
    loadSounds();
  }, []);

  // Setup collision detection when engine is ready
  useEffect(() => {
    if (!engineRef.current) return;

    setupCollisionDetection(
      engineRef.current,
      gameState.destroyedBlocksRef,
      gameState.setBlocksDestroyed,
      gameState.setScore
    );
  }, [engineRef.current, gameState]);

  // Health bar overlay effect
  useEffect(() => {
    let animationFrame: number;
    const drawHealthBar = () => {
      const canvas = healthBarCanvasRef.current;
      const engine = engineRef.current;
      if (!canvas || !engine) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Find character
      const character = engine.world.bodies.find(b => b.label === 'character');
      if (character && (character as any).showHealthBar) {
        const health = (character as any).health || 0;
        const maxHealth = (character as any).maxHealth || 5;
        // Project physics position to canvas
        const x = character.position.x;
        const y = character.position.y - 60; // above character
        const barWidth = 80;
        const barHeight = 12;
        const healthRatio = Math.max(0, health / maxHealth);
        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#222';
        ctx.fillRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight);
        ctx.fillStyle = '#d90429';
        ctx.fillRect(x - barWidth/2 + 2, y - barHeight/2 + 2, (barWidth-4) * healthRatio, barHeight-4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight);
        ctx.restore();
      }
      animationFrame = requestAnimationFrame(drawHealthBar);
    };
    drawHealthBar();
    return () => cancelAnimationFrame(animationFrame);
  }, [engineRef]);

  const handleFireBomb = () => {
    if (!engineRef.current) return;

    fireBomb(
      engineRef.current,
      renderRef,
      gameState.power,
      gameState.angle,
      gameState.bombsLeft,
      gameState.setBombsLeft,
      gameState.setGameStarted
    );
  };

  const handleResetGame = () => {
    if (!engineRef.current) return;

    // Clear all bodies except ground and catapult
    removeBodiesExceptStatic();

    // Reset game state
    gameState.resetGameState();

    // Recreate buildings
    recreateBuildings();

    toast('Game reset! Ready for destruction!');
  };

  // Handle building destruction
  const handleBuildingDestruction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!engineRef.current) return;

    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find and remove blocks near click point
    const bodiesToRemove = engineRef.current.world.bodies.filter(body => {
      if (body.label === 'ground' || body.label === 'catapult') return false;
      const dx = x - body.position.x;
      const dy = y - body.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 30; // 30px radius
    });

    World.remove(engineRef.current.world, bodiesToRemove);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col justify-center items-center p-4" style={{
      backgroundImage: 'url(/assets/bg_wrapper.png)',
      backgroundRepeat: 'repeat',
      backgroundSize: 'auto'
    }}>
      <img 
        src="/assets/game_title.png" 
        alt="Block Blaster Boom" 
        className="mb-8 max-w-[900px] w-full drop-shadow-lg"
        style={{ 
          position: 'relative',
          zIndex: 10
        }}
      />
      <div className="game-container flex rounded-xl shadow-2xl overflow-hidden bg-white/95 backdrop-blur-sm border-4 border-orange-300">
        <div 
          ref={sceneRef} 
          className="relative border-4 border-white rounded-lg shadow-md overflow-hidden"
          style={{ 
            width: '1200px',
            height: '600px',
            backgroundImage: 'url(/assets/bg_canvas.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={handleBuildingDestruction}
        >
          <canvas
            ref={healthBarCanvasRef}
            width={1200}
            height={600}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
          <img 
            src="/lovable-uploads/plain_foreground.png" 
            alt="Foreground overlay"
            className="absolute bottom-0 w-full"
            style={{
              opacity: 1,
              pointerEvents: 'none'
            }}
          />

          {/* In-canvas controls */}
          <div className="absolute bottom-6 left-6 z-20">
            <div className="w-32 h-32 bg-white/90 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-gray-300">
              <div className="text-xs font-bold mb-2">Trajectory</div>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => gameState.setAngle(a => Math.max(0, a - 5))}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  ←
                </button>
                <div className="text-sm font-medium">{gameState.angle}°</div>
                <button 
                  onClick={() => gameState.setAngle(a => Math.min(360, a + 5))}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  →
                </button>
              </div>
              <div className="flex gap-3 items-center mt-2">
                <button 
                  onClick={() => gameState.setPower(p => Math.max(10, p - 5))}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  -
                </button>
                <div className="text-sm font-medium">{gameState.power}%</div>
                <button 
                  onClick={() => gameState.setPower(p => Math.min(100, p + 5))}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Game stats overlay */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-20">
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-2 text-center">
                <div className="text-xl font-bold">{gameState.score}</div>
                <div className="text-xs">Score</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-blue-100 text-blue-800 rounded p-2">
                  <div className="font-semibold">Bombs</div>
                  <div>{gameState.bombsLeft}/5</div>
                </div>
                <div className="bg-red-100 text-red-800 rounded p-2">
                  <div className="font-semibold">Power</div>
                  <div>{gameState.power}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-6 right-6 z-20 space-y-2">
            <Button
              onClick={handleFireBomb}
              disabled={gameState.bombsLeft <= 0}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <Bomb className="w-5 h-5" />
              Fire! ({gameState.bombsLeft})
            </Button>
            <Button
              onClick={handleResetGame}
              variant="outline"
              className="bg-white/90 hover:bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </Button>
          </div>

          {/* How to play overlay replaced with joystick */}
          <div className="absolute top-4 left-4 z-20">
            <RadialJoystick
              angle={gameState.angle}
              power={gameState.power}
              setAngle={gameState.setAngle}
              setPower={gameState.setPower}
              minPower={10}
              maxPower={100}
              size={200}
              onFire={handleFireBomb}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
