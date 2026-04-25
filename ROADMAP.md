# Roadmap — Consultora SaaS

## Producción (MVP actual → cloud)

> Tiempo estimado: **2 semanas**

- [ ] Migrar almacenamiento de archivos a S3 / Cloudflare R2
- [ ] Configurar base de datos PostgreSQL gestionada (Neon / Railway / Supabase)
- [ ] Variables de entorno de producción (`AUTH_SECRET`, `DATABASE_URL`, etc.)
- [ ] Deploy en Vercel o Railway
- [ ] Dominio propio + SSL
- [ ] CI/CD básico (GitHub Actions)
- [ ] Backups automáticos de base de datos

---

## Crítico antes de vender

- [ ] Recuperación de contraseña por email
- [ ] Onboarding: formulario de registro para nuevas consultoras
- [ ] Paginación en listas (empresas, servicios, documentos, usuarios)

---

## Importante para operar

- [ ] Notificaciones por email (nuevo documento, cambio de estado, nuevo usuario)
- [ ] Editar y desactivar usuarios
- [ ] Filtros y búsqueda en todas las listas
- [ ] Panel de administración de tenants (ver/gestionar todas las consultoras)
- [ ] Eliminar empresas y servicios

---

## Mejoras de producto

- [ ] Logs de auditoría (quién hizo qué y cuándo)
- [ ] Exportar reportes (PDF / Excel)
- [ ] Comentarios o notas internas en servicios
- [ ] Hitos o subtareas dentro de un servicio
- [ ] Personalización de marca por tenant (logo, colores)

---

## Fuera del alcance (no incluido)

- App móvil nativa
- Login con Google / OAuth
- Sistema de facturación o cobros
- Autenticación de dos factores (2FA)
- API pública para integraciones
- Notificaciones en tiempo real (websockets)
- SSO / SAML

---

## Infraestructura estimada (producción)

| Servicio | Opción sugerida | Costo/mes |
|----------|----------------|-----------|
| Hosting app | Vercel Pro o Railway | USD 20–40 |
| Base de datos | Neon o Railway PostgreSQL | USD 15–25 |
| Archivos | Cloudflare R2 | USD 0–5 |
| Dominio | — | USD 1–2 |
| **Total** | | **~USD 36–72** |
