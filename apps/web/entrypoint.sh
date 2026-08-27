#!/bin/sh
set -e

echo "Running Prisma db push..."
node node_modules/prisma/build/index.js db push --accept-data-loss

echo "Generating Prisma client..."
node node_modules/prisma/build/index.js generate

echo "Starting Next.js server..."
exec node server.js
