import React, { useRef, useEffect } from 'react';
import { GameUI } from './GameUI';
import { useGameState } from '../hooks/useGameState';
import { usePhysicsEngine } from '../hooks/usePhysicsEngine';
import { setupCollisionDetection } from '../utils/collisionHandler';
import { fireBomb } from '../utils/bombUtils';
import { toast } from 'sonner';
import { Engine, World, Bodies, Body } from 'matter-js';
import { audioManager } from '../utils/audioUtils';

export const Game = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const gameState = useGameState();
  const { engineRef, renderRef, recreateBuildings, removeBodiesExceptStatic } = usePhysicsEngine(sceneRef);

  // Load sounds when component mounts
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // Initialize audio context
        await audioManager.initAudioContext();
        
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
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-50 flex flex-col">
      <div className="flex-1 flex">
        <div 
          ref={sceneRef} 
          className="border-2 border-gray-300 rounded-lg shadow-lg relative"
          style={{ 
            width: '1200px',
            height: '600px',
            backgroundImage: 'url(/lovable-uploads/background.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onClick={handleBuildingDestruction}
        >
          <img 
            src="/lovable-uploads/plain_foreground.png" 
            alt="Foreground overlay"
            className="absolute bottom-0 w-full"
            style={{
              opacity: 1,
              pointerEvents: 'none'
            }}
          />
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="space-y-2 text-sm font-semibold">
            <div className="text-primary">Score: {gameState.score}</div>
            <div className="text-orange-600">Blocks Destroyed: {gameState.blocksDestroyed}</div>
            <div className="text-red-600">Bombs Left: {gameState.bombsLeft}</div>
          </div>
        </div>
        <GameUI
          power={gameState.power}
          setPower={gameState.setPower}
          angle={gameState.angle}
          setAngle={gameState.setAngle}
          onFire={handleFireBomb}
          onReset={handleResetGame}
          bombsLeft={gameState.bombsLeft}
          score={gameState.score}
        />
      </div>
    </div>
  );
};
