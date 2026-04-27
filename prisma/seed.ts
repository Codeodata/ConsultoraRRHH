import { PrismaClient, Role, ServiceStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.tenant.findFirst()
  if (existing) {
    console.log('⏭️  Database already seeded, skipping.')
    return
  }

  console.log('🌱 Seeding database...')

  // ── 1. Tenant demo ──────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'consultora-demo' },
    update: {},
    create: {
      name: 'Consultora Demo',
      slug: 'consultora-demo',
      isActive: true,
    },
  })
  console.log(`✅ Tenant: ${tenant.name}`)

  // ── 2. Super Admin ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@consultora.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Super Admin',
      email: 'admin@consultora.com',
      password: adminPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  })
  console.log(`✅ Super Admin: ${admin.email}`)

  // ── 3. RRHH user ────────────────────────────────────────────────────────────
  const rrhhPassword = await bcrypt.hash('Rrhh1234!', 12)
  const rrhh = await prisma.user.upsert({
    where: { email: 'rrhh@consultora.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'María García',
      email: 'rrhh@consultora.com',
      password: rrhhPassword,
      role: Role.RRHH,
      isActive: true,
    },
  })
  console.log(`✅ RRHH: ${rrhh.email}`)

  // ── 4. Empresa cliente ──────────────────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { id: 'company-acme-demo' },
    update: {},
    create: {
      id: 'company-acme-demo',
      tenantId: tenant.id,
      name: 'ACME Ltda.',
      rut: '76.123.456-7',
      email: 'contacto@acme.cl',
      phone: '+56 2 2345 6789',
      address: 'Av. Providencia 1234, Santiago',
      contactName: 'Carlos Rodríguez',
      isActive: true,
    },
  })
  console.log(`✅ Company: ${company.name}`)

  // ── 5. Usuario cliente vinculado a la empresa ────────────────────────────────
  const clientPassword = await bcrypt.hash('Client1234!', 12)
  const clientUser = await prisma.user.upsert({
    where: { email: 'cliente@acme.cl' },
    update: { companyId: company.id },
    create: {
      tenantId: tenant.id,
      name: 'Carlos Rodríguez',
      email: 'cliente@acme.cl',
      password: clientPassword,
      role: Role.CLIENT,
      companyId: company.id,
      isActive: true,
    },
  })
  console.log(`✅ Client user: ${clientUser.email}`)

  // ── 6. Servicio demo ─────────────────────────────────────────────────────────
  const service = await prisma.service.upsert({
    where: { id: 'service-rrhh-demo' },
    update: {},
    create: {
      id: 'service-rrhh-demo',
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Implementación Sistema RRHH',
      description:
        'Implementación completa del módulo de Recursos Humanos incluyendo liquidaciones, control de asistencia y gestión de contratos.',
      status: ServiceStatus.IN_PROGRESS,
      progress: 45,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
    },
  })
  console.log(`✅ Service: ${service.name}`)

  // Segundo servicio
  await prisma.service.upsert({
    where: { id: 'service-contabilidad-demo' },
    update: {},
    create: {
      id: 'service-contabilidad-demo',
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Consultoría Contable Mensual',
      description: 'Servicio de consultoría contable y tributaria mensual.',
      status: ServiceStatus.COMPLETED,
      progress: 100,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
    },
  })

  // Tercer servicio
  await prisma.service.upsert({
    where: { id: 'service-legal-demo' },
    update: {},
    create: {
      id: 'service-legal-demo',
      tenantId: tenant.id,
      companyId: company.id,
      name: 'Auditoría Legal de Contratos',
      description: 'Revisión y auditoría de contratos laborales vigentes.',
      status: ServiceStatus.PENDING,
      progress: 0,
      startDate: new Date('2024-07-01'),
    },
  })
  console.log(`✅ Additional services created`)

  // ── 7. Documento demo ────────────────────────────────────────────────────────
  await prisma.document.upsert({
    where: { id: 'doc-propuesta-demo' },
    update: {},
    create: {
      id: 'doc-propuesta-demo',
      tenantId: tenant.id,
      serviceId: service.id,
      name: 'Propuesta Técnica',
      description: 'Documento de propuesta técnica inicial del proyecto',
      fileName: 'propuesta_tecnica_v1.pdf',
      filePath: '/uploads/demo/propuesta_tecnica_v1.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf',
      version: 1,
    },
  })
  console.log(`✅ Document created`)

  console.log('\n🎉 Seed completed!\n')
  console.log('─────────────────────────────────────')
  console.log('Test credentials:')
  console.log('  Super Admin → admin@consultora.com / Admin1234!')
  console.log('  RRHH        → rrhh@consultora.com  / Rrhh1234!')
  console.log('  Cliente     → cliente@acme.cl      / Client1234!')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
