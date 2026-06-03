import { useMemo } from 'react';

/**
 * SVG Radar Chart component
 * @param {{ data: Array<{label:string, value:number, max:number, color:string}>, width?: number, height?: number }} props
 */
export default function RadarChart({ data = [], width = 280, height = 260 }) {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 36;
  const count = data.length;

  if (count === 0) return null;

  // Precompute angles
  const angles = useMemo(() => {
    return data.map((_, i) => (Math.PI * 2 * i) / count - Math.PI / 2);
  }, [count, data]);

  // Build grid polygon points
  const gridLevels = 5;
  const gridPolygons = [];
  for (let l = 1; l <= gridLevels; l++) {
    const r = (radius * l) / gridLevels;
    const pts = angles
      .map(a => `${centerX + r * Math.cos(a)},${centerY + r * Math.sin(a)}`)
      .join(' ');
    gridPolygons.push(pts);
  }

  // Build axis lines
  const axisLines = angles.map(a => ({
    x2: centerX + radius * Math.cos(a),
    y2: centerY + radius * Math.sin(a),
  }));

  // Build data polygon
  const dataPts = data
    .map((item, i) => {
      const ratio = item.value / (item.max || 5);
      return `${centerX + radius * ratio * Math.cos(angles[i])},${centerY + radius * ratio * Math.sin(angles[i])}`;
    })
    .join(' ');

  // Data points
  const dataPoints = data.map((item, i) => {
    const ratio = item.value / (item.max || 5);
    return {
      cx: centerX + radius * ratio * Math.cos(angles[i]),
      cy: centerY + radius * ratio * Math.sin(angles[i]),
      color: item.color || '#1a1a1a',
    };
  });

  // Labels
  const labels = data.map((item, i) => {
    const labelR = radius + 20;
    return {
      x: centerX + labelR * Math.cos(angles[i]),
      y: centerY + labelR * Math.sin(angles[i]),
      label: item.label,
    };
  });

  // Score labels inside
  const scoreLabels = data.map((item, i) => {
    const ratio = item.value / (item.max || 5);
    const scoreR = radius * ratio - 14;
    return {
      x: centerX + scoreR * Math.cos(angles[i]),
      y: centerY + scoreR * Math.sin(angles[i]),
      value: item.value,
      color: item.color || '#1a1a1a',
    };
  });

  return (
    <div className="flex justify-center items-center">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="能力雷达图"
        role="img"
      >
        {/* Grid */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={`grid-${i}`}
            points={pts}
            fill="none"
            stroke="#e5e5ea"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {axisLines.map((a, i) => (
          <line
            key={`axis-${i}`}
            x1={centerX}
            y1={centerY}
            x2={a.x2}
            y2={a.y2}
            stroke="#e5e5ea"
            strokeWidth="1"
          />
        ))}

        {/* Data area */}
        <polygon
          points={dataPts}
          fill="rgba(26, 26, 26, 0.12)"
          stroke="#1a1a1a"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {dataPoints.map((dp, i) => (
          <circle
            key={`dot-${i}`}
            cx={dp.cx}
            cy={dp.cy}
            r="4.5"
            fill={dp.color}
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={`label-${i}`}
            x={l.x}
            y={l.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#8e8e93"
            fontSize="11"
            fontFamily="-apple-system, sans-serif"
          >
            {l.label}
          </text>
        ))}

        {/* Score labels */}
        {scoreLabels.map((s, i) => (
          <text
            key={`score-${i}`}
            x={s.x}
            y={s.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={s.color}
            fontSize="11"
            fontWeight="700"
            fontFamily="-apple-system, sans-serif"
          >
            {s.value}
          </text>
        ))}
      </svg>
    </div>
  );
}
