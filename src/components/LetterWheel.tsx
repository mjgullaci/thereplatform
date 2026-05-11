import { useCallback, useMemo, useRef, useState } from 'react';

interface LetterWheelProps {
  letters: string[];
  onSubmit: (word: string) => void;
  largeText: boolean;
}

interface Position {
  x: number;
  y: number;
}

const VIEWBOX = 400;
const CENTER = VIEWBOX / 2;
const WHEEL_RADIUS = 130;
const LETTER_RADIUS = 38;

export function LetterWheel({ letters, onSubmit, largeText }: LetterWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState<number[]>([]);
  const [pointer, setPointer] = useState<Position | null>(null);
  const [tracing, setTracing] = useState(false);

  const positions = useMemo<Position[]>(() => {
    const n = letters.length;
    // Start at top (-90deg) and go clockwise.
    return letters.map((_, i) => {
      const angle = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
      return {
        x: CENTER + WHEEL_RADIUS * Math.cos(angle),
        y: CENTER + WHEEL_RADIUS * Math.sin(angle),
      };
    });
  }, [letters]);

  const screenToSvg = useCallback((clientX: number, clientY: number): Position | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const transformed = point.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  const hitTestLetter = useCallback((pos: Position): number => {
    for (let i = 0; i < positions.length; i++) {
      const p = positions[i];
      const dx = pos.x - p.x;
      const dy = pos.y - p.y;
      if (dx * dx + dy * dy <= LETTER_RADIUS * LETTER_RADIUS) {
        return i;
      }
    }
    return -1;
  }, [positions]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pos = screenToSvg(e.clientX, e.clientY);
    if (!pos) return;
    const hit = hitTestLetter(pos);
    if (hit === -1) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setPath([hit]);
    setPointer(pos);
    setTracing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!tracing) return;
    const pos = screenToSvg(e.clientX, e.clientY);
    if (!pos) return;
    setPointer(pos);
    const hit = hitTestLetter(pos);
    if (hit === -1) return;
    setPath((prev) => {
      if (prev.length === 0) return [hit];
      if (prev[prev.length - 1] === hit) return prev;
      // Allow backtrack: if you hit the previous letter, drop the last entry.
      if (prev.length >= 2 && prev[prev.length - 2] === hit) {
        return prev.slice(0, -1);
      }
      if (prev.includes(hit)) return prev;
      return [...prev, hit];
    });
  };

  const handlePointerUp = () => {
    if (!tracing) return;
    const word = path.map((i) => letters[i]).join('');
    setPath([]);
    setPointer(null);
    setTracing(false);
    if (word.length >= 3) onSubmit(word);
  };

  const inProgressWord = path.map((i) => letters[i]).join('');

  const lastPos = path.length > 0 ? positions[path[path.length - 1]] : null;

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className={`mb-3 font-display tracking-[0.3em] ${
          largeText ? 'text-3xl' : 'text-2xl'
        } text-cocoa min-h-[2.5rem]`}
        aria-live="polite"
      >
        {inProgressWord || ' '}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="w-[min(90vw,420px)] h-[min(90vw,420px)] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="application"
        aria-label="Letter wheel. Drag to trace letters and form a word."
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={WHEEL_RADIUS + LETTER_RADIUS + 14}
          fill="#f7ecd6"
          stroke="#d4a24c"
          strokeWidth={3}
        />
        {/* trace lines */}
        {path.length >= 2 && (
          <polyline
            points={path.map((i) => `${positions[i].x},${positions[i].y}`).join(' ')}
            fill="none"
            stroke="#6b8e4e"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.55}
          />
        )}
        {/* extending segment to current pointer */}
        {tracing && lastPos && pointer && (
          <line
            x1={lastPos.x}
            y1={lastPos.y}
            x2={pointer.x}
            y2={pointer.y}
            stroke="#6b8e4e"
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.35}
          />
        )}
        {positions.map((p, i) => {
          const selected = path.includes(i);
          return (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={LETTER_RADIUS}
                fill={selected ? '#6b8e4e' : '#fdf6ec'}
                stroke="#5b3a29"
                strokeWidth={3}
              />
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={36}
                fontFamily="Georgia, serif"
                fontWeight={700}
                fill={selected ? '#fdf6ec' : '#3b2a20'}
                style={{ pointerEvents: 'none' }}
              >
                {letters[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
