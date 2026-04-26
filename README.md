## Acceso al sistema

Al ingresar a `http://localhost:3000` serás redirigido al login. El seed cargó tres usuarios de prueba:

c
---

## Cómo usar el sistema

### Panel de la consultora (Super Admin / RRHH)

Después de iniciar sesión como admin o RRHH, verás el panel principal con un menú lateral.

#### Dashboard

Muestra un resumen con:
- Total de empresas clientes registradas
- Total de servicios
- Servicios en proceso
- Servicios finalizados
- Tabla de los últimos servicios actualizados

#### Empresas

1. Ir a **Empresas** en el menú lateral
2. Clic en **+ Nueva empresa**
3. Completar el formulario (nombre, RUT, email, contacto, etc.)
4. Guardar

Desde el detalle de cada empresa podés ver todos sus servicios y crear nuevos.

#### Servicios

1. Ir a **Servicios** en el menú lateral
2. Clic en **+ Nuevo servicio**
3. Elegir la empresa cliente, nombre, descripción y fechas
4. Guardar

Desde el detalle de un servicio podés:
- Ver el progreso actual (barra de progreso)
- **Actualizar el estado** (Pendiente / En Proceso / Finalizado)
- **Actualizar el porcentaje** de avance (0 a 100)
- **Subir documentos** asociados al servicio
- **Descargar documentos** existentes

##### Estados disponibles para un servicio

| Estado | Descripción |
|--------|-------------|
| Pendiente | El trabajo aún no comenzó |
| En Proceso | Trabajo en curso |
| Finalizado | Servicio completado |

#### Documentos

La sección **Documentos** muestra todos los archivos subidos en el sistema, con filtro por servicio y empresa. Desde ahí podés descargar cualquier documento.

Para **subir un documento**:
1. Ir al detalle de un servicio (`/services/[id]`)
2. En la sección "Documentos", completar nombre y seleccionar el archivo
3. Clic en **↑ Subir documento**

El sistema guarda el archivo en la carpeta `/uploads/{tenantId}/` y registra la versión automáticamente.

#### Gestión de Personas — Empleados

La sección **Empleados** (`/employees`) permite administrar el legajo digital de cada persona.

##### Listado de empleados

La tabla muestra por fila: nombre, cargo, departamento, empresa, a quién reporta, fecha de ingreso y estado (activo/inactivo). Hacer clic en cualquier fila navega al perfil completo del empleado.

##### Perfil del empleado

El perfil (`/employees/[id]`) centraliza toda la información en un solo lugar:

- **Datos personales**: DNI/RUT, fecha de nacimiento, lugar de residencia, género, correo laboral, correo personal, teléfono, cargo, departamento y fecha de ingreso.
- **Jerarquía**: muestra a quién reporta el empleado, con link directo al perfil del superior.
- **Avatar**: inicial del nombre con overlay para edición de foto.
- **Estado**: badge de Activo / Inactivo editable.

##### Pestaña de Objetivos (Performance)

Desde el perfil, la sección **Objetivos** permite gestionar metas individuales:

| Acción | Descripción |
|--------|-------------|
| Crear objetivo | Nombre, fecha de inicio y fecha de fin |
| Cambiar estado | Activo → Cerrado → Archivado |
| Eliminar | Borrado permanente con confirmación |
| Filtrar | Vista por estado (Activo / Cerrado / Archivado) |

Las pestañas **Evaluación de desempeño** y **Planes de desarrollo** están disponibles como estructura base para futuras extensiones.

##### Documentos del empleado

Cada empleado tiene su propio gestor de archivos independiente del módulo de servicios:

- Subir archivos desde el perfil (PDF, imágenes, Word, Excel, etc.)
- Ver nombre, tamaño y fecha de carga con ícono según tipo de archivo
- Descargar o eliminar cualquier documento
- Los archivos se guardan en `/uploads/{tenantId}/employees/`

##### Formulario de edición

El formulario (`/employees/[id]/edit`) incluye los siguientes campos adicionales respecto a la versión anterior:

- Correo personal
- Fecha de nacimiento
- Lugar de residencia
- Género (Masculino / Femenino / No binario / Prefiero no decir)

#### Usuarios (solo Super Admin)

1. Ir a **Usuarios** en el menú lateral
2. Clic en **+ Nuevo usuario**
3. Completar nombre, email, contraseña y asignar rol
4. Si el rol es **Cliente**, asignar la empresa correspondiente

---

### Portal del cliente

Los usuarios con rol **Cliente** ven una interfaz simplificada al iniciar sesión.

El portal muestra:
- Resumen de servicios de su empresa (pendientes, en proceso, finalizados)
- Lista de todos los servicios con estado y progreso
- Detalle de cada servicio con descripción y fechas
- Documentos disponibles para descargar

El cliente **no puede** crear ni editar ningún dato. Solo consulta y descarga.

---

## Flujo de trabajo típico

```
1. Admin crea una empresa cliente
      ↓
2. Admin crea un usuario con rol Cliente y lo asigna a esa empresa
      ↓
3. RRHH crea un servicio para esa empresa
      ↓
4. RRHH actualiza el estado y progreso del servicio a medida que avanza
      ↓
5. RRHH sube documentos al servicio (propuestas, informes, contratos)
      ↓
6. Cliente ingresa a su portal y puede ver el progreso y descargar los documentos
```

---

## Comandos útiles

```bash
# Desarrollo
npm run dev              # inicia el servidor en localhost:3000

# Base de datos
npm run db:studio        # abre Prisma Studio (interfaz visual de la BD)
npm run db:seed          # recarga los datos de prueba
npm run db:reset         # borra todo y vuelve a crear con datos de prueba

# Docker
npm run docker:up        # inicia PostgreSQL
npm run docker:down      # detiene PostgreSQL
npm run docker:logs      # muestra los logs de la BD
```

### Prisma Studio

Si querés explorar la base de datos visualmente:

```bash
npm run db:studio
# Abre http://localhost:5555
```

---

## Estructura del proyecto

```
consultora-saas/
├── docker-compose.yml          # Contenedor PostgreSQL
├── .env.local                  # Variables de entorno (local)
├── prisma/
│   ├── schema.prisma           # Modelo de datos
│   └── seed.ts                 # Datos iniciales de prueba
├── middleware.ts               # Protección de rutas por rol
├── uploads/                    # Archivos subidos (generado automáticamente)
└── src/
    ├── app/
    │   ├── (auth)/login/           # Página de login
    │   ├── (dashboard)/            # Panel consultora
    │   │   ├── dashboard/          # Dashboard principal
    │   │   ├── companies/          # Gestión de empresas
    │   │   ├── services/           # Gestión de servicios
    │   │   ├── documents/          # Listado de documentos
    │   │   ├── employees/          # Gestión de personas
    │   │   │   ├── page.tsx        # Listado de empleados
    │   │   │   └── [id]/
    │   │   │       ├── page.tsx    # Perfil del empleado
    │   │   │       └── edit/       # Edición del empleado
    │   │   └── users/              # Gestión de usuarios
    │   ├── (portal)/portal/        # Portal del cliente
    │   └── api/
    │       ├── employees/[id]/
    │       │   ├── route.ts        # CRUD del empleado
    │       │   ├── goals/          # Objetivos (CRUD + cambio de estado)
    │       │   └── documents/      # Documentos (subida, descarga, borrado)
    │       └── ...                 # Resto de endpoints REST
    ├── components/
    │   ├── employees/
    │   │   ├── employees-table.tsx     # Tabla de empleados (client component)
    │   │   ├── employee-form.tsx       # Formulario de alta/edición
    │   │   ├── employee-doc-manager.tsx# Gestor de archivos del empleado
    │   │   └── performance-tabs.tsx    # Objetivos y desempeño
    │   └── ...                         # Otros componentes reutilizables
    ├── lib/
    │   ├── auth.ts             # Configuración de autenticación
    │   ├── db.ts               # Cliente de base de datos
    │   ├── validations.ts      # Validación de formularios (Zod)
    │   └── utils.ts            # Funciones utilitarias
    └── types/                  # Tipos TypeScript
```

---

## Modelo de datos

```
Tenant (consultora)
  └── Users (admin, RRHH, clientes)
  └── Companies (empresas clientes)
        ├── Services (servicios contratados)
        │     └── Documents (archivos del servicio)
        └── Employees (empleados)
              ├── Employee → reportsTo → Employee   (jerarquía)
              ├── EmployeeGoal (objetivos: ACTIVE | CLOSED | ARCHIVED)
              └── EmployeeDocument (archivos del legajo)
```

Todas las tablas incluyen `tenant_id`, lo que garantiza que cada consultora solo ve sus propios datos.

---

## Solución de problemas comunes

**"Cannot connect to database"**
```bash
docker compose up -d
# Esperar 5 segundos y volver a intentar
```

**"Prisma client not generated"**
```bash
npm run db:generate
```

**"Table does not exist"**
```bash
npm run db:push
```

**Quiero empezar desde cero**
```bash
npm run db:reset
# Esto borra todos los datos y recarga el seed
```

**Puerto 5432 ya en uso**
```bash
# Ver qué proceso usa ese puerto
sudo lsof -i :5432
# O cambiar el puerto en docker-compose.yml:
#   ports:
#     - '5433:5432'
# Y actualizar DATABASE_URL en .env.local con el nuevo puerto
```

---

## Preparación para producción

Cuando estés listo para llevar el sistema a producción:

1. **Base de datos**: reemplazar `DATABASE_URL` en las variables de entorno por una URL de PostgreSQL gestionado (Railway, Supabase, RDS).

2. **Clave secreta**: generar una nueva `AUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

3. **Almacenamiento de archivos**: reemplazar la función `getUploadDir()` en `src/lib/utils.ts` por un cliente de AWS S3 o similar.

4. **Variables de entorno**: configurar `NEXT_PUBLIC_APP_URL` con el dominio real.

5. **Deploy**: el proyecto es compatible con Railway, Vercel (solo sin uploads locales), o cualquier VPS con Node.js.
