'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Seamless full-bleed ticker.
 *
 * The track always holds two identical halves. Each half repeats the item group
 * often enough that it is wider than the viewport, so translating the track by
 * exactly half its width lands on an identical frame — no gaps, no jump.
 */
export function Marquee({ items }: { items: string[] }) {
  const viewport = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const [repeat, setRepeat] = useState(1)

  useEffect(() => {
    const viewportEl = viewport.current
    const groupEl = group.current
    if (!viewportEl || !groupEl) return

    const measure = () => {
      const groupWidth = groupEl.getBoundingClientRect().width
      const viewportWidth = viewportEl.clientWidth
      if (!groupWidth || !viewportWidth) return
      const needed = Math.max(1, Math.ceil(viewportWidth / groupWidth))
      setRepeat((current) => (current === needed ? current : needed))
    }

    const frame = window.requestAnimationFrame(measure)
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(viewportEl)
    observer?.observe(groupEl)

    // Web fonts change the group width after the first paint.
    if (document.fonts) {
      document.fonts.ready.then(measure).catch(() => {})
    }

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
    }
  }, [items])

  const groups = Array.from({ length: repeat * 2 }, (_, index) => index)

  return (
    <div className="marquee" ref={viewport} aria-hidden="true">
      <div className="marquee-track">
        {groups.map((index) => (
          <div className="marquee-group" key={index} ref={index === 0 ? group : undefined}>
            {items.map((word) => (
              <span key={`${index}-${word}`}>
                {word}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
