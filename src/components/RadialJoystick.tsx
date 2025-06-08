import React, { useRef, useState } from 'react';

interface RadialJoystickProps {
  angle: number;
  power: number;
  setAngle: (angle: number) => void;
  setPower: (power: number) => void;
  minPower?: number;
  maxPower?: number;
  size?: number;
  onFire?: () => void;
}

// Helper to clamp a value
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const RadialJoystick: React.FC<RadialJoystickProps> = ({
  angle,
  power,
  setAngle,
  setPower,
  minPower = 10,
  maxPower = 100,
  size = 180,
  onFire,
}) => {
  const radius = size / 2;
  const dotRadius = 18;
  const [dragging, setDragging] = useState(false);
  const [dragAngle, setDragAngle] = useState(0); // local drag angle for dot
  const [dragPower, setDragPower] = useState(minPower); // local drag power for dot
  const svgRef = useRef<SVGSVGElement>(null);

  // Dot position uses local drag state if dragging, otherwise center
  const powerRatio = dragging ? (dragPower - minPower) / (maxPower - minPower) : 0;
  const angleRad = dragging ? (dragAngle * Math.PI) / 180 : 0;
  const dotX = radius + Math.cos(angleRad) * powerRatio * (radius - dotRadius);
  const dotY = radius - Math.sin(angleRad) * powerRatio * (radius - dotRadius);

  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    svgRef.current?.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    svgRef.current?.releasePointerCapture(e.pointerId);
    // Fire if user dragged out from center
    if (onFire && dragPower > minPower) {
      onFire();
    }
    setDragAngle(0);
    setDragPower(minPower);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging && e.type !== 'pointerdown') return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - radius;
    const dy = radius - y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angleDeg < 0) angleDeg += 360;
    const maxDist = radius - dotRadius;
    dist = clamp(dist, 0, maxDist);
    const newPower = Math.round(minPower + (dist / maxDist) * (maxPower - minPower));
    setDragAngle(angleDeg);
    setDragPower(newPower);
    setAngle(Math.round((angleDeg + 180) % 360)); // fire in opposite direction
    setPower(newPower);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className="touch-none cursor-pointer"
        style={{ display: 'block', background: 'rgba(255,255,255,0.92)', borderRadius: '50%', boxShadow: '0 2px 12px #0002' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerUp}
      >
        {/* Outer circle */}
        <circle cx={radius} cy={radius} r={radius - 2} fill="#f3f4f6" stroke="#bbb" strokeWidth={3} />
        {/* Line from center to dot */}
        <line x1={radius} y1={radius} x2={dotX} y2={dotY} stroke="#888" strokeWidth={4} />
        {/* Draggable dot */}
        <circle cx={dotX} cy={dotY} r={dotRadius} fill="#ff9800" stroke="#fff" strokeWidth={4} style={{ filter: 'drop-shadow(0 2px 6px #0003)' }} />
        {/* Center dot */}
        <circle cx={radius} cy={radius} r={8} fill="#fff" stroke="#bbb" strokeWidth={2} />
      </svg>
      <div className="mt-2 text-center text-xs font-semibold text-gray-700">
        <div>Angle: <span className="text-blue-600">{angle}°</span></div>
        <div>Power: <span className="text-orange-600">{power}%</span></div>
      </div>
    </div>
  );
}; 