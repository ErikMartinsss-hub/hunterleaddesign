import type { MouseEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { Flame, MapPin, MessageCircle, Sparkles, Star } from 'lucide-react'
import type { Lead } from '../data/lead'

type LeadCardProps = {
  lead: Lead
  index: number
  onOpen: (lead: Lead, source: 'whatsapp' | 'pitch') => void
}

export default function LeadCard({ lead, index, onOpen }: LeadCardProps) {
  const reduceMotion = useReducedMotion()
  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)
  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 20 })
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 20 })

  const handleMove = (event: MouseEvent<HTMLElement>) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    event.currentTarget.style.setProperty('--mx', `${px * 100}%`)
    event.currentTarget.style.setProperty('--my', `${py * 100}%`)
    rawRotateX.set((0.5 - py) * 6)
    rawRotateY.set((px - 0.5) * 6)
  }

  const resetTilt = () => {
    rawRotateX.set(0)
    rawRotateY.set(0)
  }

  const mapsUrl =
    lead.sourceUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lead.name}, ${lead.neighborhood}, ${lead.city} ${lead.state}`,
    )}`

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{
        duration: 0.45,
        delay: reduceMotion ? 0 : Math.min(index, 8) * 0.055,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      style={reduceMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className="lead-card group relative min-h-[292px] overflow-hidden rounded-[24px]"
    >
      <motion.span
        className="border-beam"
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
      <span className="spotlight" aria-hidden="true" />
      <span className="lead-opportunity-glow" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col gap-4 rounded-[23px] bg-[#0e091d]/95 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="mb-2 inline-flex rounded-full border border-[#8B5CF6]/25 bg-[#8B5CF6]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c4b5fd]">
              {lead.category}
            </span>
            <h3 className="truncate text-[17px] font-semibold tracking-tight text-white">{lead.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-[12px] text-[#9185ad]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{lead.neighborhood}, {lead.city} - {lead.state}</span>
            </p>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 text-right transition-colors hover:border-[#FBBF24]/40 hover:bg-[#FBBF24]/10"
            aria-label={`Ver ${lead.name} no Google Maps`}
          >
            <span className="flex items-center justify-end gap-1 text-[12px] font-bold text-[#fde68a]">
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              {lead.rating.toFixed(1)}
            </span>
            <span className="text-[9px] text-[#8d82a6]">{lead.reviews} avaliações</span>
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {!lead.hasSite && (
            <motion.span
              animate={reduceMotion ? {} : { opacity: [1, 0.72, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full border border-[#FB7185]/35 bg-[#FB7185]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#fda4af]"
            >
              Sem Site
            </motion.span>
          )}
          {lead.instagram === 'none' && (
            <span className="rounded-full border border-[#FB7185]/35 bg-[#FB7185]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#fda4af]">
              Sem Instagram
            </span>
          )}
          {lead.instagram === 'outdated' && (
            <span className="rounded-full border border-[#FBBF24]/35 bg-[#FBBF24]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#fcd34d]">
              Instagram Desatualizado
            </span>
          )}
          {lead.newlyOpened && (
            <span className="rounded-full border border-[#06B6D4]/35 bg-[#06B6D4]/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#67e8f9]">
              Novo CNPJ
            </span>
          )}
        </div>

        <p className="text-[12px] leading-relaxed text-[#a99dbe]">{lead.note}</p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3.5">
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold ${
              lead.opportunity === 'Alta' ? 'text-[#34d399]' : 'text-[#67e8f9]'
            }`}
          >
            <Flame className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            Oportunidade: {lead.opportunity}
          </span>
          <span className="text-[10px] text-[#776b91]">{lead.phoneLabel}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {lead.whatsapp ? (
            <button
              type="button"
              onClick={() => onOpen(lead, 'whatsapp')}
              className="shine-button flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-3 text-[12px] font-bold text-[#032017] shadow-[0_8px_24px_-10px_rgba(16,185,129,0.9)]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chamar no WhatsApp
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[12px] font-bold text-[#776b91]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Sem telefone visível
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpen(lead, 'pitch')}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-3 text-[12px] font-bold text-[#ddd6fe] transition-colors hover:border-[#8B5CF6]/70 hover:bg-[#8B5CF6]/20"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Gerar Pitch com IA
          </button>
        </div>
      </div>
    </motion.article>
  )
}
