import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata: Metadata = { title: 'Iniciar Sesión' }

export default function LoginPage() {
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
              Gestión integral<br />para tu consultora
            </h2>
            <p className="text-brand-200 text-base leading-relaxed max-w-sm">
              Administra empresas, servicios y documentos en un solo lugar. Seguimiento en tiempo real para tus clientes.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Empresas', value: 'clientes' },
              { label: 'Documentos', value: 'centralizados' },
              { label: 'Progreso', value: 'en tiempo real' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-white/10 p-4">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-brand-200 text-xs mt-0.5">{item.value}</p>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-50">Bienvenido de vuelta</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Ingresa tus credenciales para continuar</p>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm dark:shadow-none">
            <LoginForm />
          </div>

          <div className="space-y-3">
            <div className="relative flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200 dark:border-zinc-800" />
              <span className="text-xs text-gray-400 dark:text-zinc-500">o</span>
              <div className="flex-1 border-t border-gray-200 dark:border-zinc-800" />
            </div>
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Crear cuenta nueva
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-zinc-500">
            Demo: <span className="font-mono">admin@consultora.com</span> / <span className="font-mono">Admin1234!</span>
          </p>
        </div>
      </div>
    </div>
  )
}
