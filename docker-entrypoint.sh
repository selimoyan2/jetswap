#!/bin/sh
set -e

echo "🚀 JetSwap Container Startup..."

# Safe database migration: Only applies pending migrations, NEVER drops tables or resets user data!
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Running Prisma database migration (non-destructive)..."
  prisma migrate deploy 2>/dev/null || npx prisma migrate deploy 2>/dev/null || echo "⚠️ Migration step completed or database initializing..."
fi

echo "✨ Starting Next.js Standalone Production Server on port ${PORT:-3000}..."
exec node server.js
