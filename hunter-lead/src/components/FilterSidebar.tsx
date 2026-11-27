import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, SlidersHorizontal, Sparkles } from 'lucide-react'

export type Filters = {
  onlyNoSite: boolean
  onlyNoInstagram: boolean
  hasWhatsapp: boolean
  highOpportunity: boolean
}

export type FilterKey = keyof Filters

type FilterSidebarProps = {
  filters: Filters
  counts: Record<FilterKey, number>
  total: number
  onToggle: (key: FilterKey) => void
}

const filterItems: Array<{ key: FilterKey; label: string; hint: string }> = [
  { key: 'onlyNoSite', label: 'Apenas sem site', hint: 'Domínio ausente no Google' },
  { key: 'onlyNoInstagram', label: 'Apenas sem Instagram', hint: 'Sem link no perfil' },
  { key: 'hasWhatsapp', label: 'Possui WhatsApp', hint: 'Telefone visível no Maps' },
  { key: 'highOpportunity', label: 'Alta oportunidade', hint: 'Sem site e bem avaliado' },
]

export default function FilterSidebar({ filters, counts, total, onToggle }: FilterSidebarProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.aside
      layout
      aria-label="Filtros de leads"
      className="glass-card h-fit rounded-[24px] p-5 lg:sticky lg:top-6"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-[#a78bfa]" aria-hidden="true" />
          <h2 className="text-sm font-semibold tracking-wide text-white">Filtros</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#b9aed6]">
          {total} no radar
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {filterItems.map((item, index) => {
          const checked = filters[item.key]
          return (
            <motion.button
              key={item.key}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggle(item.key)}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.35 }}
              whileHover={reduceMotion ? undefined : { x: 3 }}
              whileTap={reduceMotion ? undefined : { scale: 0.985 }}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                checked
                  ? 'border-[#8B5CF6]/35 bg-[#8B5CF6]/[0.09]'
                  : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15'
              }`}
            >
              <motion.span
                animate={checked ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.32 }}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                  checked
                    ? 'border-[#a78bfa] bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] shadow-[0_0_14px_rgba(139,92,246,0.55)]'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <AnimatePresence initial={false}>
                  {checked && (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.18 }}
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-[#efe9ff]">{item.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-[#867aa5]">{item.hint}</span>
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-[#a78bfa]">
                {counts[item.key]}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/[0.06] p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#34d399]" aria-hidden="true" />
        <p className="text-[11px] leading-relaxed text-[#a7d9c6]">
          Leads com maior chance de fechar aparecem primeiro. Priorize quem já tem avaliações no Google.
        </p>
      </div>
    </motion.aside>
  )
}
