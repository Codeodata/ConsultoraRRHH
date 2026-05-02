-- Migración: introducir rol OWNER y corregir defaults
-- Ejecutar con DIRECT_URL (no pooler) para ALTER TYPE

-- 1. Agregar el nuevo valor al enum (ADD VALUE no puede estar en una transacción)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OWNER';

-- 2. Migrar todos los usuarios con SUPER_ADMIN → OWNER
--    (SUPER_ADMIN queda reservado para admins internos de plataforma)
UPDATE users SET role = 'OWNER' WHERE role = 'SUPER_ADMIN';

-- 3. Corregir el default del schema de suscripciones
ALTER TABLE subscriptions ALTER COLUMN "planTier" SET DEFAULT 'FREE';
ALTER TABLE subscriptions ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- 4. Corregir el default del rol de usuario
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'RRHH';

-- Verificar resultado
SELECT role, count(*) FROM users GROUP BY role;
