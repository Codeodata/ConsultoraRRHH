import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './register-form'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950">
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand-600 dark:bg-brand-700 p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white text-lg font-bold">
            C
          </div>
          <span className="text-white font-semibold text-lg">Consultora RRHH</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Empezá gratis,<br />escalá cuando quieras
            </h2>
            <p className="text-brand-200 text-base leading-relaxed max-w-sm">
              Registrá tu consultora en segundos. Sin tarjeta de crédito. Pasá a un plan pago cuando tu negocio crezca.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[
              { label: 'Plan Free', desc: '1 empresa · 15 empleados · gratis para siempre' },
              { label: 'Plan Starter', desc: '5 empresas · 8 usuarios · $90.000 ARS/mes' },
              { label: 'Plan Business', desc: '60 empresas · todo ilimitado · $190.000 ARS/mes' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-brand-200 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-brand-300 text-xs">© 2025 Consultora RRHH. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho con formulario */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-3 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white text-xl font-bold">
              C
            </div>
            <span className="text-gray-900 dark:text-zinc-50 font-semibold text-xl">Consultora RRHH</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Crear cuenta</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Comenzá con el plan Free, sin tarjeta de crédito
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm dark:shadow-none">
            <RegisterForm />
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-zinc-400">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
