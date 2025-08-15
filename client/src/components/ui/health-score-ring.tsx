import React from "react"
import { Tooltip } from "./tooltip"

interface HealthScoreRingProps {
  score: number // 0-100
  size?: number // px
  stroke?: number // px
  tooltip?: string
}

export function HealthScoreRing({ score, size = 88, stroke = 10, tooltip }: HealthScoreRingProps) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const offset = circumference - (clamped / 100) * circumference
  const colorClass = clamped >= 80 ? 'text-green-600' : clamped >= 60 ? 'text-yellow-600' : 'text-red-600'

  const getHealthStatus = () => {
    if (clamped >= 80) return 'Good health';
    if (clamped >= 60) return 'Moderate health';
    return 'Poor health';
  };

  const getHealthIcon = () => {
    if (clamped >= 80) return '✓';
    if (clamped >= 60) return '⚠';
    return '✗';
  };

  const ring = (
    <div 
      className="inline-flex items-center justify-center" 
      aria-label={`Health score: ${clamped} out of 100. ${getHealthStatus()}`}
      role="img"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="stroke-[hsl(var(--secondary))]/30"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`stroke-current ${colorClass}`}
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={size * 0.28}
          fontWeight={700}
          className={colorClass}
        >
          {clamped}
        </text>
      </svg>
      <span className="ml-2 text-sm font-medium text-muted-foreground" aria-hidden="true">
        {getHealthIcon()}
      </span>
    </div>
  )

  if (!tooltip) return ring
  return <Tooltip content={tooltip}>{ring}</Tooltip>
}


