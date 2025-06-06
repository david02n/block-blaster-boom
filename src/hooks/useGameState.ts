
import { useState, useRef } from 'react';
import { Body } from 'matter-js';

export const useGameState = () => {
  const destroyedBlocksRef = useRef<Set<Body>>(new Set());
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(-45);
  const [score, setScore] = useState(0);
  const [blocksDestroyed, setBlocksDestroyed] = useState(0);
  const [bombsLeft, setBombsLeft] = useState(5);
  const [gameStarted, setGameStarted] = useState(false);

  const resetGameState = () => {
    setScore(0);
    setBlocksDestroyed(0);
    setBombsLeft(5);
    setGameStarted(false);
    destroyedBlocksRef.current.clear();
  };

  return {
    power,
    setPower,
    angle,
    setAngle,
    score,
    setScore,
    blocksDestroyed,
    setBlocksDestroyed,
    bombsLeft,
    setBombsLeft,
    gameStarted,
    setGameStarted,
    destroyedBlocksRef,
    resetGameState,
  };
};
