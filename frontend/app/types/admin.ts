import type { Criterion } from '~/types/catalog'

/** Contrato de la API del panel (ver README, sección 4). */

export interface CandidateSummary {
  id: string
  asin: string
  title: string
  brand: string | null
  imageUrl: string | null
  rating: number
  reviewsCount: number
  status: 'pending' | 'approved' | 'rejected' | 'unpublished'
  agentRunId: string
  category: { slug: string; name: string }
  createdAt: string
}

export interface SheetDraft {
  summary?: string
  idealFor?: string
  notFor?: string
  pros?: string[]
  cons?: string[]
  scores?: Record<string, number>
  keySpecs?: Record<string, string>
}

export interface CandidateDetail extends Omit<CandidateSummary, 'agentRunId' | 'createdAt'> {
  referencePriceUsd: number | null
  draft: SheetDraft
  rejectionReason: string | null
  rubric: Criterion[]
}

export interface SheetPayload {
  summary: string
  idealFor: string
  notFor: string
  pros: string[]
  cons: string[]
  scores: Record<string, number>
  keySpecs: Record<string, string>
  badges: string[]
  pairedProductIds: string[]
}

export interface FieldError {
  field: string
  message: string
}
