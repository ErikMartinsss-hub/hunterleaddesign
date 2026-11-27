import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Copy, ExternalLink, MessageCircle, Sparkles, X } from 'lucide-react'
import type { Lead } from '../data/lead'

type PitchModalProps = {
  lead: Lead
  source: 'whatsapp' | 'pitch'
  onClose: () => void
}

export default function PitchModal({ lead, source, onClose }: PitchModalProps) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const copiedTimer = useRef<number | null>(null)
  const [copied, setCopied] = useState(false)

  const sitePhrase = lead.hasSite
    ? 'a ficha do Google já mostra um site'
    : 'ainda não existe um site da empresa'

  const instagramPhrase =
    lead.instagram === 'active'
      ? 'a ficha não mostra um link de Instagram'
      : lead.instagram === 'outdated'
        ? 'seu Instagram está sem publicações recentes'
        : 'seu Instagram ainda não aparece nas buscas'

  const pitch = `Oi! Encontrei a ${lead.name} no Google Maps e vi a nota ${lead.rating.toFixed(1)} com ${lead.reviews} avaliações em ${lead.neighborhood}. Percebi que ${sitePhrase} e que ${instagramPhrase}. Isso pode fazer com que novos clientes da região tenham mais dificuldade para encontrar vocês no celular. Posso te enviar uma sugestão de página simples, com serviços, WhatsApp e mapa, pronta para o Google indexar? Sem compromisso.`

  const waUrl = lead.whatsapp
    ? `https://wa.me/${lead.whatsapp}?text=${encodeURIComponent(pitch)}`
    : ''

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusables = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
      previousFocus?.focus()
    }
  }, [onClose])

  const copyPitch = async () => {
    try {
      await navigator.clipboard.writeText(pitch)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = pitch
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setCopied(true)
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current)
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#05030c]/80 backdrop-blur-md"
      />

      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pitch-title"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card relative z-10 isolate my-auto w-full max-w-xl rounded-[28px] p-6 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] sm:p-7"
      >
        <div className="pitch-ai-bg" aria-hidden="true" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#a78bfa]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {source === 'whatsapp' ? 'Abordagem via WhatsApp' : 'Pitch gerado por IA'}
            </div>
            <h2 id="pitch-title" className="text-xl font-bold tracking-tight text-white">
              Mensagem pronta para {lead.name}
            </h2>
            <p className="mt-1.5 text-[12px] text-[#9185ad]">
              {lead.category} · {lead.neighborhood}, {lead.city}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-[#b9aed6] transition-colors hover:border-white/25 hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#090514]/80 p-4">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#e7e0f5]">{pitch}</p>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={copyPitch}
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#8B5CF6]/35 bg-[#8B5CF6]/10 px-4 text-[13px] font-bold text-[#ddd6fe] transition-colors hover:bg-[#8B5CF6]/20"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Mensagem copiada' : 'Copiar mensagem'}
          </button>
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="shine-button flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-4 text-[13px] font-bold text-[#032017]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Abrir WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[13px] font-bold text-[#776b91]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Sem telefone visível
            </button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] text-[#776b91]">
          <span>Confira os dados do Google Maps antes de enviar.</span>
          {lead.sourceUrl && (
            <a
              href={lead.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#a5f3fc] hover:underline"
            >
              Abrir ficha no Maps
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
