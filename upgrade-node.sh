#!/bin/bash
set -e

echo "=== Installing Node 22 ==="
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
npm --version

echo "=== Installing pnpm ==="
npm install -g pnpm

echo "=== Done ==="
