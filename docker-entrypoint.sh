#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push

echo "Seeding database..."
npx tsx prisma/seed.ts

echo "Starting server..."
exec node_modules/.bin/next start -p "${PORT:-3000}"
