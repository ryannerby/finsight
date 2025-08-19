import React, { useEffect, useRef } from "react"
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
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (circleRef.current) {
      // Animate the stroke on mount
      const circle = circleRef.current;
      circle.style.strokeDasharray = circumference.toString();
      circle.style.strokeDashoffset = circumference.toString();
      
      // Trigger animation
      setTimeout(() => {
        circle.style.strokeDashoffset = offset.toString();
      }, 100);
    }
  }, [circumference, offset])

  const ring = (
    <div className="inline-flex items-center justify-center" aria-label={`Health score ${clamped}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="stroke-[hsl(var(--secondary))]/30"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          ref={circleRef}
          className={`stroke-current ${colorClass} transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeLinecap="round"
          strokeWidth={stroke}
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
    </div>
  )

  if (!tooltip) return ring
  return <Tooltip content={tooltip}>{ring}</Tooltip>
}


