#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push

if [ ! -f /app/uploads/.seeded ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts
  touch /app/uploads/.seeded
  echo "Seed marked as done."
else
  echo "Database already seeded, skipping."
fi

echo "Starting server..."
exec node_modules/.bin/next start -p "${PORT:-3000}"
