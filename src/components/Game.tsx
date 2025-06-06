
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
  const { engineRef, renderRef, recreateBuildings, removeBodiesExceptStatic, scale } = usePhysicsEngine(sceneRef);

  // Setup collision detection when engine is ready
  useEffect(() => {
    if (!engineRef.current) return;

    setupCollisionDetection(
      engineRef.current,
      gameState.destroyedBlocksRef,
      gameState.setBlocksDestroyed,
      gameState.setScore,
      scale
    );
  }, [engineRef.current, gameState, scale]);

  const handleFireBomb = () => {
    if (!engineRef.current) return;

    fireBomb(
      engineRef.current,
      renderRef,
      gameState.power,
      gameState.angle,
      gameState.bombsLeft,
      gameState.setBombsLeft,
      gameState.setGameStarted,
      scale
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
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="relative w-full max-w-6xl">
            <div 
              ref={sceneRef} 
              className="w-full border-2 border-gray-300 rounded-lg shadow-lg"
              style={{ 
                aspectRatio: '2/1', // Maintain 2:1 aspect ratio (1200:600)
                backgroundImage: 'url(/lovable-uploads/background.png)',
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
                <div className="text-gray-500 text-xs">Scale: {(scale * 100).toFixed(0)}%</div>
              </div>
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
