/**
 * Seed de demostración: 5 empresas + 100 empleados con jerarquía realista.
 * Uso: npx tsx prisma/seed-employees.ts
 * Se puede correr varias veces (idempotente).
 * Por defecto usa el primer tenant encontrado. Para apuntar a uno específico:
 *   TENANT_ID=<id> npx tsx prisma/seed-employees.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Datos de empresas ────────────────────────────────────────────────────────

const COMPANIES = [
  {
    id: 'seed-company-techsol',
    name: 'TechSol Argentina S.A.',
    rut: '30-71234567-8',
    email: 'contacto@techsol.com.ar',
    phone: '+54 11 4234-5678',
    address: 'Av. Corrientes 1540, CABA',
    contactName: 'Martín Rodríguez',
  },
  {
    id: 'seed-company-andina',
    name: 'Constructora Andina S.R.L.',
    rut: '30-68901234-5',
    email: 'info@andina.com.ar',
    phone: '+54 11 4567-8901',
    address: 'Av. San Martín 2350, Mendoza',
    contactName: 'Federico López',
  },
  {
    id: 'seed-company-patagonia',
    name: 'Distribuidora Patagonia S.A.',
    rut: '30-70123456-9',
    email: 'ventas@patagonia.com.ar',
    phone: '+54 294 442-3456',
    address: 'Ruta 40 km 2345, Neuquén',
    contactName: 'Carolina Fernández',
  },
  {
    id: 'seed-company-siba',
    name: 'Servicios Integrados BA S.A.',
    rut: '30-72345678-1',
    email: 'hola@siba.com.ar',
    phone: '+54 11 5678-9012',
    address: 'Av. del Libertador 890, Vicente López',
    contactName: 'Sebastián García',
  },
  {
    id: 'seed-company-inversur',
    name: 'Inversiones del Sur Ltda.',
    rut: '30-69012345-6',
    email: 'info@inversur.com.ar',
    phone: '+54 11 4890-1234',
    address: 'Av. Belgrano 1200, CABA',
    contactName: 'Valeria Martínez',
  },
]

// ── Nombres argentinos realistas ─────────────────────────────────────────────

const MALE_NAMES = [
  'Martín', 'Rodrigo', 'Federico', 'Lucas', 'Diego',
  'Nicolás', 'Sebastián', 'Agustín', 'Matías', 'Leandro',
  'Pablo', 'Gustavo', 'Juan', 'Carlos', 'Roberto',
  'Alejandro', 'Fernando', 'Gabriel', 'Hernán', 'Marcelo',
  'Ramiro', 'Ezequiel', 'Damián', 'Maximiliano', 'Ignacio',
]

const FEMALE_NAMES = [
  'María', 'Laura', 'Valeria', 'Cecilia', 'Romina',
  'Gabriela', 'Natalia', 'Florencia', 'Daniela', 'Carolina',
  'Sofía', 'Verónica', 'Claudia', 'Andrea', 'Patricia',
  'Silvina', 'Lucía', 'Camila', 'Micaela', 'Victoria',
  'Agustina', 'Belén', 'Mariana', 'Jimena', 'Soledad',
]

const LAST_NAMES = [
  'González', 'Rodríguez', 'Fernández', 'López', 'Martínez',
  'García', 'Pérez', 'Sánchez', 'Romero', 'Torres',
  'Álvarez', 'Díaz', 'Morales', 'Ruiz', 'Herrera',
  'Castro', 'Medina', 'Vásquez', 'Flores', 'Gómez',
  'Suárez', 'Molina', 'Acosta', 'Ortiz', 'Silva',
]

// ── Estructura por empresa (1 gerente + 4 jefes + 15 staff = 20) ─────────────

const DEPARTMENTS = [
  'Recursos Humanos',
  'Finanzas',
  'Operaciones',
  'Tecnología',
  'Ventas',
]

const POSITIONS_BY_DEPT: Record<string, { jefe: string; staff: string[] }> = {
  'Recursos Humanos': {
    jefe: 'Jefe de RRHH',
    staff: ['Analista de RRHH', 'Coordinador/a de Capacitación', 'Asistente de RRHH'],
  },
  'Finanzas': {
    jefe: 'Jefe de Finanzas',
    staff: ['Analista Contable', 'Analista de Tesorería', 'Asistente Contable'],
  },
  'Operaciones': {
    jefe: 'Jefe de Operaciones',
    staff: ['Coordinador/a Operativo/a', 'Analista de Procesos', 'Asistente Operativo/a'],
  },
  'Tecnología': {
    jefe: 'Jefe de Tecnología',
    staff: ['Desarrollador/a Senior', 'Desarrollador/a Jr.', 'Analista de Sistemas'],
  },
  'Ventas': {
    jefe: 'Jefe de Ventas',
    staff: ['Ejecutivo/a de Cuentas', 'Analista de Ventas', 'Asistente Comercial'],
  },
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length]
}

function randomDate(startYear: number, endYear: number, seed: number): Date {
  const start = new Date(startYear, 0, 1).getTime()
  const end = new Date(endYear, 11, 31).getTime()
  // Deterministic "random" using seed
  const t = start + ((seed * 2654435761) % (end - start))
  return new Date(t)
}

function buildEmployeeName(index: number): { name: string; email: string; gender: string } {
  const isFemale = index % 3 !== 0
  const firstName = isFemale
    ? pick(FEMALE_NAMES, Math.floor(index / 3))
    : pick(MALE_NAMES, Math.floor(index / 3))
  const lastName = pick(LAST_NAMES, index)
  const name = `${firstName} ${lastName}`
  const emailBase = `${firstName.toLowerCase().replace(/[áéíóú]/g, c =>
    ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] ?? c)
  )}.${lastName.toLowerCase().replace(/[áéíóú]/g, c =>
    ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }[c] ?? c)
  )}${index}`
  return { name, email: `${emailBase}@empresa.com.ar`, gender: isFemale ? 'Femenino' : 'Masculino' }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const tenantId = process.env.TENANT_ID

  const tenant = tenantId
    ? await prisma.tenant.findUnique({ where: { id: tenantId } })
    : await prisma.tenant.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!tenant) {
    console.error('❌ No se encontró ningún tenant. Registrate en la app primero.')
    process.exit(1)
  }

  console.log(`🏢 Tenant: ${tenant.name} (${tenant.id})`)

  // Verificar si ya fue sembrado
  const existingCompany = await prisma.company.findUnique({ where: { id: COMPANIES[0].id } })
  if (existingCompany) {
    console.log('⏭️  Los datos de demo ya existen. Para volver a sembrar, eliminá las empresas seed-company-* primero.')
    return
  }

  console.log('🌱 Creando empresas y empleados de demostración...\n')

  let totalEmployees = 0

  for (let ci = 0; ci < COMPANIES.length; ci++) {
    const companyData = COMPANIES[ci]

    // Crear empresa
    const company = await prisma.company.create({
      data: {
        id: companyData.id,
        tenantId: tenant.id,
        name: companyData.name,
        rut: companyData.rut,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        contactName: companyData.contactName,
        isActive: true,
      },
    })
    console.log(`✅ Empresa: ${company.name}`)

    // Gerente general (1)
    const gerenteIdx = ci * 20
    const gerente = buildEmployeeName(gerenteIdx)
    const gerenteRecord = await prisma.employee.create({
      data: {
        id: `seed-emp-${ci}-gerente`,
        tenantId: tenant.id,
        companyId: company.id,
        name: gerente.name,
        email: gerente.email,
        position: 'Gerente General',
        department: 'Dirección',
        gender: gerente.gender,
        startDate: randomDate(2018, 2021, gerenteIdx),
        isActive: true,
      },
    })
    totalEmployees++

    // 4 jefes de área + 3 staff cada uno = 4 × 4 = 16 empleados más (16 + 1 gerente = 17)
    // + 3 empleados extra en Operaciones = 20 total
    const jefesRecords: { id: string; department: string }[] = []

    for (let di = 0; di < DEPARTMENTS.length; di++) {
      const dept = DEPARTMENTS[di]
      const jefeIdx = ci * 20 + di + 1
      const jefe = buildEmployeeName(jefeIdx)
      const jefePositions = POSITIONS_BY_DEPT[dept]

      const jefeRecord = await prisma.employee.create({
        data: {
          id: `seed-emp-${ci}-jefe-${di}`,
          tenantId: tenant.id,
          companyId: company.id,
          name: jefe.name,
          email: jefe.email,
          position: jefePositions.jefe,
          department: dept,
          gender: jefe.gender,
          reportsToId: gerenteRecord.id,
          startDate: randomDate(2019, 2022, jefeIdx),
          isActive: true,
        },
      })
      jefesRecords.push({ id: jefeRecord.id, department: dept })
      totalEmployees++
    }

    // 3 staff por jefe = 15 empleados, completamos con 4 extra en el último jefe → total 20
    let staffCount = 0
    for (let di = 0; di < DEPARTMENTS.length; di++) {
      const dept = DEPARTMENTS[di]
      const jefe = jefesRecords[di]
      const positions = POSITIONS_BY_DEPT[dept].staff
      const staffPerJefe = di === DEPARTMENTS.length - 1 ? 3 : 3

      for (let si = 0; si < staffPerJefe; si++) {
        const staffIdx = ci * 20 + DEPARTMENTS.length + 1 + di * 3 + si
        const staff = buildEmployeeName(staffIdx)
        await prisma.employee.create({
          data: {
            id: `seed-emp-${ci}-staff-${di}-${si}`,
            tenantId: tenant.id,
            companyId: company.id,
            name: staff.name,
            email: staff.email,
            position: pick(positions, si),
            department: dept,
            gender: staff.gender,
            reportsToId: jefe.id,
            startDate: randomDate(2020, 2024, staffIdx),
            isActive: staffIdx % 9 !== 0, // ~11% inactivos para variedad
          },
        })
        staffCount++
        totalEmployees++
      }
    }

    console.log(`   └─ 1 gerente · 5 jefes · ${staffCount} staff (${1 + DEPARTMENTS.length + staffCount} empleados)`)
  }

  // Actualizar TenantUsage
  const companyCount = await prisma.company.count({ where: { tenantId: tenant.id, isActive: true } })
  const employeeCount = await prisma.employee.count({ where: { tenantId: tenant.id, isActive: true } })

  await prisma.tenantUsage.upsert({
    where: { tenantId: tenant.id },
    update: { companies: companyCount, employees: employeeCount },
    create: { tenantId: tenant.id, companies: companyCount, employees: employeeCount },
  })

  console.log(`\n🎉 Listo!`)
  console.log(`   ${COMPANIES.length} empresas · ${totalEmployees} empleados creados`)
  console.log(`   TenantUsage actualizado: ${companyCount} empresas activas, ${employeeCount} empleados activos`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
