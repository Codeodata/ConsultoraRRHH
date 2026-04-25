#!/bin/bash
set -e

echo "🚀 Configurando Consultora SaaS..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker no está instalado. Instálalo en https://docs.docker.com/get-docker/"
  exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no está instalado. Instálalo en https://nodejs.org/"
  exit 1
fi

# Copiar .env si no existe
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "✅ Archivo .env.local creado desde .env.example"
  echo "   ⚠️  Revisa y actualiza las variables de entorno"
fi

# Crear carpeta uploads
mkdir -p uploads
echo "✅ Carpeta uploads/ creada"

# Levantar PostgreSQL
echo ""
echo "🐳 Iniciando PostgreSQL con Docker..."
docker compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando PostgreSQL..."
sleep 3

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

# Generar cliente Prisma
echo ""
echo "🔧 Generando cliente Prisma..."
npm run db:generate

# Aplicar schema
echo ""
echo "🗄️  Aplicando schema de base de datos..."
npm run db:push

# Ejecutar seed
echo ""
echo "🌱 Cargando datos iniciales..."
npm run db:seed

echo ""
echo "✅ ¡Setup completado!"
echo ""
echo "Para iniciar la aplicación:"
echo "  npm run dev"
echo ""
echo "La aplicación estará disponible en: http://localhost:3000"
echo ""
echo "Credenciales de prueba:"
echo "  Admin:   admin@consultora.com / Admin1234!"
echo "  RRHH:    rrhh@consultora.com  / Rrhh1234!"
echo "  Cliente: cliente@acme.cl      / Client1234!"
