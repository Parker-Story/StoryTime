'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_MAP = {
  sm: 'w-3 h-3',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

function Star({
  fill,
  size,
}: {
  fill: 'empty' | 'half' | 'full'
  size: 'sm' | 'md' | 'lg'
}) {
  const sizeClass = SIZE_MAP[size]
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(sizeClass, 'flex-shrink-0')}
      aria-hidden
    >
      <defs>
        <linearGradient id={`half-${fill}`}>
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {fill === 'full' && (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      )}
      {fill === 'half' && (
        <>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <clipPath id="half-clip">
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="currentColor"
            clipPath="url(#half-clip)"
          />
        </>
      )}
      {fill === 'empty' && (
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const displayValue = hoverValue ?? value

  function getStarFill(starIndex: number): 'empty' | 'half' | 'full' {
    const full = starIndex + 1
    const half = starIndex + 0.5
    if (displayValue >= full) return 'full'
    if (displayValue >= half) return 'half'
    return 'empty'
  }

  function getValueFromMouse(e: React.MouseEvent, starIndex: number): number {
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const isRightHalf = x > rect.width / 2
    return isRightHalf ? starIndex + 1 : starIndex + 0.5
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (readOnly || !onChange) return
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(Math.min(5, value + 0.5))
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(Math.max(0, value - 0.5))
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex items-center gap-0.5',
        !readOnly && 'cursor-pointer select-none',
        readOnly && 'text-yellow-400',
        !readOnly && 'text-yellow-400',
        className
      )}
      onMouseLeave={() => !readOnly && setHoverValue(null)}
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? -1 : 0}
      role={readOnly ? 'img' : 'slider'}
      aria-label={`Rating: ${value} out of 5 stars`}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={5}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          onMouseMove={(e) => {
            if (!readOnly) setHoverValue(getValueFromMouse(e, i))
          }}
          onClick={(e) => {
            if (!readOnly && onChange) {
              const newValue = getValueFromMouse(e, i)
              // Toggle off if clicking the same value
              onChange(newValue === value ? 0 : newValue)
            }
          }}
        >
          <Star fill={getStarFill(i)} size={size} />
        </div>
      ))}
    </div>
  )
}

export function StarDisplay({
  value,
  size = 'sm',
  className,
}: {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <StarRating value={value} readOnly size={size} className={className} />
  )
}
