-- Migración: agregar valor FREE al enum PlanTier
-- Ejecutar en Supabase SQL editor o con: prisma db push

ALTER TYPE "PlanTier" ADD VALUE IF NOT EXISTS 'FREE';

-- Si algún tenant no tiene suscripción pero debería tener FREE,
-- este script les asigna una automáticamente:
INSERT INTO subscriptions ("id", "tenantId", "planTier", "status", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  t.id,
  'FREE',
  'ACTIVE',
  NOW(),
  NOW()
FROM tenants t
LEFT JOIN subscriptions s ON s."tenantId" = t.id
WHERE s.id IS NULL;
