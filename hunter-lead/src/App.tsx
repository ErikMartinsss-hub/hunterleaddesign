import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  Radar,
  RefreshCw,
  SearchX,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import AmbientBackground from './components/AmbientBackground'
import FilterSidebar from './components/FilterSidebar'
import type { FilterKey, Filters } from './components/FilterSidebar'
import LeadCard from './components/LeadCard'
import Logo from './components/Logo'
import PitchModal from './components/PitchModal'
import SearchBar from './components/SearchBar'
import type { SearchValues } from './components/SearchBar'
import { defaultFilters } from './data/lead'
import type { Lead } from './data/lead'
import './App.css'

type SelectedLead = {
  lead: Lead
  source: 'whatsapp' | 'pitch'
}

type SearchMeta = {
  source: string
  fetchedAt: string
  cached: boolean
  warning: string | null
}

type LiveResponse = {
  leads?: Lead[]
  source?: string
  fetchedAt?: string
  cached?: boolean
  warning?: string | null
  error?: string
}

const RESULT_LIMIT = 24
const MAX_RESULTS = 48
const SCAN_MS = 1200
const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

const normalize = (value: string) =>
  value
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

const matchesTerms = (target: string, query: string) => {
  const terms = normalize(query).split(/[\s,]+/).filter(Boolean)
  if (terms.length === 0) return true
  const haystack = normalize(target)
  return terms.every((term) => haystack.includes(term))
}

function App() {
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState<SearchValues>({ niche: '', location: '' })
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [liveLeads, setLiveLeads] = useState<Lead[]>([])
  const [meta, setMeta] = useState<SearchMeta | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [resultLimit, setResultLimit] = useState(RESULT_LIMIT)
  const [selected, setSelected] = useState<SelectedLead | null>(null)
  const requestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => requestRef.current?.abort()
  }, [])

  const handleSearch = useCallback(
    async (values: SearchValues, limit = resultLimit) => {
      const niche = values.niche.trim()
      const location = values.location.trim()

      if (!niche && !location) {
        setError('Informe um nicho ou uma cidade para consultar o Google Maps.')
        setHasSearched(true)
        return
      }

      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller
      let timedOut = false
      const timeoutId = window.setTimeout(() => {
        timedOut = true
        controller.abort()
      }, 90000)

      const startedAt = Date.now()
      setScanning(true)
      setSelected(null)
      setError(null)
      setResultLimit(limit)

      try {
        const response = await fetch(`${API_BASE}/api/search/live`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ niche, location, limit }),
          signal: controller.signal,
        })
        const data: LiveResponse = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.error || `Falha na busca (${response.status}).`)

        const minScan = reduceMotion ? 140 : SCAN_MS
        const elapsed = Date.now() - startedAt
        if (elapsed < minScan) await wait(minScan - elapsed)
        if (controller.signal.aborted) return

        setQuery({ niche, location })
        setLiveLeads(Array.isArray(data.leads) ? data.leads : [])
        setMeta({
          source: data.source || 'google-maps',
          fetchedAt: data.fetchedAt || new Date().toISOString(),
          cached: Boolean(data.cached),
          warning: data.warning || null,
        })
        setHasSearched(true)
        document.getElementById('resultados')?.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start',
        })
      } catch (caught) {
        if (controller.signal.aborted && !timedOut) return
        setQuery({ niche, location })
        setLiveLeads([])
        setMeta(null)
        setHasSearched(true)
        setError(
          timedOut
            ? 'A consulta ao Google Maps excedeu o tempo limite. Tente novamente.'
            : caught instanceof Error
              ? caught.message
              : 'Não foi possível consultar o Google Maps.',
        )
      } finally {
        window.clearTimeout(timeoutId)
        if (!controller.signal.aborted || timedOut) {
          setScanning(false)
          requestRef.current = null
        }
      }
    },
    [reduceMotion, resultLimit],
  )

  const clearSearch = () => {
    requestRef.current?.abort()
    requestRef.current = null
    setQuery({ niche: '', location: '' })
    setLiveLeads([])
    setMeta(null)
    setError(null)
    setHasSearched(false)
    setScanning(false)
    setFilters(defaultFilters)
    setResultLimit(RESULT_LIMIT)
  }

  const toggleFilter = (key: FilterKey) => {
    setFilters((current) => ({ ...current, [key]: !current[key] }))
  }

  const openModal = useCallback((lead: Lead, source: 'whatsapp' | 'pitch') => {
    setSelected({ lead, source })
  }, [])

  const closeModal = useCallback(() => setSelected(null), [])

  const baseResults = useMemo(() => {
    return liveLeads.filter((lead) => {
      const nicheMatch = matchesTerms(`${lead.niche} ${lead.category}`, query.niche)
      const locationMatch = matchesTerms(
        `${lead.neighborhood} ${lead.city} ${lead.state}`,
        query.location,
      )
      return nicheMatch && locationMatch
    })
  }, [liveLeads, query])

  const counts = useMemo<Record<FilterKey, number>>(
    () => ({
      onlyNoSite: baseResults.filter((lead) => !lead.hasSite).length,
      onlyNoInstagram: baseResults.filter((lead) => lead.instagram !== 'active').length,
      hasWhatsapp: baseResults.filter((lead) => Boolean(lead.whatsapp)).length,
      highOpportunity: baseResults.filter((lead) => lead.opportunity === 'Alta').length,
    }),
    [baseResults],
  )

  const results = useMemo(() => {
    return baseResults
      .filter((lead) => {
        if (filters.onlyNoSite && lead.hasSite) return false
        if (filters.onlyNoInstagram && lead.instagram === 'active') return false
        if (filters.hasWhatsapp && !lead.whatsapp) return false
        if (filters.highOpportunity && lead.opportunity !== 'Alta') return false
        return true
      })
      .sort((a, b) => {
        if (a.opportunity !== b.opportunity) return a.opportunity === 'Alta' ? -1 : 1
        return b.reviews - a.reviews
      })
  }, [baseResults, filters])

  const quickSearches: SearchValues[] = [
    { niche: 'Restaurantes e Pizzarias', location: 'São Paulo, SP' },
    { niche: 'Barbearia', location: 'Suzano, SP' },
    { niche: 'Clínica', location: 'Campinas, SP' },
  ]

  const updatedAt = meta
    ? new Date(meta.fetchedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <>
      <AmbientBackground />

      <div className="relative z-10 min-h-screen">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-6 sm:px-8">
          <Logo compact />
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-medium text-[#b9aed6] sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]" />
            </span>
            Radar ativo · {hasSearched ? `${liveLeads.length} leads reais` : 'Google Maps conectado'}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 pb-24 sm:px-8">
          <section className="relative isolate flex min-h-[calc(100svh-96px)] flex-col items-center justify-center overflow-hidden pb-16 pt-8 text-center">
            <div className="hero-radar-bg" aria-hidden="true" />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c4b5fd]"
            >
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Radar de oportunidades
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[64px]"
            >
              Empresas sem site.{' '}
              <span className="bg-gradient-to-r from-[#a78bfa] via-[#22d3ee] to-[#34d399] bg-clip-text text-transparent">
                Clientes para você.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-2xl text-balance text-[15px] leading-relaxed text-[#a99dbe] sm:text-base"
            >
              Encontre negócios locais no Google Maps, veja quem não tem site nem link de Instagram
              ativo e abra o WhatsApp com uma proposta pronta.
            </motion.p>

            <div className="mt-9 w-full">
              <SearchBar onSearch={handleSearch} scanning={scanning} />
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              <span className="mr-1 text-[11px] text-[#776b91]">Buscas rápidas:</span>
              {quickSearches.map((item) => (
                <button
                  key={`${item.niche}-${item.location}`}
                  type="button"
                  onClick={() => handleSearch(item, RESULT_LIMIT)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-[#b9aed6] transition-colors hover:border-[#8B5CF6]/50 hover:text-white"
                >
                  {item.niche} em {item.location.split(',')[0]}
                </button>
              ))}
            </motion.div>
          </section>

          <section id="resultados" className="scroll-mt-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.45 }}
              className="mb-6 flex flex-wrap items-end justify-between gap-4"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Leads encontrados</h2>
                <p className="mt-1.5 text-[13px] text-[#9185ad]">
                  {hasSearched
                    ? `Google Maps · ${[query.niche, query.location].filter(Boolean).join(' · ') || 'busca ampla'}`
                    : 'Faça uma busca para carregar empresas reais do Google Maps'}
                </p>
                {meta && (
                  <p className="mt-1 text-[11px] text-[#776b91]">
                    Fonte: {meta.source === 'google-maps' ? 'Google Maps' : meta.source} ·{' '}
                    {updatedAt}
                    {meta.cached ? ' · cache recente' : ''}
                  </p>
                )}
                {meta?.warning && (
                  <p role="status" className="mt-1 text-[11px] text-[#fcd34d]">
                    {meta.warning}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
                <TrendingUp className="h-4 w-4 text-[#34d399]" aria-hidden="true" />
                <span className="text-[13px] font-bold text-white">{results.length}</span>
                <span className="text-[12px] text-[#9185ad]">
                  lead{results.length === 1 ? '' : 's'} no radar
                  {results.length !== baseResults.length && ` de ${baseResults.length}`}
                </span>
              </div>
            </motion.div>

            <div className="grid gap-5 lg:grid-cols-[268px_minmax(0,1fr)]">
              <FilterSidebar
                filters={filters}
                counts={counts}
                total={baseResults.length}
                onToggle={toggleFilter}
              />

              <div className="min-w-0">
                <AnimatePresence mode="wait">
                  {scanning ? (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="glass-card grid min-h-[340px] place-items-center rounded-[24px] p-10 text-center"
                    >
                      <div>
                        <div className="relative mx-auto grid h-24 w-24 place-items-center">
                          <motion.span
                            className="absolute inset-0 rounded-full border border-[#8B5CF6]/40 border-t-[#a78bfa]"
                            animate={reduceMotion ? {} : { rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          <motion.span
                            className="absolute inset-3 rounded-full border border-dashed border-[#06B6D4]/40 border-t-[#22d3ee]"
                            animate={reduceMotion ? {} : { rotate: -360 }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                          />
                          <Radar className="h-8 w-8 text-[#c4b5fd]" aria-hidden="true" />
                        </div>
                        <p className="mt-5 text-sm font-bold text-white">Consultando o Google Maps...</p>
                        <p className="mt-1.5 text-[12px] text-[#9185ad]">
                          Coletando fichas, telefone, site e avaliações reais.
                        </p>
                      </div>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="glass-card grid min-h-[340px] place-items-center rounded-[24px] p-10 text-center"
                    >
                      <div>
                        <AlertCircle className="mx-auto h-10 w-10 text-[#fda4af]" aria-hidden="true" />
                        <p className="mt-4 text-sm font-bold text-white">Não foi possível buscar</p>
                        <p className="mt-1.5 text-[12px] text-[#9185ad]">{error}</p>
                        <button
                          type="button"
                          onClick={() => handleSearch(query)}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-4 text-[12px] font-bold text-[#ddd6fe] transition-colors hover:bg-[#8B5CF6]/20"
                        >
                          <RefreshCw className="h-4 w-4" aria-hidden="true" />
                          Tentar novamente
                        </button>
                      </div>
                    </motion.div>
                  ) : !hasSearched ? (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="glass-card grid min-h-[340px] place-items-center rounded-[24px] p-10 text-center"
                    >
                      <div>
                        <Radar className="mx-auto h-10 w-10 text-[#a78bfa]" aria-hidden="true" />
                        <p className="mt-4 text-sm font-bold text-white">Radar pronto para escanear</p>
                        <p className="mt-1.5 text-[12px] text-[#9185ad]">
                          Digite um nicho e uma cidade. Os leads vêm do Google Maps, sem base fictícia.
                        </p>
                      </div>
                    </motion.div>
                  ) : results.length > 0 ? (
                    <motion.div
                      key="results"
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                          {results.map((lead, index) => (
                            <LeadCard key={lead.id} lead={lead} index={index} onOpen={openModal} />
                          ))}
                        </AnimatePresence>
                      </div>
                      {resultLimit < MAX_RESULTS && (
                        <div className="mt-6 flex justify-center">
                          <button
                            type="button"
                            onClick={() => handleSearch(query, MAX_RESULTS)}
                            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#06B6D4]/35 bg-[#06B6D4]/10 px-5 text-[12px] font-bold text-[#a5f3fc] transition-colors hover:bg-[#06B6D4]/20"
                          >
                            Buscar mais no Google
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="glass-card grid min-h-[340px] place-items-center rounded-[24px] p-10 text-center"
                    >
                      <div>
                        <SearchX className="mx-auto h-10 w-10 text-[#7c6f9b]" aria-hidden="true" />
                        <p className="mt-4 text-sm font-bold text-white">Nenhum lead neste filtro</p>
                        <p className="mt-1.5 text-[12px] text-[#9185ad]">
                          Tire um filtro ou tente outro nicho e cidade.
                        </p>
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 px-4 text-[12px] font-bold text-[#ddd6fe] transition-colors hover:bg-[#8B5CF6]/20"
                        >
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          Limpar busca e filtros
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6 text-[11px] text-[#776b91]">
            <span>Design Hunter Lead · prospecção local com sinais reais de oportunidade.</span>
            <span>Dados do Google Maps · confira antes de enviar.</span>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {selected && (
          <PitchModal
            key={`${selected.lead.id}-${selected.source}`}
            lead={selected.lead}
            source={selected.source}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default App
