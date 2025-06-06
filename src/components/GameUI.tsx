
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bomb, RotateCcw } from 'lucide-react';

interface GameUIProps {
  power: number;
  setPower: (power: number) => void;
  angle: number;
  setAngle: (angle: number) => void;
  onFire: () => void;
  onReset: () => void;
  bombsLeft: number;
  score: number;
}

export const GameUI: React.FC<GameUIProps> = ({
  power,
  setPower,
  angle,
  setAngle,
  onFire,
  onReset,
  bombsLeft,
  score,
}) => {
  return (
    <div className="w-80 p-4 bg-white/95 backdrop-blur-sm border-l border-gray-200">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center text-primary">
            Demolition Physics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Power</label>
              <span className="text-sm font-semibold text-orange-600">{power}%</span>
            </div>
            <Slider
              value={[power]}
              onValueChange={(value) => setPower(value[0])}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Angle</label>
              <span className="text-sm font-semibold text-blue-600">{angle}°</span>
            </div>
            <Slider
              value={[angle]}
              onValueChange={(value) => setAngle(value[0])}
              max={-10}
              min={-80}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Button
              onClick={onFire}
              disabled={bombsLeft <= 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-200 hover:scale-105"
            >
              <Bomb className="w-5 h-5 mr-2" />
              Fire Bomb! ({bombsLeft} left)
            </Button>

            <Button
              onClick={onReset}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 transition-all duration-200"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset Game
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-center">Game Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-center">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3">
              <div className="text-2xl font-bold">{score}</div>
              <div className="text-sm">Score</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-100 text-blue-800 rounded p-2">
                <div className="font-semibold">Bombs</div>
                <div>{bombsLeft}/5</div>
              </div>
              <div className="bg-red-100 text-red-800 rounded p-2">
                <div className="font-semibold">Power</div>
                <div>{power}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-xs text-gray-600 space-y-2">
        <div className="font-semibold">How to Play:</div>
        <ul className="space-y-1 text-xs">
          <li>• Adjust power and angle</li>
          <li>• Click "Fire Bomb!" to launch</li>
          <li>• Destroy blocks for points</li>
          <li>• Use physics to topple towers</li>
          <li>• Reset when out of bombs</li>
        </ul>
      </div>
    </div>
  );
};
