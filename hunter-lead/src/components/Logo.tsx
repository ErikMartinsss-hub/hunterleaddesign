import { motion, useReducedMotion } from 'motion/react'
import { Radar } from 'lucide-react'

type LogoProps = {
  compact?: boolean
}

export default function Logo({ compact = false }: LogoProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={`flex items-center gap-3 ${compact ? 'gap-2' : 'gap-3.5'}`}>
      <div className="relative grid h-12 w-12 shrink-0 place-items-center">
        <motion.span
          className="absolute inset-0 rounded-full border border-[#8B5CF6]/40"
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#8B5CF6] shadow-[0_0_12px_#8B5CF6]" />
        </motion.span>
        <motion.span
          className="absolute inset-[6px] rounded-full border border-dashed border-[#06B6D4]/45"
          animate={reduceMotion ? {} : { rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute inset-[12px] rounded-full bg-[#8B5CF6]/15 blur-[6px]"
          animate={reduceMotion ? {} : { scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Radar className="relative h-5 w-5 text-[#c4b5fd]" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="leading-none">
        <div className={`font-bold tracking-[0.22em] text-white ${compact ? 'text-[13px]' : 'text-[15px] sm:text-lg'}`}>
          DESIGN <span className="text-[#a78bfa]">HUNTER</span> LEAD
        </div>
        {!compact && (
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.32em] text-[#7c6f9b]">
            Inteligência local de prospecção
          </div>
        )}
      </div>
    </div>
  )
}
