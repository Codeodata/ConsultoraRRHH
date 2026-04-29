# Guía de despliegue: Supabase + Vercel

## Cambios realizados en el código

- `prisma/schema.prisma` — agregado `directUrl` para Supabase + Vercel (connection pooling)
- `src/lib/storage.ts` — nuevo módulo que usa Supabase Storage en lugar del disco local
- `src/app/api/upload/route.ts` — migrado de filesystem a Supabase Storage
- `src/app/api/employees/[id]/documents/route.ts` — ídem
- `src/app/api/employees/[id]/documents/[docId]/download/route.ts` — redirige a URL pública de Supabase
- `src/app/api/documents/[id]/download/route.ts` — ídem

---

## 1. Configurar Supabase

### a) Crear proyecto

Ir a [supabase.com](https://supabase.com) → New Project.

### b) Crear bucket de Storage

- Ir a **Storage** → New Bucket
- Nombre: `documents`
- **Public bucket**: activado (para que los links de descarga funcionen)

### c) Obtener credenciales

Ir a **Settings → API**:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secret) |

### d) Obtener URLs de base de datos

Ir a **Settings → Database → Connection string**:

| Variable | Fuente |
|---|---|
| `DATABASE_URL` | **Transaction pooler** — agregar `?pgbouncer=true` al final |
| `DIRECT_URL` | **Direct connection** |

### e) Correr la migración

Desde tu máquina local, con las variables de producción:

```bash
DIRECT_URL="postgresql://postgres:..." \
DATABASE_URL="postgresql://postgres.xxx:...?pgbouncer=true" \
npx prisma db push
```

Si necesitás el seed inicial (primer tenant/admin):

```bash
DIRECT_URL="postgresql://postgres:..." \
DATABASE_URL="postgresql://postgres.xxx:...?pgbouncer=true" \
npm run db:seed
```

---

## 2. Configurar Vercel

### a) Conectar repositorio

Ir a [vercel.com](https://vercel.com) → New Project → importar el repositorio.

### b) Variables de entorno

Configurar en **Settings → Environment Variables**:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | URL del pooler de Supabase (con `?pgbouncer=true`) |
| `DIRECT_URL` | URL directa de Supabase |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://yitiwmcpvsubbaxtfhjn.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `AUTH_SECRET` | String aleatorio 32+ chars: `openssl rand -hex 32` |
| `AUTH_URL` | `https://tu-app.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | `https://tu-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `Consultora SaaS` |
| `MP_ACCESS_TOKEN` | Token de MercadoPago |
| `MP_PUBLIC_KEY` | Public key de MercadoPago |
| `MP_WEBHOOK_SECRET` | Secret del webhook de MercadoPago |
| `MAX_FILE_SIZE_MB` | `10` |

### c) Deploy

Vercel detecta Next.js automáticamente. Sin configuración adicional.

---

## 3. Post-deploy

- **Webhook de MercadoPago**: actualizar la URL en el panel de MP a:
  ```
  https://tu-app.vercel.app/api/billing/webhook
  ```
- **Dominio custom** (opcional): Settings → Domains en Vercel. Actualizar `AUTH_URL` y `NEXT_PUBLIC_APP_URL` con el dominio definitivo.
