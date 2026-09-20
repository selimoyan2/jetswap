#!/bin/sh
set -e

echo "🚀 JetSwap Container Startup..."

# Database migration: Apply all pending migrations before starting the application server.
# Container will fail-fast and exit if migration deploy fails.
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Running Prisma database migration (prisma migrate deploy)..."
  if command -v prisma >/dev/null 2>&1; then
    prisma migrate deploy
  else
    npx prisma migrate deploy
  fi
  echo "✅ Prisma database migration completed successfully."
fi

echo "✨ Starting Next.js Standalone Production Server on port ${PORT:-3000}..."
exec node server.js
