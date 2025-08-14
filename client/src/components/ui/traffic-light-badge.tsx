import * as React from "react"
import { Badge } from "./badge"
import { Tooltip } from "./tooltip"

export type TrafficLevel = 'pass' | 'caution' | 'fail' | 'na'

interface TrafficLightBadgeProps {
  label: string
  level: TrafficLevel
  tooltip?: string
}

export function TrafficLightBadge({ label, level, tooltip }: TrafficLightBadgeProps) {
  const variant = level === 'pass' ? 'success' : level === 'caution' ? 'warning' : level === 'fail' ? 'destructive' : 'muted'
  const content = <Badge variant={variant}>{label}</Badge>
  if (!tooltip) return content
  return <Tooltip content={tooltip}>{content}</Tooltip>
}



