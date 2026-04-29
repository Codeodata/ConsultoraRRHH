import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export const mpPreApproval = new PreApproval(mpClient)

export const BILLING_PLANS = {
  STARTER: {
    tier: 'STARTER' as const,
    name: 'Starter',
    description: 'Hasta 5 empresas · 8 usuarios',
    price: 90000,
    currency: 'ARS',
    maxCompanies: 5 as number,
    maxUsers: 8 as number | null,
    features: [
      '5 empresas cliente',
      '8 usuarios',
      'Gestión de servicios',
      'Documentos ilimitados',
      'Portal cliente',
    ],
  },
  PRO: {
    tier: 'PRO' as const,
    name: 'Pro',
    description: 'Hasta 20 empresas · 25 usuarios',
    price: 140000,
    currency: 'ARS',
    maxCompanies: 20 as number,
    maxUsers: 25 as number | null,
    features: [
      '20 empresas cliente',
      '25 usuarios',
      'Gestión de servicios',
      'Documentos ilimitados',
      'Portal cliente',
      'Módulo de empleados',
      'Organigrama',
    ],
  },
  BUSINESS: {
    tier: 'BUSINESS' as const,
    name: 'Business',
    description: 'Hasta 60 empresas · usuarios ilimitados',
    price: 190000,
    currency: 'ARS',
    maxCompanies: 60 as number,
    maxUsers: null as number | null,
    features: [
      '60 empresas cliente',
      'Usuarios ilimitados',
      'Gestión de servicios',
      'Documentos ilimitados',
      'Portal cliente',
      'Módulo de empleados',
      'Organigrama',
      'Soporte prioritario',
    ],
  },
} as const

export type PlanTierKey = keyof typeof BILLING_PLANS

export function mapMpStatus(mpStatus: string): 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED' {
  switch (mpStatus) {
    case 'authorized': return 'ACTIVE'
    case 'paused': return 'PAUSED'
    case 'cancelled':
    case 'expired': return 'CANCELLED'
    default: return 'PAST_DUE'
  }
}

export function formatARS(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
