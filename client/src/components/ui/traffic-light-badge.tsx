import React from "react"
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
  
  const getStatusIcon = () => {
    switch (level) {
      case 'pass':
        return '✓';
      case 'caution':
        return '⚠';
      case 'fail':
        return '✗';
      case 'na':
        return '—';
      default:
        return '';
    }
  };

  const getStatusDescription = () => {
    switch (level) {
      case 'pass':
        return 'Pass status';
      case 'caution':
        return 'Caution status';
      case 'fail':
        return 'Fail status';
      case 'na':
        return 'Not applicable';
      default:
        return 'Status';
    }
  };

  const content = (
    <Badge 
      variant={variant}
      aria-label={`${label}: ${getStatusDescription()}`}
    >
      <span className="mr-1" aria-hidden="true">{getStatusIcon()}</span>
      {label}
    </Badge>
  )
  
  if (!tooltip) return content
  return <Tooltip content={tooltip}>{content}</Tooltip>
}



