import { MercadoPagoConfig, PreApproval } from 'mercadopago'

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export const mpPreApproval = new PreApproval(mpClient)

export const BILLING_PLANS = {
  FREE: {
    tier: 'FREE' as const,
    name: 'Free',
    description: '1 empresa · 15 empleados · 2 usuarios',
    price: 0,
    currency: 'ARS',
    maxCompanies: 1 as number | null,
    maxEmployees: 15 as number | null,
    maxUsers: 2 as number | null,
    features: [
      '1 empresa cliente',
      'Hasta 15 empleados',
      '2 usuarios del sistema',
      'Gestión de servicios',
      'Portal cliente',
    ],
  },
  STARTER: {
    tier: 'STARTER' as const,
    name: 'Starter',
    description: 'Hasta 5 empresas · empleados ilimitados · 8 usuarios',
    price: 90000,
    currency: 'ARS',
    maxCompanies: 5 as number | null,
    maxEmployees: null as number | null,
    maxUsers: 8 as number | null,
    features: [
      '5 empresas cliente',
      'Empleados ilimitados',
      '8 usuarios',
      'Gestión de servicios',
      'Documentos ilimitados',
      'Portal cliente',
    ],
  },
  PRO: {
    tier: 'PRO' as const,
    name: 'Pro',
    description: 'Hasta 20 empresas · empleados ilimitados · 25 usuarios',
    price: 140000,
    currency: 'ARS',
    maxCompanies: 20 as number | null,
    maxEmployees: null as number | null,
    maxUsers: 25 as number | null,
    features: [
      '20 empresas cliente',
      'Empleados ilimitados',
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
    description: 'Hasta 60 empresas · todo ilimitado',
    price: 190000,
    currency: 'ARS',
    maxCompanies: 60 as number | null,
    maxEmployees: null as number | null,
    maxUsers: null as number | null,
    features: [
      '60 empresas cliente',
      'Empleados ilimitados',
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
