#!/bin/sh
set -e

echo "Running Prisma db push..."
node node_modules/prisma/build/index.js db push --accept-data-loss

echo "Generating Prisma client..."
node node_modules/prisma/build/index.js generate

# Next.js 15.5+ in a pnpm workspace emits the standalone server.js inside a
# nested directory (e.g. apps/web/server.js) instead of the root of
# .next/standalone. Locate the real server.js and make sure public/ and
# .next/static are available next to it.
if [ -f apps/web/server.js ]; then
  echo "Found nested standalone server.js at apps/web/server.js"
  mkdir -p apps/web/.next
  if [ ! -e apps/web/.next/static ]; then
    ln -sfn /app/.next/static apps/web/.next/static
  fi
  if [ ! -e apps/web/public ]; then
    ln -sfn /app/public apps/web/public
  fi
  exec node apps/web/server.js
elif [ -f server.js ]; then
  echo "Found standalone server.js at root"
  exec node server.js
else
  echo "ERROR: Could not find Next.js standalone server.js" >&2
  find /app -name server.js -type f >&2
  exit 1
fi
