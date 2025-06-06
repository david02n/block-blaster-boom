
import React, { useRef, useEffect } from 'react';
import { GameUI } from './GameUI';
import { useGameState } from '../hooks/useGameState';
import { usePhysicsEngine } from '../hooks/usePhysicsEngine';
import { setupCollisionDetection } from '../utils/collisionHandler';
import { fireBomb } from '../utils/bombUtils';
import { toast } from 'sonner';

export const Game = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const gameState = useGameState();
  const { engineRef, renderRef, recreateBuildings, removeBodiesExceptStatic } = usePhysicsEngine(sceneRef);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-50 flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <div 
            ref={sceneRef} 
            className="w-full h-full border-2 border-gray-300 rounded-lg shadow-lg"
            style={{ 
              height: 'calc(100vh - 2rem)',
              backgroundImage: 'url(/lovable-uploads/9696d09a-d14c-4385-8c78-3bff0530ba54.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="space-y-2 text-sm font-semibold">
              <div className="text-primary">Score: {gameState.score}</div>
              <div className="text-orange-600">Blocks Destroyed: {gameState.blocksDestroyed}</div>
              <div className="text-red-600">Bombs Left: {gameState.bombsLeft}</div>
            </div>
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
