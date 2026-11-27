import { useRef, useState } from 'react'
import type { FormEvent, MouseEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { ArrowRight, MapPin, Search, Sparkles } from 'lucide-react'

export type SearchValues = {
  niche: string
  location: string
}

type SearchBarProps = {
  onSearch: (values: SearchValues) => void
  scanning: boolean
}

function MagneticButton({ disabled }: { disabled: boolean }) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 240, damping: 18, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 240, damping: 18, mass: 0.4 })

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion || !buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    rawX.set((event.clientX - rect.left - rect.width / 2) * 0.18)
    rawY.set((event.clientY - rect.top - rect.height / 2) * 0.22)
  }

  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return (
    <motion.button
      ref={buttonRef}
      type="submit"
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      style={reduceMotion ? undefined : { x, y }}
      whileHover={reduceMotion ? undefined : { scale: 1.025 }}
      whileTap={reduceMotion ? undefined : { scale: 0.96 }}
      className="group relative flex h-14 w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#a855f7] to-[#ec4899] px-7 text-sm font-bold text-white shadow-[0_10px_40px_-10px_rgba(139,92,246,0.9)] transition-shadow hover:shadow-[0_14px_50px_-8px_rgba(236,72,153,0.8)] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative flex items-center gap-2">
        {disabled ? 'Escaneando...' : 'Buscar Leads'}
        {disabled ? (
          <motion.span
            animate={reduceMotion ? {} : { rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        ) : (
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        )}
      </span>
    </motion.button>
  )
}

export default function SearchBar({ onSearch, scanning }: SearchBarProps) {
  const [values, setValues] = useState<SearchValues>({ niche: '', location: '' })
  const [focused, setFocused] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (scanning) return
    onSearch(values)
  }

  return (
    <motion.form
      onSubmit={submit}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      className={`search-shell mx-auto flex w-full max-w-4xl flex-col gap-2 rounded-[28px] p-2 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full ${
        focused ? 'is-focused' : ''
      }`}
    >
      <label className="group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] px-4 py-3 transition-colors hover:bg-white/[0.04] sm:rounded-full">
        <Search className="h-5 w-5 shrink-0 text-[#a78bfa]" aria-hidden="true" />
        <span className="sr-only">Nicho ou tipo de negócio</span>
        <input
          value={values.niche}
          onChange={(event) => setValues((current) => ({ ...current, niche: event.target.value }))}
          placeholder="Nicho ou tipo de negócio"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#746997]"
          aria-label="Nicho ou tipo de negócio"
        />
      </label>

      <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

      <label className="group flex min-w-0 flex-1 items-center gap-3 rounded-[22px] px-4 py-3 transition-colors hover:bg-white/[0.04] sm:rounded-full">
        <MapPin className="h-5 w-5 shrink-0 text-[#22d3ee]" aria-hidden="true" />
        <span className="sr-only">Cidade, estado ou bairro</span>
        <input
          value={values.location}
          onChange={(event) => setValues((current) => ({ ...current, location: event.target.value }))}
          placeholder="Cidade, estado ou bairro"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-[#746997]"
          aria-label="Cidade, estado ou bairro"
        />
      </label>

      <div className="hidden h-8 w-px bg-white/10 sm:block" aria-hidden="true" />

      <MagneticButton disabled={scanning} />
    </motion.form>
  )
}
