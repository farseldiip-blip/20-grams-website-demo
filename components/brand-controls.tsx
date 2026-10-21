'use client'

import Link from 'next/link'
import type { MouseEvent, ReactNode } from 'react'
import { useSmartNavigate } from '@/components/transition'

export type BrandButtonTone = 'primary' | 'secondary' | 'light'

type CommonProps = {
  children: ReactNode
  tone?: BrandButtonTone
  className?: string
}

function ButtonFace({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="brand-button-label">{children}</span>
      <span className="brand-button-label brand-button-label-clone" aria-hidden="true">
        {children}
      </span>
    </>
  )
}

export function BrandButton({
  children,
  tone = 'primary',
  className = '',
  onClick,
  type = 'button',
  ariaLabel,
  ariaExpanded,
  ariaControls,
  disabled,
}: CommonProps & {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit'
  ariaLabel?: string
  ariaExpanded?: boolean
  ariaControls?: string
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      disabled={disabled}
      className={`brand-button brand-button-${tone} ${className}`}
      onClick={onClick}
    >
      <ButtonFace>{children}</ButtonFace>
    </button>
  )
}

export function BrandLink({
  children,
  href,
  tone = 'primary',
  className = '',
  rel,
  target,
  ariaLabel,
  prefetch,
}: CommonProps & {
  href: string
  rel?: string
  target?: string
  ariaLabel?: string
  prefetch?: boolean
}) {
  const onNavigate = useSmartNavigate()
  return (
    <Link
      href={href}
      rel={rel}
      target={target}
      aria-label={ariaLabel}
      prefetch={prefetch}
      className={`brand-button brand-button-${tone} ${className}`}
      onClick={onNavigate}
    >
      <ButtonFace>{children}</ButtonFace>
    </Link>
  )
}
