export type InstagramStatus = 'active' | 'outdated' | 'none'
export type Opportunity = 'Alta' | 'Média'

export interface Lead {
  id: string
  name: string
  category: string
  niche: string
  city: string
  state: string
  neighborhood: string
  rating: number
  reviews: number
  hasSite: boolean
  instagram: InstagramStatus
  instagramHandle?: string
  whatsapp: string
  phoneLabel: string
  opportunity: Opportunity
  newlyOpened: boolean
  monthsOpen: number
  note: string
  sourceUrl?: string
  website?: string
}

export type LeadFilters = {
  onlyNoSite: boolean
  onlyNoInstagram: boolean
  hasWhatsapp: boolean
  highOpportunity: boolean
}

export const defaultFilters: LeadFilters = {
  onlyNoSite: false,
  onlyNoInstagram: false,
  hasWhatsapp: false,
  highOpportunity: false,
}
